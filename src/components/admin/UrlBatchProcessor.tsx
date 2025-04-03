
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ScanResult {
  url: string;
  success: boolean;
  productId?: string;
  error?: string;
  requiresReview?: boolean;
  productInfo?: {
    name: string;
    brand: string;
    pvaPercentage: number | null;
    pvaFound?: boolean;
  };
}

const UrlBatchProcessor: React.FC = () => {
  const [urlList, setUrlList] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urlList.trim()) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one URL to process.",
        variant: "destructive"
      });
      return;
    }
    
    // Parse URLs (simple split by newline and filter empty lines)
    const urls = urlList
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length === 0) {
      toast({
        title: "No valid URLs found",
        description: "Please enter valid URLs, one per line.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    try {
      console.log("Calling scan-product-urls edge function with URLs:", urls);
      
      // Set initial progress
      setProgress(10);
      
      // Call the Supabase Edge Function with better error handling
      const { data, error } = await supabase.functions.invoke('scan-product-urls', {
        body: { urls }
      });
      
      // Update progress
      setProgress(70);
      
      if (error) {
        console.error("Error invoking scan-product-urls function:", error);
        toast({
          title: "Processing Failed",
          description: "Failed to connect to the product scanning service. Please check your network connection and try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      if (!data) {
        console.error("No data returned from scan-product-urls function");
        toast({
          title: "Processing Failed",
          description: "The server returned an empty response. Please try again later.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      if (!data.success) {
        console.error("Processing failed:", data.error);
        toast({
          title: "Processing Failed",
          description: data.error || "Failed to process URLs. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      console.log("Processing results:", data.results);
      setResults(data.results);
      
      // Manually reload products to ensure the pending tab is updated
      // Add a slight delay to allow server processing to complete
      setTimeout(() => {
        // Dispatch an event to signal that products need to be reloaded
        window.dispatchEvent(new CustomEvent('reload-products'));
        
        setProgress(100);
        
        const successCount = data.results.filter((r: ScanResult) => r.success).length;
        const reviewCount = data.results.filter((r: ScanResult) => r.success && r.requiresReview).length;
        
        toast({
          title: "Processing Complete",
          description: `Successfully processed ${successCount} out of ${urls.length} URLs. ${reviewCount} products need manual verification.`,
          variant: "default"
        });
        
        // Add an additional message specifically about pending queue
        if (successCount > 0) {
          setTimeout(() => {
            toast({
              title: "Products Added to Pending Queue",
              description: "Please switch to the Pending Products tab to review the new submissions.",
              variant: "default"
            });
          }, 1000);
        }
      }, 1500);
      
    } catch (error) {
      console.error("Error processing URLs:", error);
      toast({
        title: "Processing Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrlList(e.target.value);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Batch Process Product URLs</CardTitle>
        <CardDescription>
          Paste a list of product URLs (one per line) to automatically extract PVA information and add them to the pending queue.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="https://example.com/product1&#10;https://example.com/product2&#10;https://example.com/product3"
            value={urlList}
            onChange={handleTextAreaChange}
            className="min-h-[200px] font-mono text-sm"
            disabled={isProcessing}
          />
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processing URLs...</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isProcessing || !urlList.trim()}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process URLs"
              )}
            </Button>
          </div>
        </form>
        
        {results.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Results</h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {results.map((result, index) => (
                <Alert 
                  key={index} 
                  variant={result.success ? "default" : "destructive"}
                  className={result.success 
                    ? (result.requiresReview ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200")
                    : "bg-red-50 border-red-200"
                  }
                >
                  {result.success ? (
                    result.requiresReview 
                      ? <Info className="h-4 w-4 text-yellow-600" /> 
                      : <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle className="text-sm font-semibold">
                    {result.url}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {result.success ? (
                      <span>
                        Added {result.productInfo?.brand} {result.productInfo?.name}
                        {result.requiresReview 
                          ? " (Needs manual verification)" 
                          : result.productInfo?.pvaPercentage !== null 
                            ? ` with ${result.productInfo?.pvaPercentage}% PVA` 
                            : " (No PVA percentage available)"
                        }
                      </span>
                    ) : (
                      <span className="text-red-600">{result.error || "Failed to process URL"}</span>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>
          Note: All products will be added to the pending queue and need admin approval before appearing in the database.
          Products where PVA content could not be determined will be flagged for manual review.
        </p>
      </CardFooter>
    </Card>
  );
};

export default UrlBatchProcessor;
