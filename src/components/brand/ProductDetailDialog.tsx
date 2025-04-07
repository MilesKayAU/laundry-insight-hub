
import { ProductSubmission } from "@/lib/textExtractor";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { 
  getSafeExternalLinkProps, 
  isValidUrl, 
  formatSafeUrl,
  parseUrl,
  logProductUrlInfo
} from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ProductDetailDialogProps {
  product: ProductSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailDialog = ({ 
  product, 
  open, 
  onOpenChange 
}: ProductDetailDialogProps) => {
  const { toast } = useToast();
  
  if (!product) return null;
  
  // Enhanced logging for debugging
  console.log("ProductDetailDialog: Rendering product detail for:", product.name);
  logProductUrlInfo(product, "ProductDetailDialog");
  
  // Better URL validation and preparation - handle both property naming styles
  const websiteUrl = product.websiteUrl || product.websiteurl || '';
  const videoUrl = product.videoUrl || product.videourl || '';
  
  // Validate URLs
  const parsedWebsiteUrl = parseUrl(websiteUrl);
  const parsedVideoUrl = parseUrl(videoUrl);
  
  const hasValidWebsiteUrl = !!parsedWebsiteUrl;
  const hasValidVideoUrl = !!parsedVideoUrl;
  
  console.log("Product URL validation results:", {
    websiteUrl,
    hasValidWebsiteUrl,
    parsedWebsiteUrl,
    videoUrl,
    hasValidVideoUrl,
    parsedVideoUrl
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <DialogDescription>
            Detailed information about this product
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Brand</Label>
            <div className="col-span-3">{product.brand}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Product Type</Label>
            <div className="col-span-3">{product.type}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">PVA Status</Label>
            <div className="col-span-3">
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
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">PVA Percentage</Label>
            <div className="col-span-3">{product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'Unknown'}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Country</Label>
            <div className="col-span-3">{product.country || 'Global'}</div>
          </div>
          
          {product.description && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right font-medium pt-2">Description</Label>
              <div className="col-span-3">{product.description}</div>
            </div>
          )}
          
          {product.ingredients && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right font-medium pt-2">Ingredients</Label>
              <div className="col-span-3 break-words">{product.ingredients}</div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Product URL</Label>
            <div className="col-span-3">
              {hasValidWebsiteUrl ? (
                <a 
                  {...getSafeExternalLinkProps({ url: websiteUrl })}
                  className="text-blue-600 hover:underline flex items-center break-all"
                  onClick={() => {
                    console.log(`Clicked product URL: ${websiteUrl}`);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                  {websiteUrl}
                </a>
              ) : (
                <span className="text-muted-foreground">
                  {websiteUrl.trim() !== '' ? `Invalid product URL: ${websiteUrl}` : 'No product URL available'}
                </span>
              )}
            </div>
          </div>
          
          {hasValidVideoUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Video URL</Label>
              <div className="col-span-3">
                <a 
                  {...getSafeExternalLinkProps({ url: videoUrl })}
                  className="text-blue-600 hover:underline flex items-center break-all"
                  onClick={() => {
                    console.log(`Clicked video URL: ${videoUrl}`);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                  {videoUrl}
                </a>
              </div>
            </div>
          )}
          
          {product.imageUrl && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right font-medium pt-2">Product Image</Label>
              <div className="col-span-3">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="max-h-40 rounded-md object-contain"
                  onError={(e) => {
                    console.log("Image failed to load:", product.imageUrl);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          {hasValidWebsiteUrl && (
            <Button variant="outline" asChild>
              <a 
                {...getSafeExternalLinkProps({ url: websiteUrl })}
                onClick={() => {
                  console.log(`Navigating to product page: ${websiteUrl}`);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Product Page
              </a>
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
