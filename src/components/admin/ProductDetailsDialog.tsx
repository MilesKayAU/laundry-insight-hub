
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProductSubmission } from "@/lib/textExtractor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

// Image preview component
const ImagePreview = ({ url }: { url: string }) => {
  if (!url) return null;
  
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 mt-2">
      <img 
        src={url} 
        alt="Product" 
        className="h-auto w-full object-contain max-h-[200px]"
        onError={(e) => {
          // If image fails to load, show placeholder
          (e.target as HTMLImageElement).src = "https://placehold.co/300x200?text=Image+Not+Available";
        }}
      />
    </div>
  );
};

// Define the ProductDetails interface separately to avoid self-reference
interface ProductDetailsType {
  brand: string;
  name: string;
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
  product: ProductSubmission;
  details: ProductDetailsType;
  onDetailsChange: (details: Partial<ProductDetailsType>) => void;
  onSave: () => void;
}

const ProductDetailsDialog = ({
  isOpen,
  onOpenChange,
  product,
  details,
  onDetailsChange,
  onSave
}: ProductDetailsDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      // If no error is thrown from onSave, we assume it succeeded
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product Details</DialogTitle>
          <DialogDescription>
            Make changes to the product information below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input 
                id="brand"
                value={details.brand}
                onChange={(e) => onDetailsChange({ brand: e.target.value })}
                placeholder="Enter brand name"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name"
                value={details.name}
                onChange={(e) => onDetailsChange({ name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Product Type</Label>
              <Input 
                id="type"
                value={details.type}
                onChange={(e) => onDetailsChange({ type: e.target.value })}
                placeholder="E.g., Laundry Sheets, Dish Soap, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="country">Country/Region</Label>
              <Select 
                value={details.country}
                onValueChange={(value) => onDetailsChange({ country: value })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pvaPercentage">PVA Percentage</Label>
              <Input 
                id="pvaPercentage"
                type="number"
                min="0"
                max="100"
                value={details.pvaPercentage}
                onChange={(e) => onDetailsChange({ pvaPercentage: e.target.value })}
                placeholder="Enter PVA percentage"
              />
            </div>
            
            <div>
              <Label htmlFor="pvaStatus">PVA Status</Label>
              <Select 
                value={details.pvaStatus}
                onValueChange={(value) => onDetailsChange({ pvaStatus: value })}
              >
                <SelectTrigger id="pvaStatus">
                  <SelectValue placeholder="Select PVA status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains PVA</SelectItem>
                  <SelectItem value="verified-free">Verified PVA-Free</SelectItem>
                  <SelectItem value="needs-verification">Needs Verification</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={details.description}
                onChange={(e) => onDetailsChange({ description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea 
                id="ingredients"
                value={details.ingredients}
                onChange={(e) => onDetailsChange({ ingredients: e.target.value })}
                placeholder="Enter product ingredients"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input 
                id="websiteUrl"
                value={details.websiteUrl}
                onChange={(e) => onDetailsChange({ websiteUrl: e.target.value })}
                placeholder="Enter website URL"
              />
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl"
                value={details.imageUrl}
                onChange={(e) => onDetailsChange({ imageUrl: e.target.value })}
                placeholder="Enter image URL"
              />
              <ImagePreview url={details.imageUrl} />
            </div>
            
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input 
                id="videoUrl"
                value={details.videoUrl}
                onChange={(e) => onDetailsChange({ videoUrl: e.target.value })}
                placeholder="Enter video URL"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <><Spinner className="mr-2" /> Saving...</> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
