
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
import { 
  getSafeExternalLinkProps, 
  isValidUrl, 
  formatUrlForDisplay, 
  formatSafeUrl,
  logProductUrlInfo
} from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ProductsListProps {
  products: ProductSubmission[];
  onOpenProductDetail: (product: ProductSubmission) => void;
}

const ProductsList = ({ products, onOpenProductDetail }: ProductsListProps) => {
  const { toast } = useToast();
  
  // Enhanced logging for debugging
  console.log(`ProductsList: Rendering ${products.length} products`);
  
  // Debug each product's URL data
  products.forEach(product => logProductUrlInfo(product, "ProductsList"));

  return (
    <Card className="shadow-lg">
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
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">PVA Status</TableHead>
                  <TableHead className="font-semibold">PVA %</TableHead>
                  <TableHead className="font-semibold">Country</TableHead>
                  <TableHead className="font-semibold">URL</TableHead>
                  <TableHead className="font-semibold">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  // Check if URL is valid and format it
                  const hasWebsiteUrl = product.websiteUrl && product.websiteUrl.trim() !== '';
                  const websiteUrl = hasWebsiteUrl ? product.websiteUrl : '';
                  const isUrlValid = hasWebsiteUrl && isValidUrl(websiteUrl);
                  
                  // More detailed logging for URLs
                  console.log(`Rendering product URL for "${product.name}":`, {
                    hasWebsiteUrl,
                    websiteUrl,
                    isUrlValid,
                    formattedUrl: isUrlValid ? formatSafeUrl(websiteUrl) : 'Invalid URL'
                  });
                  
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
                        {isUrlValid ? (
                          <a 
                            {...getSafeExternalLinkProps({ url: websiteUrl })}
                            className="text-blue-600 hover:underline flex items-center"
                            onClick={() => {
                              console.log(`Clicking URL: ${websiteUrl}`);
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0" />
                            {formatUrlForDisplay(websiteUrl)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {hasWebsiteUrl ? `Invalid URL: ${websiteUrl}` : 'None'}
                          </span>
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
          <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-md border">
            <p className="text-lg font-medium">No products available for this brand</p>
            <p className="mt-2 text-sm">Products may be pending verification or not yet in our database.</p>
            <Link to="/contribute" className="mt-4 inline-block">
              <Button variant="outline" size="sm" className="mt-2">
                Contribute Product Data
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsList;
