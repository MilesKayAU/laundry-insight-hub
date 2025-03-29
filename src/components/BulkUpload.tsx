import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileUp, 
  Download, 
  AlertCircle, 
  Check, 
  X, 
  AlertTriangle,
  FileText
} from "lucide-react";
import { BulkProductData, parseCSV, processBulkUpload, getSampleCSVTemplate } from '@/lib/bulkUpload';

interface BulkUploadProps {
  onComplete: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    success: BulkProductData[];
    duplicates: BulkProductData[];
    errors: { item: BulkProductData; error: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
      
      // Show preview toast
      toast({
        title: "File loaded",
        description: `Successfully loaded ${file.name}. Review the content and click "Process CSV Data" to import.`,
      });
    };
    reader.readAsText(file);
  };

  const handleProcessData = () => {
    try {
      setIsProcessing(true);
      const parsedData = parseCSV(csvData);
      const result = processBulkUpload(parsedData);
      setResults(result);
      
      toast({
        title: "Upload processed",
        description: `Successfully added ${result.success.length} products. Found ${result.duplicates.length} duplicates and ${result.errors.length} errors.`,
        variant: result.success.length > 0 ? "default" : "destructive",
      });
      
      if (result.success.length > 0) {
        // If at least one product was added successfully, trigger refresh
        onComplete();
      }
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = getSampleCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pva_product_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setCsvData('');
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Extract first few lines of CSV for preview
  const csvPreview = csvData.split('\n').slice(0, 5).join('\n');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Upload Products</CardTitle>
        <CardDescription>
          Upload a CSV file with product information to add multiple products at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input 
                  id="csv-file" 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="csv-preview">CSV Content Preview</Label>
                {csvData && <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {csvData.split('\n').length - 1} rows detected
                </Badge>}
              </div>
              <Textarea 
                id="csv-preview" 
                placeholder="CSV data will appear here after file upload, or you can paste it directly"
                className="font-mono text-sm h-64"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleProcessData} 
                disabled={!csvData.trim() || isProcessing}
                className="flex items-center gap-2"
              >
                <FileUp className="h-4 w-4" />
                Process CSV Data
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={!csvData.trim() || isProcessing}
              >
                Clear
              </Button>
            </div>
            
            <Alert variant="default" className="bg-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Expected Format</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Your CSV should have the following columns:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Brand Name</strong> - Company or brand name (required)</li>
                  <li><strong>Product Name</strong> - Product name (required)</li>
                  <li><strong>Product Type</strong> - Must match exactly (e.g., "Laundry Sheets") (required)</li>
                  <li><strong>Has PVA</strong> - Enter "yes", "no", or leave blank for "unidentified" (optional)</li>
                  <li><strong>PVA Percentage (if known)</strong> - Numerical percentage (optional)</li>
                  <li><strong>Additional Notes</strong> - Product description, sources, etc. (optional)</li>
                  <li><strong>Country</strong> - Country or region where the product is available (optional, defaults to "Global")</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Duplicates are detected based on having the same Brand Name AND Product Name
                </p>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Tabs defaultValue="success" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="success">
                Success ({results.success.length})
              </TabsTrigger>
              <TabsTrigger value="duplicates">
                Duplicates ({results.duplicates.length})
              </TabsTrigger>
              <TabsTrigger value="errors">
                Errors ({results.errors.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="success" className="mt-4">
              {results.success.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>PVA Status</TableHead>
                      <TableHead>PVA %</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Country</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.success.map((item, index) => (
                      <TableRow key={`success-${index}`}>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          <Badge variant={item.pvaStatus === 'verified-free' ? 'outline' : 'secondary'} className={
                            item.pvaStatus === 'verified-free' ? 'bg-green-100 text-green-800' : 
                            item.pvaStatus === 'contains' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {item.pvaStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.pvaPercentage !== undefined ? `${item.pvaPercentage}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.additionalNotes || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.country || 'Global'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No products were successfully added
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="duplicates" className="mt-4">
              {results.duplicates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.duplicates.map((item, index) => (
                      <TableRow key={`duplicate-${index}`}>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell className="text-amber-600 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Product with same brand and name already exists
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No duplicate products found
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="errors" className="mt-4">
              {results.errors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.errors.map((item, index) => (
                      <TableRow key={`error-${index}`}>
                        <TableCell>{item.item.brand || "N/A"}</TableCell>
                        <TableCell>{item.item.name || "N/A"}</TableCell>
                        <TableCell className="text-red-600 flex items-center gap-2">
                          <X className="h-4 w-4" />
                          {item.error}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No errors encountered
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {results && (
          <Button onClick={resetForm} className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Upload Another File
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BulkUpload;
