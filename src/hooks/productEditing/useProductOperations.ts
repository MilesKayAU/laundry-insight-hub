
import { useToast } from '@/hooks/use-toast';
import { updateProductInSupabase, updateProductInLocalStorage, deleteProduct } from '@/lib/dataService';
import { prepareProductDataForUpdate, mapProductToDetails } from './utils';
import { ProductDetails, ProductEditingActions } from './types';

interface UseProductOperationsProps {
  selectedProduct: any | null;
  productDetails: ProductDetails;
  setIsDialogOpen: (open: boolean) => void;
  setSelectedProduct: (product: any) => void;
  setProductDetails: (details: ProductDetails | ((prev: ProductDetails) => ProductDetails)) => void;
  setIsSaving: (saving: boolean) => void;
  onSuccess?: () => void;
}

export function useProductOperations({
  selectedProduct,
  productDetails,
  setIsDialogOpen,
  setSelectedProduct,
  setProductDetails,
  setIsSaving,
  onSuccess
}: UseProductOperationsProps): ProductEditingActions {
  const { toast } = useToast();

  const handleViewDetails = (product: any) => {
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
    
    try {
      const details = mapProductToDetails(product);
      setProductDetails(details);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error mapping product to details:", error);
      toast({
        title: "Error",
        description: "Failed to prepare product for editing",
        variant: "destructive"
      });
    }
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
      const supabaseData = prepareProductDataForUpdate(productDetails);
      console.log("Prepared data for updates:", supabaseData);
      
      const supabaseResult = await updateProductInSupabase(selectedProduct.id, supabaseData);
      
      console.log("Supabase update result:", supabaseResult);
      
      const localData = {
        ...supabaseData,
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
      
      const localStorageResult = updateProductInLocalStorage(selectedProduct.id, localData);
      console.log("Local storage update result:", localStorageResult);
      
      if (supabaseResult.success || localStorageResult) {
        let successMessage = "";
        
        if (supabaseResult.success && localStorageResult) {
          successMessage = "Updated in database and local storage";
        } else if (supabaseResult.success) {
          successMessage = "Updated in database only";
        } else if (localStorageResult) {
          successMessage = "Updated in local storage only";
        }
        
        toast({
          title: "Product Updated",
          description: `${productDetails.brand} ${productDetails.name} - ${successMessage}`,
        });

        setIsDialogOpen(false);

        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        
        window.dispatchEvent(new Event('reload-products'));
      } else {
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
    handleViewDetails,
    handleDetailsChange,
    handleSaveChanges,
    handleDeleteProduct
  };
}
