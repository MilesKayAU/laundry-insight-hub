
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Link as LinkIcon, Percent } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";

// Make sure the interface matches what's being used in AdminPage.tsx
export interface ProductDetails {
  description: string;
  imageUrl: string;
  videoUrl: string;
  websiteUrl: string;
  pvaPercentage: string; // Changed from optional to required to match the state in AdminPage
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
  if (!product) return null;

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
            <Input
              id="websiteUrl"
              placeholder="Enter website URL"
              value={details.websiteUrl}
              onChange={(e) => onDetailsChange({...details, websiteUrl: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pvaPercentage" className="text-right flex items-center gap-2">
              <Percent className="h-4 w-4" /> PVA Percentage
            </Label>
            <Input
              id="pvaPercentage"
              placeholder="PVA percentage (e.g. 25)"
              value={details.pvaPercentage || (product.pvaPercentage ? product.pvaPercentage.toString() : '')}
              onChange={(e) => onDetailsChange({...details, pvaPercentage: e.target.value})}
              className="col-span-3"
              type="number"
              min="0"
              max="100"
            />
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
