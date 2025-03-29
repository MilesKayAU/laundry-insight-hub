
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";

interface BrandVerificationsProps {
  verifications: ProductSubmission[];
  onApproveVerification: (productId: string) => void;
  onRejectVerification: (productId: string) => void;
}

const BrandVerifications: React.FC<BrandVerificationsProps> = ({
  verifications,
  onApproveVerification,
  onRejectVerification
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Verification Requests</CardTitle>
        <CardDescription>
          Review and approve brand ownership verification requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verifications.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.brandContactEmail || "N/A"}</TableCell>
                    <TableCell>
                      {product.brandOwnershipRequestDate ? 
                        new Date(product.brandOwnershipRequestDate).toLocaleDateString() : 
                        'Unknown date'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onApproveVerification(product.id)}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          title="Approve Verification"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onRejectVerification(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Reject Verification"
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
            No pending brand verification requests
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandVerifications;
