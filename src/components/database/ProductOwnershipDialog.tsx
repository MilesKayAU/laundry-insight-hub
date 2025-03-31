
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductSubmission } from "@/lib/textExtractor";

interface ProductOwnershipDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedProduct: ProductSubmission | null;
  onSubmit: (email: string) => void;
}

const ProductOwnershipDialog: React.FC<ProductOwnershipDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedProduct,
  onSubmit,
}) => {
  const [contactEmail, setContactEmail] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Brand Ownership</DialogTitle>
          <DialogDescription>
            {selectedProduct && (
              <>
                Submit a request to verify that you represent {selectedProduct.brand}. 
                Our administrators will review your request.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact-email" className="text-right">
              Business Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="your@company.com"
              className="col-span-3"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          
          <div className="col-span-4 text-sm text-muted-foreground">
            <p>Please use an email address associated with your brand's domain for faster verification.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(contactEmail)}>
            Submit Verification Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductOwnershipDialog;
