
import { Link } from "react-router-dom";
import { ProductSubmission } from "@/lib/textExtractor";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { ExternalLink, Info, LinkIcon } from "lucide-react";

interface ProductsListProps {
  products: ProductSubmission[];
  onOpenProductDetail: (product: ProductSubmission) => void;
}

const ProductsList = ({ products, onOpenProductDetail }: ProductsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          All products from this brand in our database
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>PVA Status</TableHead>
                  <TableHead>PVA %</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
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
                      {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'Unknown'}
                    </TableCell>
                    <TableCell>{product.country || 'Global'}</TableCell>
                    <TableCell>
                      {product.websiteUrl ? (
                        <a 
                          href={product.websiteUrl} 
                          target="_blank" 
                          rel="nofollow noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => onOpenProductDetail(product)}
                      >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No products available for this brand
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsList;
