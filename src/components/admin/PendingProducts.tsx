
import React from 'react';
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
import { CheckCircle, XCircle, Eye, Search } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";

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
  // Log how many pending products we have for debugging
  console.log(`PendingProducts component received ${products.length} pending products`);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Submissions</CardTitle>
        <CardDescription>
          Review and approve user-submitted product information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
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
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-[115%] font-medium">{product.brand}</TableCell>
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
                          variant="ghost" 
                          size="icon"
                          onClick={() => onViewDetails(product)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        
                        {onVerify && product.websiteUrl && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onVerify(product)}
                            title="Verify Website"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onApprove(product.id)}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onReject(product.id)}
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
