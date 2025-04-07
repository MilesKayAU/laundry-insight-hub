import { useState } from 'react';
import { ProductSubmission, updateProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { normalizeProductFieldNames } from '@/lib/utils';

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
      imageUrl: product.imageUrl || '',
      videoUrl: product.videoUrl || '',
      websiteUrl: product.websiteUrl || '',
      pvaPercentage: product.pvaPercentage !== null ? String(product.pvaPercentage) : '',
      country: product.country || 'Global',
      ingredients: product.ingredients || '',
      pvaStatus: product.pvaStatus || 'needs-verification',
      type: product.type || 'Detergent' // Default type for new products
    });
    setIsDialogOpen(true);
  };

  const handleDetailsChange = (details: Partial<ProductDetails>) => {
    console.log("Updating product details:", details);
    setProductDetails(prev => ({ ...prev, ...details }));
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    console.log("Starting to save product changes for ID:", selectedProduct.id);
    
    try {
      // Format the percentage value
      const pvaPercentage = productDetails.pvaPercentage ? 
        parseFloat(productDetails.pvaPercentage) : null;
      
      // Prepare updated product data ensuring all required fields are preserved
      const updatedData: Partial<ProductSubmission> = {
        // Fields from form
        brand: productDetails.brand,
        name: productDetails.name,
        description: productDetails.description,
        imageUrl: productDetails.imageUrl,
        videoUrl: productDetails.videoUrl,
        websiteUrl: productDetails.websiteUrl,
        pvaPercentage,
        country: productDetails.country,
        ingredients: productDetails.ingredients,
        pvaStatus: productDetails.pvaStatus as any,
        type: productDetails.type,
        
        // CRITICAL: Preserve all these required fields from the original product
        id: selectedProduct.id,
        approved: selectedProduct.approved !== undefined ? selectedProduct.approved : true,
        brandVerified: selectedProduct.brandVerified !== undefined ? selectedProduct.brandVerified : false,
        brandOwnershipRequested: selectedProduct.brandOwnershipRequested !== undefined ? selectedProduct.brandOwnershipRequested : false,
        timestamp: selectedProduct.timestamp || Date.now(),
        submittedAt: selectedProduct.submittedAt || new Date().toISOString(),
        dateSubmitted: selectedProduct.dateSubmitted || new Date().toISOString(),
        brandContactEmail: selectedProduct.brandContactEmail || '',
        brandOwnershipRequestDate: selectedProduct.brandOwnershipRequestDate || '',
        brandVerificationDate: selectedProduct.brandVerificationDate || '',
        uploadedBy: selectedProduct.uploadedBy || ''
        
        // Removed 'updatedat' property as it's not in the ProductSubmission interface
      };

      console.log("Product ID being updated:", selectedProduct.id);
      console.log("Updated data being applied:", updatedData);

      // Update in Supabase first
      let supabaseSuccess = false;
      try {
        console.log("Updating product in Supabase...");
        const { data, error } = await supabase
          .from('product_submissions')
          .update({
            brand: updatedData.brand,
            name: updatedData.name,
            description: updatedData.description,
            type: updatedData.type,
            pvastatus: updatedData.pvaStatus,
            pvapercentage: updatedData.pvaPercentage,
            country: updatedData.country,
            websiteurl: updatedData.websiteUrl,
            videourl: updatedData.videoUrl,
            imageurl: updatedData.imageUrl,
            ingredients: updatedData.ingredients,
            updatedat: new Date().toISOString() // This is okay here as it's the Supabase column name
          })
          .eq('id', selectedProduct.id);
          
        if (error) {
          console.error("Error updating product in Supabase:", error);
          toast({
            title: "Supabase Update Error",
            description: `Failed to update in database: ${error.message}`,
            variant: "destructive"
          });
        } else {
          console.log("Successfully updated product in Supabase, data response:", data);
          supabaseSuccess = true;
        }
      }
      catch (error) {
        console.error("Failed to update product in Supabase:", error);
        // Continue with local update even if Supabase update fails
      }
      
      // Update the product in localStorage
      const success = updateProductSubmission(selectedProduct.id, updatedData);
      
      if (success || supabaseSuccess) {
        // Set more specific toast message based on where the update succeeded
        let successMessage = "";
        if (supabaseSuccess) {
          successMessage = success 
            ? "Product updated successfully in both database and local storage." 
            : "Product updated in database but local update failed.";
        } else {
          successMessage = "Product updated in local storage only. Database update failed.";
        }
        
        toast({
          title: "Product Updated",
          description: `${updatedData.brand} ${updatedData.name} - ${successMessage}`,
        });

        console.log("Product update successful, closing dialog");
        // Close the dialog
        setIsDialogOpen(false);

        // Execute the success callback if provided
        if (typeof onSuccess === 'function') {
          console.log("Calling success callback");
          onSuccess();
        }
        
        // Trigger a global product refresh event
        window.dispatchEvent(new Event('reload-products'));
      } else {
        console.error("Both local and Supabase updates failed");
        toast({
          title: "Update Failed",
          description: "Failed to update the product. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving product changes:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    console.log("Starting robust deletion process for product ID:", productId);
    
    // Track deletion success
    let deleteSuccess = false;
    
    try {
      // Step 1: Call the force_delete_product RPC function with an explicit type assertion
      console.log("Calling force_delete_product RPC function for product:", productId);
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'force_delete_product' as any, // Use type assertion to bypass type checking
        { product_id: productId }
      );
      
      if (rpcError) {
        console.error("Error calling force_delete_product RPC:", rpcError);
        
        // Fall back to direct deletion if RPC fails
        console.log("Falling back to direct deletion");
        const { error: deleteError } = await supabase
          .from('product_submissions')
          .delete()
          .eq('id', productId);
          
        if (deleteError) {
          console.error("Direct deletion also failed:", deleteError);
        } else {
          console.log("Direct deletion succeeded");
          deleteSuccess = true;
        }
      } else {
        console.log("RPC result:", rpcResult);
        if (rpcResult === true) {
          console.log("Product successfully deleted via RPC");
          deleteSuccess = true;
        } else {
          console.warn("RPC returned false, product may not have been deleted");
        }
      }
      
      // Step 2: Clean up local storage regardless of Supabase result
      try {
        console.log("Cleaning up product from local storage:", productId);
        
        // Get all products from localStorage
        const productsString = localStorage.getItem('product_submissions') || localStorage.getItem('products') || '[]';
        const allProducts = JSON.parse(productsString);
        
        // Check if product exists before attempting to filter
        const productExists = allProducts.some((p: any) => p.id === productId);
        
        if (productExists) {
          console.log("Product found in localStorage, removing...");
          
          // Filter out the product
          const filteredProducts = allProducts.filter((p: any) => p.id !== productId);
          
          // Save updated products to both possible storage keys
          localStorage.setItem('product_submissions', JSON.stringify(filteredProducts));
          localStorage.setItem('products', JSON.stringify(filteredProducts));
          
          console.log(`Product removed from localStorage. Count before: ${allProducts.length}, after: ${filteredProducts.length}`);
          
          // Local storage cleanup is also a success indicator
          if (!deleteSuccess) {
            deleteSuccess = true;
          }
        } else {
          console.log("Product not found in localStorage");
        }
      } catch (localError) {
        console.error("Error cleaning up localStorage:", localError);
      }
            
      return deleteSuccess;
    } catch (error) {
      console.error("Unexpected error during product deletion:", error);
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
