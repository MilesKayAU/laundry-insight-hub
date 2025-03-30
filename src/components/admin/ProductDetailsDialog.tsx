
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Link as LinkIcon, Percent, AlertCircle, MapPin, Search, Loader2 } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyProductUrl } from "@/lib/urlVerification";
import { useToast } from "@/hooks/use-toast";

// Make sure the interface matches what's being used in AdminPage.tsx
export interface ProductDetails {
  description: string;
  imageUrl: string;
  videoUrl: string;
  websiteUrl: string;
  pvaPercentage: string;
  country: string;
}

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductSubmission | null;
  details: ProductDetails;
  onDetailsChange: (details: ProductDetails) => void;
  onSave: () => void;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  details,
  onDetailsChange,
  onSave
}) => {
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    containsPva: boolean;
    message: string;
    ingredients?: string | null;
    detectedTerms?: string[];
  } | null>(null);

  if (!product) return null;

  const handleVerifyUrl = async () => {
    if (!details.websiteUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a product website URL to verify.",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyProductUrl(details.websiteUrl);
      
      setVerificationResult({
        containsPva: result.containsPva,
        message: result.message,
        ingredients: result.extractedIngredients,
        detectedTerms: result.detectedTerms
      });

      // If PVA was detected, update the product details
      if (result.containsPva && result.success) {
        onDetailsChange({
          ...details,
          pvaPercentage: "25" // Default percentage if detected
        });

        toast({
          title: "PVA Detected",
          description: "The product contains PVA ingredients. Details have been updated.",
          variant: "destructive"
        });
      } else if (result.success && !result.containsPva && result.extractedIngredients) {
        toast({
          title: "No PVA Detected",
          description: "No PVA ingredients were found in the product page.",
          variant: "default"
        });
      } else {
        toast({
          title: "Verification Incomplete",
          description: result.message,
          variant: "warning"
        });
      }
    } catch (error) {
      console.error("Error in URL verification:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify the product URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View and edit product information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand
            </Label>
            <Input
              id="brand"
              value={product.brand}
              className="col-span-3"
              readOnly
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Product Name
            </Label>
            <Input
              id="name"
              value={product.name}
              className="col-span-3"
              readOnly
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              value={details.description}
              onChange={(e) => onDetailsChange({...details, description: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country" className="text-right flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Country
            </Label>
            <Input
              id="country"
              placeholder="Enter country (e.g. United States, Australia)"
              value={details.country}
              onChange={(e) => onDetailsChange({...details, country: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right flex items-center gap-2">
              <Image className="h-4 w-4" /> Image URL
            </Label>
            <Input
              id="imageUrl"
              placeholder="Enter image URL"
              value={details.imageUrl}
              onChange={(e) => onDetailsChange({...details, imageUrl: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoUrl" className="text-right flex items-center gap-2">
              <Video className="h-4 w-4" /> Video URL
            </Label>
            <Input
              id="videoUrl"
              placeholder="Enter video URL"
              value={details.videoUrl}
              onChange={(e) => onDetailsChange({...details, videoUrl: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="websiteUrl" className="text-right flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Website URL
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="websiteUrl"
                placeholder="Enter website URL"
                value={details.websiteUrl}
                onChange={(e) => onDetailsChange({...details, websiteUrl: e.target.value})}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleVerifyUrl} 
                disabled={verifying}
                title="Verify URL for PVA ingredients"
                className="flex-shrink-0"
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {verificationResult && (
            <div className="col-span-4 mt-2">
              <Alert variant={verificationResult.containsPva ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {verificationResult.containsPva ? "PVA Detected" : "Verification Result"}
                </AlertTitle>
                <AlertDescription>
                  {verificationResult.message}
                  
                  {verificationResult.ingredients && (
                    <div className="mt-2">
                      <p className="font-semibold text-sm">Extracted Ingredients:</p>
                      <p className="text-xs mt-1 bg-background/50 p-2 rounded">
                        {verificationResult.ingredients}
                      </p>
                    </div>
                  )}
                  
                  {verificationResult.detectedTerms && verificationResult.detectedTerms.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-sm">Detected PVA Terms:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {verificationResult.detectedTerms.map(term => (
                          <Badge key={term} variant="outline" className="text-xs bg-red-100">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pvaPercentage" className="text-right flex items-center gap-2">
              <Percent className="h-4 w-4" /> PVA Percentage
            </Label>
            <div className="col-span-3">
              <Input
                id="pvaPercentage"
                placeholder="PVA percentage (e.g. 25)"
                value={details.pvaPercentage}
                onChange={(e) => onDetailsChange({...details, pvaPercentage: e.target.value})}
                className="col-span-3"
                type="number"
                min="0"
                max="100"
              />
              <Alert variant="warning" className="mt-2 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">
                  If no specific PVA percentage is known, a default value of 25% is used as an estimate.
                  This is because manufacturers often don't disclose exact PVA content.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pvaStatus" className="text-right">
              PVA Status
            </Label>
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
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={onSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
