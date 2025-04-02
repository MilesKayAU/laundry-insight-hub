
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProductSubmission } from "@/lib/textExtractor";

interface ProductDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductSubmission | null;
  details: {
    description: string;
    imageUrl: string;
    videoUrl: string;
    websiteUrl: string;
    pvaPercentage: string;
    country: string;
    ingredients: string;
  };
  onDetailsChange: (details: any) => void;
  onSave: () => void;
}

const ProductDetailsDialog: React.FC<ProductDetailsProps> = ({
  isOpen,
  onOpenChange,
  product,
  details,
  onDetailsChange,
  onSave,
}) => {
  const [pvaPercentageNumber, setPvaPercentageNumber] = useState<number | null>(null);
  
  // Debug logging for component render and props
  console.log("[ProductDetailsDialog] Rendering with props:", { 
    isOpen, 
    productName: product?.name, 
    productBrand: product?.brand,
    details
  });
  
  // Update local state when details change
  useEffect(() => {
    if (details.pvaPercentage) {
      setPvaPercentageNumber(Number(details.pvaPercentage));
    } else {
      setPvaPercentageNumber(null);
    }
  }, [details.pvaPercentage]);
  
  // Debug log to track dialog open state and product
  useEffect(() => {
    console.log("[ProductDetailsDialog] State changed: isOpen =", isOpen, "product =", product?.name);
  }, [isOpen, product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`[ProductDetailsDialog] Input changed: ${name} = ${value}`);
    
    // If changing PVA percentage, validate and update the local state
    if (name === 'pvaPercentage') {
      // Handle empty string case
      if (value === '') {
        setPvaPercentageNumber(null);
        onDetailsChange({ ...details, [name]: value });
        return;
      }
      
      // Convert to number and validate
      const numValue = Number(value);
      
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setPvaPercentageNumber(numValue);
        onDetailsChange({ ...details, [name]: value });
      }
    } else {
      onDetailsChange({ ...details, [name]: value });
    }
  };

  const handleSaveClick = () => {
    console.log("[ProductDetailsDialog] Save button clicked");
    onSave();
  };

  // If no product is provided or dialog is not open, don't render content
  if (!product || !isOpen) {
    console.log("[ProductDetailsDialog] No product provided or dialog not open");
    return null;
  }

  console.log("[ProductDetailsDialog] Dialog rendering with open state:", isOpen);
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log("[ProductDetailsDialog] onOpenChange called with:", open);
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Edit details for {product.brand} {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter product description"
              className="col-span-3 h-20"
              value={details.description || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ingredients" className="text-right">
              Ingredients
            </Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              placeholder="Enter product ingredients"
              className="col-span-3 h-40"
              value={details.ingredients || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
              className="col-span-3"
              value={details.imageUrl || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoUrl" className="text-right">
              Video URL
            </Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              placeholder="https://youtube.com/watch?v=xyz"
              className="col-span-3"
              value={details.videoUrl || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="websiteUrl" className="text-right">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              placeholder="https://example.com/product"
              className="col-span-3"
              value={details.websiteUrl || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pvaPercentage" className="text-right">
              PVA %
            </Label>
            <Input
              id="pvaPercentage"
              name="pvaPercentage"
              type="number"
              min="0"
              max="100"
              placeholder="25"
              className="col-span-3"
              value={details.pvaPercentage || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country" className="text-right">
              Country
            </Label>
            <Input
              id="country"
              name="country"
              placeholder="United States"
              className="col-span-3"
              value={details.country || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSaveClick}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
