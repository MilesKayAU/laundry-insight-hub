
import { useState } from 'react';
import { ProductSubmission, updateProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';

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

export const useProductEditing = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    description: '',
    imageUrl: '',
    videoUrl: '',
    websiteUrl: '',
    pvaPercentage: '',
    country: '',
    ingredients: '',
    pvaStatus: '',
    type: ''
  });

  const handleViewDetails = (product: ProductSubmission) => {
    console.log("Opening product details:", product);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Cannot edit: product data is missing",
        variant: "destructive"
      });
      return;
    }

    setSelectedProduct(product);
    setProductDetails({
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      videoUrl: product.videoUrl || '',
      websiteUrl: product.websiteUrl || '',
      pvaPercentage: product.pvaPercentage !== null ? String(product.pvaPercentage) : '',
      country: product.country || '',
      ingredients: product.ingredients || '',
      pvaStatus: product.pvaStatus || 'needs-verification',
      type: product.type || ''
    });
    setIsDialogOpen(true);
  };

  const handleDetailsChange = (details: Partial<ProductDetails>) => {
    setProductDetails(prev => ({ ...prev, ...details }));
  };

  const handleSaveChanges = () => {
    if (!selectedProduct) {
      console.error("Cannot save changes: No product selected");
      toast({
        title: "Error",
        description: "Cannot save changes: No product selected",
        variant: "destructive"
      });
      return;
    }

    console.log("Saving changes to product:", selectedProduct.id);
    
    // Prepare the data to update
    const updateData: Partial<ProductSubmission> = {
      description: productDetails.description,
      imageUrl: productDetails.imageUrl,
      videoUrl: productDetails.videoUrl,
      websiteUrl: productDetails.websiteUrl,
      pvaPercentage: productDetails.pvaPercentage ? Number(productDetails.pvaPercentage) : null,
      country: productDetails.country,
      ingredients: productDetails.ingredients,
      pvaStatus: productDetails.pvaStatus as ProductSubmission['pvaStatus'],
      type: productDetails.type
    };

    // Update the product
    const success = updateProductSubmission(selectedProduct.id, updateData);

    if (success) {
      toast({
        title: "Success",
        description: "Product details updated successfully"
      });
      setIsDialogOpen(false);
      
      // Call the optional success callback
      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to update product details",
        variant: "destructive"
      });
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedProduct,
    productDetails,
    handleViewDetails,
    handleDetailsChange,
    handleSaveChanges
  };
};
