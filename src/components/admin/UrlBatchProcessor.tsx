
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, XCircle, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProcessingResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

const UrlBatchProcessor = () => {
  const { toast } = useToast();
  const [urlList, setUrlList] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');

  // Debug function to check if Supabase access is working correctly
  const checkSupabaseAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('id, name, brand, approved')
        .limit(5);
      
      if (error) {
        console.error("Error checking Supabase access:", error);
        return false;
      }
      
      console.log("Supabase access check - sample products:", data);
      return true;
    } catch (err) {
      console.error("Exception checking Supabase access:", err);
      return false;
    }
  };

  const processUrls = async () => {
    if (!urlList.trim()) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one URL to process.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First verify we can access Supabase correctly
      const canAccessSupabase = await checkSupabaseAccess();
      if (!canAccessSupabase) {
        toast({
          title: "Database access issue",
          description: "Cannot access product database properly. Please check your connection.",
          variant: "destructive"
        });
        return;
      }

      setIsProcessing(true);
      setResults([]);
      setProgress(0);

      // Split URLs and filter out empty lines
      const urls = urlList.split('\n').filter(url => url.trim() !== '');
      
      if (urls.length === 0) {
        toast({
          title: "No valid URLs",
          description: "No valid URLs were found in the input.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      toast({
        title: "Processing started",
        description: `Processing ${urls.length} URLs. This might take a while...`,
      });

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i].trim();
        setCurrentUrl(url);
        
        // Add to results as pending
        setResults(prev => [
          ...prev, 
          { url, status: 'pending' }
        ]);

        try {
          // Call the Supabase Edge function
          const { data, error } = await supabase.functions.invoke('scan-product-urls', {
            body: { url },
          });

          if (error) {
            console.error(`Error processing URL ${url}:`, error);
            setResults(prev => prev.map(r => 
              r.url === url ? { 
                ...r, 
                status: 'error', 
                message: `Failed to scan: ${error.message || 'Unknown error'}` 
              } : r
            ));
          } else if (data && data.status === 'success') {
            console.log(`Successfully processed URL ${url}:`, data);
            setResults(prev => prev.map(r => 
              r.url === url ? { 
                ...r, 
                status: 'success', 
                message: data.message || 'URL successfully processed'
              } : r
            ));

            // Display what was added
            if (data.productData) {
              toast({
                title: "Product detected",
                description: `Found: ${data.productData.brand} - ${data.productData.name}`,
              });
              
              // Force reload of products
              window.dispatchEvent(new Event('reload-products'));
            }
          } else {
            console.warn(`No product data found for URL ${url}:`, data);
            
            // Check if the product already exists but was just not added
            if (data && data.status === 'error' && data.message && data.message.includes('Product already exists')) {
              setResults(prev => prev.map(r => 
                r.url === url ? { 
                  ...r, 
                  status: 'success', 
                  message: data.message 
                } : r
              ));
              
              // Also notify if this is an already existing product
              if (data.productData) {
                toast({
                  title: "Product already exists",
                  description: `Found existing: ${data.productData.brand} - ${data.productData.name}`,
                });
              }
            } else {
              setResults(prev => prev.map(r => 
                r.url === url ? { 
                  ...r, 
                  status: 'error', 
                  message: data?.message || 'No product data found' 
                } : r
              ));
            }
          }
        } catch (err) {
          console.error(`Exception processing URL ${url}:`, err);
          setResults(prev => prev.map(r => 
            r.url === url ? { 
              ...r, 
              status: 'error', 
              message: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}` 
            } : r
          ));
        }

        // Update progress
        const newProgress = Math.round(((i + 1) / urls.length) * 100);
        setProgress(newProgress);
      }

      const successCount = results.filter(r => r.status === 'success').length;
      toast({
        title: "Processing complete",
        description: `Processed ${urls.length} URLs with ${successCount} successes.`,
      });

      // Force reload of products to ensure UI is updated with new additions
      window.dispatchEvent(new Event('reload-products'));
    } catch (error) {
      console.error("Error in batch processing:", error);
      toast({
        title: "Processing error",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setCurrentUrl('');
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'success':
        return "bg-green-100 text-green-800 border-green-200";
      case 'error':
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>URL Batch Processor</CardTitle>
          <CardDescription>
            Enter a list of product URLs, one per line, to automatically scan and add them to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-list">Product URLs</Label>
              <Textarea
                id="url-list"
                placeholder="https://example.com/product-1&#10;https://example.com/product-2&#10;..."
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
                disabled={isProcessing}
                rows={10}
              />
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{currentUrl}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Results</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 p-2 border-b last:border-b-0"
                    >
                      <div className="mt-1">{getStatusIcon(result.status)}</div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={() => openUrl(result.url)}
                            title="Open URL"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm break-all">{result.url}</p>
                        {result.message && (
                          <p className="text-xs text-muted-foreground">{result.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">
                    All products added from URL scanning start as pending items. Review them in the Pending Products tab before approving.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={processUrls} 
            disabled={isProcessing || !urlList.trim()}
            className="w-full"
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Process URLs'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UrlBatchProcessor;
