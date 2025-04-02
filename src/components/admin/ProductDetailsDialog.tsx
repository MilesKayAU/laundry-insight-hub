
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    pvaStatus: string;
    type: string;
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
  const [urlIsValid, setUrlIsValid] = useState<boolean>(true);
  const [formModified, setFormModified] = useState<boolean>(false);
  const [originalDetails, setOriginalDetails] = useState<typeof details>({...details});
  
  // Debug logging for component render and props
  console.log("[ProductDetailsDialog] Rendering with props:", { 
    isOpen, 
    productName: product?.name, 
    productBrand: product?.brand,
    details,
    formModified,
    originalDetails
  });
  
  // When dialog opens, store the original details for comparison
  useEffect(() => {
    if (isOpen && product) {
      console.log("[ProductDetailsDialog] Dialog opened, setting original details and resetting modified state");
      setOriginalDetails({...details});
      setFormModified(false);
    }
  }, [isOpen, product]);

  // Handle PVA percentage and URL validation separately from the comparison logic
  useEffect(() => {
    if (details.pvaPercentage) {
      setPvaPercentageNumber(Number(details.pvaPercentage));
    } else {
      setPvaPercentageNumber(null);
    }
    
    // Validate URL if it exists
    if (details.websiteUrl) {
      try {
        new URL(details.websiteUrl);
        setUrlIsValid(true);
      } catch (e) {
        setUrlIsValid(false);
      }
    } else {
      setUrlIsValid(true); // Empty URL is considered valid
    }
  }, [details]);
  
  // Debug log to track dialog open state and product
  useEffect(() => {
    console.log("[ProductDetailsDialog] State changed: isOpen =", isOpen, "product =", product?.name);
  }, [isOpen, product]);

  // Check for any differences between current and original details
  useEffect(() => {
    // Only run comparison if dialog is open and we have original details
    if (isOpen && originalDetails) {
      const hasChanged = Object.keys(details).some(key => {
        const detailKey = key as keyof typeof details;
        const origValue = originalDetails[detailKey];
        const currentValue = details[detailKey];
        const isDifferent = origValue !== currentValue;
        
        if (isDifferent) {
          console.log(`[ProductDetailsDialog] Field ${key} changed from "${origValue}" to "${currentValue}"`);
        }
        
        return isDifferent;
      });
      
      console.log("[ProductDetailsDialog] Form modified check:", hasChanged);
      setFormModified(hasChanged);
    }
  }, [details, originalDetails, isOpen]);

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

  const handleSelectChange = (name: string, value: string) => {
    console.log(`[ProductDetailsDialog] Select changed: ${name} = ${value}`);
    onDetailsChange({ ...details, [name]: value });
  };

  const handleSaveClick = () => {
    console.log("[ProductDetailsDialog] Save button clicked with modified =", formModified);
    onSave();
    setFormModified(false);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // If no product is provided or dialog is not open, don't render content
  if (!product || !isOpen) {
    console.log("[ProductDetailsDialog] No product provided or dialog not open");
    return null;
  }

  console.log("[ProductDetailsDialog] Dialog rendering with open state:", isOpen);
  
  // Check if the URL is valid (only if it's not empty)
  const hasInvalidUrl = details.websiteUrl && !validateUrl(details.websiteUrl);
  
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
          <DialogTitle>Edit Product Details</DialogTitle>
          <DialogDescription>
            Modify details for {product.brand} {product.name}
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
            <Label htmlFor="type" className="text-right">
              Product Type
            </Label>
            <Select
              value={details.type || product.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Detergent">Detergent</SelectItem>
                <SelectItem value="Dishwasher Tablet">Dishwasher Tablet</SelectItem>
                <SelectItem value="Dishwasher Pod">Dishwasher Pod</SelectItem>
                <SelectItem value="Laundry Pod">Laundry Pod</SelectItem>
                <SelectItem value="Laundry Detergent Sheets">Laundry Detergent Sheets</SelectItem>
                <SelectItem value="Soap">Soap</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="col-span-3">
              <Input
                id="websiteUrl"
                name="websiteUrl"
                placeholder="https://example.com/product"
                className={`${!validateUrl(details.websiteUrl || '') ? "border-red-500" : ""}`}
                value={details.websiteUrl || ''}
                onChange={handleInputChange}
              />
              {!validateUrl(details.websiteUrl || '') && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL (include https://)</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pvaStatus" className="text-right">
              PVA Status
            </Label>
            <Select
              value={details.pvaStatus || product.pvaStatus}
              onValueChange={(value) => handleSelectChange('pvaStatus', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select PVA status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains PVA</SelectItem>
                <SelectItem value="verified-free">Verified Free</SelectItem>
                <SelectItem value="needs-verification">Needs Verification</SelectItem>
                <SelectItem value="inconclusive">Inconclusive</SelectItem>
              </SelectContent>
            </Select>
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

        {hasInvalidUrl && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid URL</AlertTitle>
            <AlertDescription>
              Please enter a valid website URL including the protocol (https://)
            </AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveClick}
            disabled={!formModified || hasInvalidUrl}
            className={formModified ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
