
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSubmission } from "@/lib/textExtractor";
import { Loader2 } from "lucide-react";

// Define product details interface separately to avoid circular references
interface ProductDetails {
  description: string;
  imageUrl: string;
  videoUrl: string;
  websiteUrl: string;
  pvaPercentage: string;
  country: string;
  ingredients: string;
  pvaStatus: string;
  type: string;
}

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductSubmission | null;
  details: ProductDetails;
  onDetailsChange: (details: Partial<ProductDetails>) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  details,
  onDetailsChange,
  onSave,
  isSaving = false
}) => {
  // Ensure the form captures the selected values correctly
  useEffect(() => {
    if (product && isOpen) {
      console.log("Product details dialog opened with product:", product);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving product details:", details);
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product Details</DialogTitle>
            <DialogDescription>
              Make changes to the product information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Brand
              </Label>
              <div className="col-span-3">
                <Input 
                  id="brand" 
                  value={product.brand || ""} 
                  disabled 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input 
                  id="name" 
                  value={product.name || ""} 
                  disabled 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select 
                  value={details.type} 
                  onValueChange={(value) => onDetailsChange({ type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Product Types</SelectLabel>
                      <SelectItem value="Laundry Pod">Laundry Pod</SelectItem>
                      <SelectItem value="Dishwasher Pod">Dishwasher Pod</SelectItem>
                      <SelectItem value="Laundry Sheet">Laundry Sheet</SelectItem>
                      <SelectItem value="Dishwasher Sheet">Dishwasher Sheet</SelectItem>
                      <SelectItem value="Cleaning Sheet">Cleaning Sheet</SelectItem>
                      <SelectItem value="Detergent">Detergent</SelectItem>
                      <SelectItem value="Dish Soap">Dish Soap</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pvaStatus" className="text-right">
                PVA Status
              </Label>
              <div className="col-span-3">
                <Select 
                  value={details.pvaStatus} 
                  onValueChange={(value: any) => onDetailsChange({ pvaStatus: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select PVA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contains PVA</SelectItem>
                    <SelectItem value="verified-free">Verified PVA Free</SelectItem>
                    <SelectItem value="needs-verification">Needs Verification</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pvaPercentage" className="text-right">
                PVA %
              </Label>
              <div className="col-span-3">
                <Input 
                  id="pvaPercentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  placeholder="e.g. 25.5" 
                  value={details.pvaPercentage} 
                  onChange={(e) => onDetailsChange({ pvaPercentage: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <div className="col-span-3">
                <Input 
                  id="country" 
                  placeholder="e.g. USA, UK, Global" 
                  value={details.country} 
                  onChange={(e) => onDetailsChange({ country: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <div className="col-span-3">
                <Textarea 
                  id="description" 
                  className="min-h-[100px]" 
                  placeholder="Product description" 
                  value={details.description} 
                  onChange={(e) => onDetailsChange({ description: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="ingredients" className="text-right pt-2">
                Ingredients
              </Label>
              <div className="col-span-3">
                <Textarea 
                  id="ingredients" 
                  className="min-h-[100px]" 
                  placeholder="Product ingredients" 
                  value={details.ingredients || ''} 
                  onChange={(e) => onDetailsChange({ ingredients: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="websiteUrl" className="text-right">
                Website URL
              </Label>
              <div className="col-span-3">
                <Input 
                  id="websiteUrl" 
                  placeholder="e.g. https://example.com/product" 
                  value={details.websiteUrl} 
                  onChange={(e) => onDetailsChange({ websiteUrl: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image URL
              </Label>
              <div className="col-span-3">
                <Input 
                  id="imageUrl" 
                  placeholder="e.g. https://example.com/image.jpg" 
                  value={details.imageUrl} 
                  onChange={(e) => onDetailsChange({ imageUrl: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoUrl" className="text-right">
                Video URL
              </Label>
              <div className="col-span-3">
                <Input 
                  id="videoUrl" 
                  placeholder="e.g. https://youtube.com/watch?v=xyz" 
                  value={details.videoUrl} 
                  onChange={(e) => onDetailsChange({ videoUrl: e.target.value })} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
