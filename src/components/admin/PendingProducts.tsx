
import React, { useState, useEffect, useCallback } from 'react';
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
import { CheckCircle, XCircle, Search, Edit, RefreshCw } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";
import { useToast } from "@/hooks/use-toast";
import { forceProductRefresh } from "@/utils/supabaseUtils";

interface PendingProductsProps {
  products: ProductSubmission[];
  onViewDetails: (product: ProductSubmission) => void;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  onVerify?: (product: ProductSubmission) => void;
}

const PendingProducts: React.FC<PendingProductsProps> = ({ 
  products, 
  onViewDetails, 
  onApprove, 
  onReject,
  onVerify 
}) => {
  const { toast } = useToast();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [localProducts, setLocalProducts] = useState<ProductSubmission[]>([]);
  
  // Update local products when parent products change
  useEffect(() => {
    console.log(`PendingProducts: Received ${products.length} products from parent`);
    setLocalProducts(products);
  }, [products]);
  
  // Add event listener for product cache invalidation
  useEffect(() => {
    const handleInvalidateCache = () => {
      console.log("PendingProducts: Cache invalidation event received");
      handleForceRefresh();
    };
    
    window.addEventListener('invalidate-product-cache', handleInvalidateCache);
    window.addEventListener('reload-products', () => {
      console.log("PendingProducts: reload-products event received");
    });
    
    // Auto-refresh on a timer
    const refreshInterval = setInterval(() => {
      console.log("PendingProducts: Auto-refresh triggered");
      handleForceRefresh();
    }, 60 * 1000); // Every 60 seconds
    
    return () => {
      window.removeEventListener('invalidate-product-cache', handleInvalidateCache);
      window.removeEventListener('reload-products', () => {});
      clearInterval(refreshInterval);
    };
  }, []);
  
  const handleForceRefresh = useCallback(() => {
    setRefreshing(true);
    console.log("PendingProducts: Force refresh triggered");
    
    try {
      forceProductRefresh();
      window.dispatchEvent(new Event('reload-products'));
    } catch (e) {
      console.error("Error during refresh:", e);
    }
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleEdit = (product: ProductSubmission) => {
    console.log("Edit button clicked for product:", product);
    setEditingProductId(product.id);
    
    // Ensure required fields have defaults
    const enhancedProduct = {
      ...product,
      type: product.type || 'Detergent',
      description: product.description || 'This product may contain PVA according to customers - please verify'
    };
    
    console.log("Calling onViewDetails with enhanced product:", enhancedProduct);
    onViewDetails(enhancedProduct);
  };

  const handleVerify = (product: ProductSubmission) => {
    if (!product.websiteUrl) {
      toast({
        title: "No URL available",
        description: "This product doesn't have a website URL to verify",
        variant: "destructive"
      });
      return;
    }

    console.log("Verifying product URL:", product.websiteUrl);
    if (onVerify) {
      onVerify(product);
    } else {
      toast({
        title: "URL Verification",
        description: `Opening ${product.brand} ${product.name} website for verification`,
      });
      window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleApprove = (productId: string) => {
    onApprove(productId);
    setLocalProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  const handleReject = (productId: string) => {
    onReject(productId);
    setLocalProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            Review and approve user-submitted product information
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleForceRefresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
        {localProducts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>PVA Status</TableHead>
                  <TableHead>PVA %</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-[115%] font-medium">{product.brand}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.type || 'Detergent'}</TableCell>
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
                      {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {product.submittedAt ? 
                        new Date(product.submittedAt).toLocaleDateString() : 
                        product.dateSubmitted ? 
                          new Date(product.dateSubmitted).toLocaleDateString() : 
                          product.timestamp ?
                            new Date(product.timestamp).toLocaleDateString() :
                            'Unknown date'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                          className={`text-blue-500 hover:text-blue-700 flex items-center gap-1 ${editingProductId === product.id ? 'bg-blue-100' : ''}`}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        
                        {product.websiteUrl && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleVerify(product)}
                            title="Verify Website"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleApprove(product.id)}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleReject(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No pending submissions to review
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingProducts;
