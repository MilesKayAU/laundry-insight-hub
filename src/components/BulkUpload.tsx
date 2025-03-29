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
  FileText,
  HelpCircle,
  Info
} from "lucide-react";
import { BulkProductData, parseCSV, processBulkUpload, getSampleCSVTemplate } from '@/lib/bulkUpload';

interface BulkUploadProps {
  onComplete: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [headerWarning, setHeaderWarning] = useState<string | null>(null);
  const [results, setResults] = useState<{
    success: BulkProductData[];
    duplicates: BulkProductData[];
    errors: { item: BulkProductData; error: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setParseError(null);
    setHeaderWarning(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file (.csv)",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
      
      const firstLine = content.split('\n')[0].toLowerCase();
      
      if (firstLine.startsWith('"brand') || firstLine.includes('"brand name"')) {
        toast({
          title: "File loaded",
          description: `Successfully loaded ${file.name}. Review the content and click "Process CSV Data" to import.`,
        });
      } else {
        setHeaderWarning("Your CSV headers might not match our template. Please ensure you have Brand Name, Product Name, and Product Type columns.");
        toast({
          title: "File loaded - check headers",
          description: "File loaded, but headers might not match our template. Please review.",
          variant: "warning",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const handleProcessData = () => {
    try {
      setIsProcessing(true);
      setParseError(null);
      setHeaderWarning(null);
      
      if (!csvData.trim()) {
        toast({
          title: "No data",
          description: "Please upload or paste CSV data before processing.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      if (!csvData.includes(',') && !csvData.includes(';')) {
        setParseError("Invalid CSV format. The file must use commas or semicolons as separators.");
        throw new Error("Invalid CSV format");
      }
      
      console.log("Processing CSV data:", csvData.substring(0, 300) + "...");
      
      const parsedData = parseCSV(csvData);
      console.log("Parsed data:", parsedData.length, "rows");
      
      if (parsedData.length === 0) {
        setParseError("No valid data rows found in the CSV. Please check the format and try again.");
        throw new Error("No valid data rows");
      }
      
      const result = processBulkUpload(parsedData);
      setResults(result);
      
      if (result.success.length === 0 && (result.errors.length > 0 || result.duplicates.length > 0)) {
        toast({
          title: "Upload issues",
          description: `Found ${result.duplicates.length} duplicates and ${result.errors.length} errors. No new products were added.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload processed",
          description: `Successfully added ${result.success.length} products for review. Found ${result.duplicates.length} duplicates and ${result.errors.length} errors.`,
          variant: result.success.length > 0 ? "default" : "destructive",
        });
      }
      
      if (result.success.length > 0) {
        onComplete();
      }
    } catch (error) {
      console.error("CSV processing error:", error);
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
    
    toast({
      title: "Template downloaded",
      description: "CSV template has been downloaded. Use this format for your data.",
    });
  };

  const resetForm = () => {
    setCsvData('');
    setResults(null);
    setParseError(null);
    setHeaderWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Upload Products</CardTitle>
        <CardDescription>
          Upload a CSV file with product information to add multiple products for review
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 w-full">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="flex-grow"
                  />
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                    className="whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>
              </div>
            </div>
            
            {headerWarning && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">CSV Header Warning</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {headerWarning}<br/>
                  <span className="text-xs mt-1 block">If your file uses different header names, the system will try to match them based on common variations.</span>
                </AlertDescription>
              </Alert>
            )}
            
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
                onChange={(e) => {
                  setCsvData(e.target.value);
                  setParseError(null);
                  setHeaderWarning(null);
                }}
              />
              
              {parseError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error in CSV data</AlertTitle>
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleProcessData} 
                disabled={!csvData.trim() || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    Process CSV Data
                  </>
                )}
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
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Expected Format</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Your CSV should have the following columns:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Brand Name</strong> - Company or brand name (required)</li>
                  <li><strong>Product Name</strong> - Product name (required)</li>
                  <li><strong>Product Type</strong> - Must match exactly (e.g., "Laundry Sheets") (required)</li>
                  <li><strong>Ingredients</strong> - Full ingredients list (recommended for automatic PVA detection)</li>
                  <li><strong>PVA Percentage (if known)</strong> - Numerical percentage (optional)</li>
                  <li><strong>Additional Notes</strong> - Product description, sources, etc. (optional)</li>
                  <li><strong>Country</strong> - Country or region where the product is available (optional, defaults to "Global")</li>
                </ul>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <p>Note: The column headers can be flexible (e.g., "Brand", "Brand Name", "Company", etc.)</p>
                  <p>Tip: Download the template for a properly formatted example</p>
                  <p className="font-semibold mt-1">When exporting from Excel or Google Sheets, headers may be automatically enclosed in quotes - this is okay!</p>
                </div>
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
                <>
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Products Pending Approval</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      The uploaded products require admin approval before appearing in the database. 
                      They will be available in the "Pending Approval" tab.
                    </AlertDescription>
                  </Alert>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>PVA Status</TableHead>
                        <TableHead>PVA %</TableHead>
                        <TableHead>Ingredients</TableHead>
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
                            {item.ingredients || 'N/A'}
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
                </>
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
