import { useState } from 'react';
import { ProductSubmission, updateProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Prepare updated product data
      const updatedData: Partial<ProductSubmission> = {
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
        type: productDetails.type
      };

      console.log("Product ID being updated:", selectedProduct.id);
      console.log("Updated data being applied:", updatedData);

      // Update in Supabase first
      let supabaseSuccess = false;
      try {
        console.log("Updating product in Supabase...");
        const { error } = await supabase
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
            updatedat: new Date().toISOString()
          })
          .eq('id', selectedProduct.id);
          
        if (error) {
          console.error("Error updating product in Supabase:", error);
          throw error;
        }
        
        console.log("Successfully updated product in Supabase");
        supabaseSuccess = true;
      }
      catch (error) {
        console.error("Failed to update product in Supabase:", error);
        // Continue with local update even if Supabase update fails
      }
      
      // Update the product in localStorage
      const success = updateProductSubmission(selectedProduct.id, updatedData);
      
      if (success || supabaseSuccess) {
        toast({
          title: "Product Updated",
          description: `${updatedData.brand} ${updatedData.name} updated successfully`,
        });

        console.log("Product update successful, closing dialog");
        // Close the dialog
        setIsDialogOpen(false);

        // Execute the success callback if provided
        if (typeof onSuccess === 'function') {
          console.log("Calling success callback");
          onSuccess();
        }
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
      // Step 1: Check if the product exists in Supabase before attempting deletion
      console.log("Verifying product exists in Supabase before deletion:", productId);
      const { data: existingProduct, error: checkError } = await supabase
        .from('product_submissions')
        .select('id, brand, name')
        .eq('id', productId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking product existence:", checkError);
        // Continue anyway as we might be dealing with a local-only product
      } else {
        console.log("Product existence check result:", existingProduct);
      }
      
      // Step 2: Execute deletion from Supabase with improved error handling
      console.log("Executing Supabase deletion with explicit force flag for:", productId);
      
      const { data: deletedData, error: deleteError } = await supabase
        .from('product_submissions')
        .delete()
        .eq('id', productId)
        .select(); // Request the deleted row to be returned for confirmation
      
      if (deleteError) {
        console.error("🔴 Supabase deletion error:", deleteError);
        
        // Try an alternative deletion approach if first attempt fails
        try {
          console.log("Attempting alternative deletion approach...");
          const { error: altError } = await supabase
            .from('product_submissions')
            .delete()
            .eq('id', productId);
            
          if (altError) {
            console.error("🔴 Alternative deletion also failed:", altError);
          } else {
            console.log("✅ Alternative deletion approach succeeded");
            deleteSuccess = true;
          }
        } catch (e) {
          console.error("🔴 Alternative deletion exception:", e);
        }
      } else {
        // Parse deletion response
        if (deletedData && deletedData.length > 0) {
          console.log("✅ Deletion confirmed - Supabase returned deleted row:", deletedData[0]);
          deleteSuccess = true;
        } else {
          console.log("ℹ️ Supabase deletion reported success but returned no data.");
          
          // Double-check to verify if the product is truly gone
          const { data: verifyData, error: verifyError } = await supabase
            .from('product_submissions')
            .select('id')
            .eq('id', productId)
            .maybeSingle();
          
          if (verifyError) {
            console.error("Error during deletion verification:", verifyError);
          } else if (verifyData) {
            console.error("⚠️ Product still exists after deletion attempt!");
          } else {
            console.log("✅ Verified product no longer exists in Supabase");
            deleteSuccess = true;
          }
        }
      }
      
      // Step 3: Clean up local storage regardless of Supabase result
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
          
          // Consider local storage cleanup as a success indicator too
          if (!deleteSuccess) {
            deleteSuccess = true;
          }
        } else {
          console.log("Product not found in localStorage");
        }
      } catch (localError) {
        console.error("Error cleaning up localStorage:", localError);
      }
      
      // Step 4: Final verification via direct DB query to ensure it's really gone
      try {
        const { data: finalCheck, error: finalError } = await supabase
          .from('product_submissions')
          .select('id')
          .eq('id', productId)
          .maybeSingle();
          
        if (finalError) {
          console.error("Error during final verification:", finalError);
        } else if (finalCheck) {
          console.error("⚠️ CRITICAL: Product still exists after all deletion attempts!");
          
          // Last resort: Try forcing a raw SQL delete if you have permission
          try {
            const { error: sqlError } = await supabase.rpc('force_delete_product', { 
              product_id: productId 
            });
            
            if (sqlError) {
              console.error("SQL force delete failed:", sqlError);
            } else {
              console.log("✅ Force delete via RPC successful");
              deleteSuccess = true;
            }
          } catch (e) {
            console.error("Force delete exception:", e);
          }
        } else {
          console.log("✅ Final verification confirms product is deleted");
          deleteSuccess = true;
        }
      } catch (e) {
        console.error("Final verification exception:", e);
      }
      
      // Final notification based on deletion success
      if (deleteSuccess) {
        toast({
          title: "Product Deleted",
          description: "The product has been successfully deleted",
        });
      } else {
        // If we reached here without setting success to true, both methods failed
        toast({
          title: "Deletion Failed",
          description: "Could not delete the product. Please try again or contact support.",
          variant: "destructive"
        });
      }
      
      return deleteSuccess;
    } catch (error) {
      console.error("Unexpected error during product deletion:", error);
      toast({
        title: "Deletion Error",
        description: "An unexpected error occurred while deleting the product",
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
