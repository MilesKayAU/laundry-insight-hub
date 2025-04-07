
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
import { getSafeExternalLinkProps } from "@/lib/utils";

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
  if (!product) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
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
              {product.websiteUrl ? (
                <a 
                  {...getSafeExternalLinkProps({ url: product.websiteUrl })}
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {product.websiteUrl}
                </a>
              ) : (
                <span className="text-muted-foreground">No product URL available</span>
              )}
            </div>
          </div>
          
          {product.videoUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Video URL</Label>
              <div className="col-span-3">
                <a 
                  {...getSafeExternalLinkProps({ url: product.videoUrl })}
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {product.videoUrl}
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
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          {product.websiteUrl && (
            <Button variant="outline" asChild>
              <a 
                {...getSafeExternalLinkProps({ url: product.websiteUrl })}
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
