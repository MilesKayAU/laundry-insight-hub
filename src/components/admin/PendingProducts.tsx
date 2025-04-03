
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
import { CheckCircle, XCircle, Search, Edit, RefreshCw, Trash, Loader2 } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface PendingProductsProps {
  products: ProductSubmission[];
  onViewDetails: (product: ProductSubmission) => void;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  onVerify?: (product: ProductSubmission) => void;
  onDelete?: (productId: string) => void;
  deletingProductId?: string | null;
}

const PendingProducts: React.FC<PendingProductsProps> = ({ 
  products, 
  onViewDetails, 
  onApprove, 
  onReject,
  onVerify,
  onDelete,
  deletingProductId
}) => {
  const { toast } = useToast();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [localProducts, setLocalProducts] = useState<ProductSubmission[]>([]);
  const refreshTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    console.log(`PendingProducts: Received ${products.length} products from parent`);
    setLocalProducts(products);
  }, [products]);
  
  // Enhanced force refresh with debouncing and timeout
  const handleForceRefresh = useCallback(() => {
    if (refreshing) {
      console.log("Refresh already in progress, ignoring");
      return;
    }
    
    setRefreshing(true);
    console.log("PendingProducts: Force refresh triggered");
    
    // Clear any pending timeouts
    clearTimeout(refreshTimeoutRef.current);
    
    // Dispatch the reload event
    try {
      window.dispatchEvent(new Event('reload-products'));
    } catch (e) {
      console.error("Error during refresh event dispatch:", e);
    }
    
    // End refreshing state after a short delay
    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshing]);
  
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts when component unmounts
      clearTimeout(refreshTimeoutRef.current);
    };
  }, []);
  
  const handleEdit = (product: ProductSubmission) => {
    // Abort if delete is in progress
    if (deletingProductId !== null) {
      console.log("Edit canceled: Delete operation in progress");
      return;
    }
    
    console.log("Edit button clicked for product:", product);
    setEditingProductId(product.id);
    
    const enhancedProduct = {
      ...product,
      type: product.type || 'Detergent',
      description: product.description || 'This product may contain PVA according to customers - please verify'
    };
    
    console.log("Calling onViewDetails with enhanced product:", enhancedProduct);
    onViewDetails(enhancedProduct);
  };

  const handleVerify = (product: ProductSubmission) => {
    // Abort if delete is in progress
    if (deletingProductId !== null) {
      console.log("Verify canceled: Delete operation in progress");
      return;
    }
    
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
  
  // Modified handlers to avoid direct UI updates (parent component should handle that)
  const handleApprove = (productId: string) => {
    // Abort if delete is in progress
    if (deletingProductId !== null) {
      toast({
        title: "Action in Progress",
        description: "Please wait for the current operation to complete.",
        variant: "warning"
      });
      return;
    }
    
    try {
      onApprove(productId);
    } catch (error) {
      console.error("Error during approval:", error);
      
      toast({
        title: "Approval Failed",
        description: "Failed to approve the product. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleReject = (productId: string) => {
    // Abort if delete is in progress
    if (deletingProductId !== null) {
      toast({
        title: "Action in Progress",
        description: "Please wait for the current operation to complete.",
        variant: "warning"
      });
      return;
    }
    
    try {
      onReject(productId);
    } catch (error) {
      console.error("Error during rejection:", error);
      
      toast({
        title: "Rejection Failed",
        description: "Failed to reject the product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (productId: string) => {
    // Abort if delete is already in progress
    if (deletingProductId !== null) {
      toast({
        title: "Delete in Progress",
        description: "Please wait for the current delete operation to complete.",
        variant: "warning"
      });
      return;
    }
    
    // Call the parent's delete handler
    if (onDelete) {
      onDelete(productId);
    }
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
          disabled={refreshing || deletingProductId !== null}
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
                  <TableRow key={product.id} className={deletingProductId === product.id ? 'opacity-50' : ''}>
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
                          disabled={deletingProductId === product.id || deletingProductId !== null}
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
                            disabled={deletingProductId === product.id || deletingProductId !== null}
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
                          disabled={deletingProductId === product.id || deletingProductId !== null}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleReject(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Reject"
                          disabled={deletingProductId === product.id || deletingProductId !== null}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                          disabled={deletingProductId !== null}
                        >
                          {deletingProductId === product.id ? (
                            <Spinner size="sm" />
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
