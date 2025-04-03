
import { useState } from 'react';
import { ProductSubmission, updateProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the ProductDetails interface to match the one in ProductDetailsDialog
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
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveChanges = async () => {
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
    setIsSaving(true);
    
    try {
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

      console.log("Update data:", updateData);

      // First try to update in localStorage
      const localSuccess = updateProductSubmission(selectedProduct.id, updateData);

      // If the product is in Supabase, also update it there
      if (selectedProduct.id && selectedProduct.id.length > 0) {
        try {
          // Convert the keys to match Supabase column names
          const supabaseUpdateData = {
            description: updateData.description,
            imageurl: updateData.imageUrl,
            videourl: updateData.videoUrl,
            websiteurl: updateData.websiteUrl,
            pvapercentage: updateData.pvaPercentage,
            country: updateData.country,
            pvastatus: updateData.pvaStatus,
            type: updateData.type,
            updatedat: new Date().toISOString()
          };

          console.log("Updating in Supabase:", supabaseUpdateData);
          
          const { error } = await supabase
            .from('product_submissions')
            .update(supabaseUpdateData)
            .eq('id', selectedProduct.id);
          
          if (error) {
            console.error("Error updating product in Supabase:", error);
            // Continue with local update even if Supabase fails
          } else {
            console.log("Product updated in Supabase successfully");
          }
        } catch (error) {
          console.error("Exception updating product in Supabase:", error);
          // Continue with local update even if Supabase fails
        }
      }

      if (localSuccess) {
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
          title: "Warning",
          description: "Product may have been updated but with errors. Please check the data.",
          variant: "warning"
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving product changes:", error);
      toast({
        title: "Error",
        description: "Failed to update product details: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedProduct,
    productDetails,
    isSaving,
    handleViewDetails,
    handleDetailsChange,
    handleSaveChanges
  };
};
