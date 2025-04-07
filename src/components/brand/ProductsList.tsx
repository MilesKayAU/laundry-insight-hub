
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
import { getSafeExternalLinkProps, isValidUrl } from "@/lib/utils";

interface ProductsListProps {
  products: ProductSubmission[];
  onOpenProductDetail: (product: ProductSubmission) => void;
}

const ProductsList = ({ products, onOpenProductDetail }: ProductsListProps) => {
  // Function to truncate URL for display
  const truncateUrl = (url: string) => {
    if (!url || url.trim() === '') return '';
    
    // Log URLs to help debug missing links
    console.log("Processing URL for display:", url);
    
    try {
      // Make sure URL has protocol
      let processedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        processedUrl = `https://${url}`;
      }
      
      const urlObj = new URL(processedUrl);
      let displayUrl = urlObj.hostname;
      if (urlObj.pathname !== '/' && urlObj.pathname.length > 1) {
        displayUrl += urlObj.pathname.length > 15 
          ? urlObj.pathname.substring(0, 15) + '...' 
          : urlObj.pathname;
      }
      return displayUrl;
    } catch (e) {
      console.warn("Error parsing URL:", url, e);
      // If URL parsing fails, just return a shortened version of the original
      return url.length > 25 ? url.substring(0, 25) + '...' : url;
    }
  };

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
                  // Debug log for each product's website URL
                  console.log(`Rendering product ${product.name}, URL: [${product.websiteUrl}], Valid: ${isValidUrl(product.websiteUrl)}`);
                  
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
                        {isValidUrl(product.websiteUrl) ? (
                          <a 
                            {...getSafeExternalLinkProps({ url: product.websiteUrl })}
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0" />
                            {truncateUrl(product.websiteUrl)}
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
