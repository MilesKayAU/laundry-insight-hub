
import { useState } from 'react';
import { ProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';
import { updateProductInSupabase, updateProductInLocalStorage, deleteProduct } from '@/lib/dataService';

// Define the ProductDetails interface to match the one in ProductDetailsDialog
interface ProductDetails {
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

export const useProductEditing = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    brand: '',
    name: '',
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
      brand: product.brand || '',
      name: product.name || '',
      description: product.description || 'This product may contain PVA according to customers - please verify',
      imageUrl: product.imageUrl || product.imageurl || '',
      videoUrl: product.videoUrl || product.videourl || '',
      websiteUrl: product.websiteUrl || product.websiteurl || '',
      pvaPercentage: product.pvaPercentage !== null ? String(product.pvaPercentage) : '',
      country: product.country || 'Global',
      ingredients: product.ingredients || '',
      pvaStatus: product.pvaStatus || 'needs-verification',
      type: product.type || 'Detergent'
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
        description: "No product selected for saving",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    console.log("Starting save process for product ID:", selectedProduct.id);
    console.log("Current product details to save:", productDetails);
    
    try {
      // Format the percentage value
      const pvaPercentage = productDetails.pvaPercentage 
        ? parseFloat(productDetails.pvaPercentage) 
        : null;
      
      // Prepare data for Supabase (simplified - the service handles field name mapping)
      const supabaseData = {
        brand: productDetails.brand,
        name: productDetails.name,
        description: productDetails.description,
        type: productDetails.type,
        pvaStatus: productDetails.pvaStatus,
        pvaPercentage: pvaPercentage,
        country: productDetails.country,
        websiteUrl: productDetails.websiteUrl,
        videoUrl: productDetails.videoUrl,
        imageUrl: productDetails.imageUrl,
        ingredients: productDetails.ingredients
      };
      
      console.log("Prepared data for updates:", supabaseData);
      
      // Step 1: Update in Supabase database
      const supabaseResult = await updateProductInSupabase(selectedProduct.id, supabaseData);
      
      // Log Supabase result details
      console.log("Supabase update result:", supabaseResult);
      
      // Step 2: Update in localStorage with same data  
      const localData: Partial<ProductSubmission> = {
        ...supabaseData,
        // Preserve required fields from the original product
        id: selectedProduct.id,
        approved: selectedProduct.approved !== undefined ? selectedProduct.approved : true,
        brandVerified: selectedProduct.brandVerified || false,
        brandOwnershipRequested: selectedProduct.brandOwnershipRequested || false,
        timestamp: selectedProduct.timestamp || Date.now(),
        submittedAt: selectedProduct.submittedAt || new Date().toISOString(),
        dateSubmitted: selectedProduct.dateSubmitted || new Date().toISOString(),
        brandContactEmail: selectedProduct.brandContactEmail || '',
        brandOwnershipRequestDate: selectedProduct.brandOwnershipRequestDate || '',
        brandVerificationDate: selectedProduct.brandVerificationDate || '',
        uploadedBy: selectedProduct.uploadedBy || ''
      };
      
      console.log("Local storage update data:", localData);
      
      // Step 3: Update in localStorage
      const localStorageResult = updateProductInLocalStorage(selectedProduct.id, localData);
      console.log("Local storage update result:", localStorageResult);
      
      // Determine operation result
      if (supabaseResult.success || localStorageResult) {
        // Create success message
        let successMessage = "";
        
        if (supabaseResult.success && localStorageResult) {
          successMessage = "Updated in database and local storage";
        } else if (supabaseResult.success) {
          successMessage = "Updated in database only";
        } else if (localStorageResult) {
          successMessage = "Updated in local storage only";
        }
        
        // Show success toast
        toast({
          title: "Product Updated",
          description: `${productDetails.brand} ${productDetails.name} - ${successMessage}`,
        });

        // Close the dialog
        setIsDialogOpen(false);

        // Execute the success callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        
        // Trigger a global product refresh event
        window.dispatchEvent(new Event('reload-products'));
      } else {
        // Handle failure
        const errorMessage = supabaseResult.error || "Failed to update the product";
        console.error("Update failed:", errorMessage);
        
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving product changes:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    console.log("Starting deletion process for product ID:", productId);
    
    try {
      const result = await deleteProduct(productId);
      
      if (result.success) {
        toast({
          title: "Product Deleted",
          description: "The product has been successfully removed",
        });
        return true;
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete the product",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Unexpected error during product deletion:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during deletion",
        variant: "destructive"
      });
      return false;
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
    handleSaveChanges,
    handleDeleteProduct
  };
};
