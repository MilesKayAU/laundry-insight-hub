import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  Trash, 
  Search, 
  Upload, 
  Eraser, 
  ChevronUp, 
  ChevronDown, 
  Globe, 
  BarChart, 
  ExternalLink, 
  Check, 
  X, 
  Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ProductSubmission } from "@/lib/textExtractor";
import { verifyProductUrl } from "@/lib/urlVerification";
import { useToast } from "@/hooks/use-toast";
import DataCharts from "@/components/DataCharts";
import { Spinner } from "@/components/ui/spinner";

interface ApprovedProductsProps {
  products: ProductSubmission[];
  filteredProducts: ProductSubmission[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onViewDetails: (product: ProductSubmission) => void;
  onDelete: (productId: string) => void;
  onBulkUpload: () => void;
  showCleanupDialog: boolean;
  setShowCleanupDialog: (show: boolean) => void;
  onCleanDuplicates: () => void;
  deletingProductId?: string | null;
}

const ApprovedProducts: React.FC<ApprovedProductsProps> = ({
  products,
  filteredProducts,
  searchTerm,
  onSearchChange,
  onViewDetails,
  onDelete,
  onBulkUpload,
  showCleanupDialog,
  setShowCleanupDialog,
  onCleanDuplicates,
  deletingProductId
}) => {
  const { toast } = useToast();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [chartView, setChartView] = useState(false);
  const [verifyingProductId, setVerifyingProductId] = useState<string | null>(null);
  const [manualVerificationProduct, setManualVerificationProduct] = useState<ProductSubmission | null>(null);
  const [showManualVerificationDialog, setShowManualVerificationDialog] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const brandA = a.brand.toLowerCase();
    const brandB = b.brand.toLowerCase();
    
    if (sortDirection === 'asc') {
      return brandA.localeCompare(brandB);
    } else {
      return brandB.localeCompare(brandA);
    }
  });
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleVerifyProduct = async (product: ProductSubmission) => {
    if (!product.websiteUrl) {
      toast({
        title: "Missing URL",
        description: "This product doesn't have a website URL to verify.",
        variant: "destructive"
      });
      return;
    }

    setVerifyingProductId(product.id);
    
    try {
      const result = await verifyProductUrl(product.websiteUrl);
      
      if (result.success) {
        if (result.containsPva) {
          toast({
            title: "PVA Detected",
            description: `Found ${result.detectedTerms.join(", ")} in the product page.`,
            variant: "default"
          });
        } else if (result.extractedIngredients) {
          toast({
            title: "Manual Verification Required",
            description: "No definitive PVA found. Ingredients were detected but require manual verification.",
            variant: "warning"
          });
          
          setManualVerificationProduct(product);
          setVerificationUrl(product.websiteUrl);
          setShowManualVerificationDialog(true);
        } else {
          toast({
            title: "Manual Verification Required",
            description: "Could not determine PVA status from the website. Manual verification needed.",
            variant: "warning"
          });
          
          setManualVerificationProduct(product);
          setVerificationUrl(product.websiteUrl);
          setShowManualVerificationDialog(true);
        }
        
        if (result.extractedIngredients) {
          toast({
            title: "Extracted Ingredients",
            description: result.extractedIngredients,
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying product:", error);
      toast({
        title: "Verification Error",
        description: "An error occurred while verifying the product.",
        variant: "destructive"
      });
    } finally {
      setVerifyingProductId(null);
    }
  };

  const openProductInNewTab = () => {
    if (verificationUrl) {
      window.open(verificationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleManualVerification = (containsPva: boolean) => {
    if (!manualVerificationProduct) return;
    
    if (containsPva) {
      toast({
        title: "Product Marked as Containing PVA",
        description: "The product has been manually verified to contain PVA.",
        variant: "default"
      });
    } else {
      toast({
        title: "Product Marked as PVA-Free",
        description: "The product has been manually verified to be PVA-free.",
        variant: "default"
      });
    }
    
    setShowManualVerificationDialog(false);
    setManualVerificationProduct(null);
    setVerificationUrl(null);
  };
  
  const handleDelete = (productId: string) => {
    if (deletingProductId !== null) {
      toast({
        title: "Delete in Progress",
        description: "Please wait for the current delete operation to complete.",
        variant: "warning"
      });
      return;
    }
    
    if (onDelete) {
      onDelete(productId);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Approved Products</CardTitle>
            <CardDescription>
              All products that have been approved and are displayed in the database
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Button 
              onClick={onBulkUpload}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  title="Remove duplicate products"
                >
                  <Eraser className="h-4 w-4" />
                  Clean Duplicates
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clean Duplicate Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will scan the database and remove any duplicate products, keeping only the most recently added version of each product. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onCleanDuplicates}>
                    Clean Duplicates
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button 
              variant={chartView ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartView(true)}
              className="hidden md:flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              Chart View
            </Button>
            <Button 
              variant={!chartView ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartView(false)}
              className="hidden md:flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              Table View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.length > 0 ? (
          <>
            {chartView ? (
              <DataCharts products={products} />
            ) : (
              <div className="rounded-md border mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button 
                          onClick={toggleSortDirection} 
                          className="flex items-center focus:outline-none hover:text-blue-600 transition-colors"
                        >
                          Brand
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>PVA Status</TableHead>
                      <TableHead>PVA %</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product) => (
                      <TableRow key={product.id} className={deletingProductId === product.id ? "opacity-50" : ""}>
                        <TableCell className="text-[115%] font-medium">
                          {product.brand}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.type}</TableCell>
                        <TableCell>
                          {product.pvaStatus === 'contains' && (
                            <Badge variant="destructive">Contains PVA</Badge>
                          )}
                          {product.pvaStatus === 'verified-free' && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Verified Free</Badge>
                          )}
                          {product.pvaStatus === 'needs-verification' && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Needs Verification</Badge>
                          )}
                          {product.pvaStatus === 'inconclusive' && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">Inconclusive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.pvaPercentage ? `${product.pvaPercentage}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onViewDetails(product)}
                              disabled={deletingProductId !== null}
                              title="Edit Details"
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {product.websiteUrl && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleVerifyProduct(product)}
                                  disabled={verifyingProductId === product.id || deletingProductId !== null}
                                  title="Verify Product URL"
                                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Globe className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setVerificationUrl(product.websiteUrl);
                                    setManualVerificationProduct(product);
                                    setShowManualVerificationDialog(true);
                                  }}
                                  disabled={deletingProductId !== null}
                                  title="Manual Verification"
                                  className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingProductId !== null}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              {deletingProductId === product.id ? (
                                <Spinner size="sm" color="danger" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No approved products in the database
          </div>
        )}
      </CardContent>

      <AlertDialog open={showManualVerificationDialog} onOpenChange={setShowManualVerificationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manual Product Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Automatic verification was inconclusive. Please visit the product page and manually verify if it contains PVA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-sm">
              <span className="font-semibold">Product:</span> {manualVerificationProduct?.brand} - {manualVerificationProduct?.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">URL:</span> {verificationUrl}
            </p>
            
            <Button
              onClick={openProductInNewTab}
              className="w-full flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Product Page in New Tab
            </Button>
            
            <div className="border-t pt-4 text-sm text-muted-foreground">
              After reviewing the product page, please indicate whether the product contains PVA:
            </div>
          </div>
          
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleManualVerification(false)}
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                PVA Free
              </div>
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleManualVerification(true)}
            >
              <div className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Contains PVA
              </div>
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ApprovedProducts;
