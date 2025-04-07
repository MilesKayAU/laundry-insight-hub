
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
import { ExternalLink, Info } from "lucide-react";
import { getSafeExternalLinkProps, isValidUrl, formatUrlForDisplay, normalizeBrandName } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ProductsListProps {
  products: ProductSubmission[];
  onOpenProductDetail: (product: ProductSubmission) => void;
}

const ProductsList = ({ products, onOpenProductDetail }: ProductsListProps) => {
  const { toast } = useToast();
  
  // Enhanced logging for debugging
  console.log(`ProductsList: Rendering ${products.length} products with full details`);
  console.log(`Raw products data:`, JSON.stringify(products, null, 2));
  
  // Deep debug for each product's data
  products.forEach(p => {
    console.log(`Product Details - Name: ${p.name}, Brand: "${p.brand}", WebsiteURL: "${p.websiteUrl}"`);
    // Log only if a website URL exists
    if (p.websiteUrl) {
      console.log(`URL validation for ${p.name}: ${isValidUrl(p.websiteUrl)}`);
    }
  });

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
          <div className="rounded-md border overflow-x-auto">
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
                {products.map((product) => {
                  // Enhanced debugging for URL handling
                  const rawUrl = product.websiteUrl || '';
                  const hasValidUrl = isValidUrl(rawUrl);
                  
                  console.log(`Product ${product.name} URL processing:`);
                  console.log(`- Raw URL: "${rawUrl}"`);
                  console.log(`- URL empty: ${!rawUrl || rawUrl.trim() === ''}`);
                  console.log(`- URL has protocol: ${rawUrl.startsWith('http')}`);
                  console.log(`- URL is valid: ${hasValidUrl}`);
                  
                  return (
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
                        {hasValidUrl ? (
                          <a 
                            {...getSafeExternalLinkProps({ url: rawUrl })}
                            className="text-blue-600 hover:underline flex items-center"
                            onClick={() => {
                              console.log(`Clicked URL for ${product.name}: ${rawUrl}`);
                              if (!hasValidUrl) {
                                toast({
                                  title: "Invalid URL",
                                  description: "This product doesn't have a valid website URL.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0" />
                            {formatUrlForDisplay(rawUrl)}
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
                          onClick={() => {
                            console.log(`Opening detail dialog for ${product.name}`);
                            onOpenProductDetail(product);
                          }}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
