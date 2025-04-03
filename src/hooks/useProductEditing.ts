
import { useState } from 'react';
import { ProductSubmission, updateProductSubmission, deleteProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { forceProductRefresh, invalidateProductCache } from '@/utils/supabaseUtils';

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
        
        // Force immediate refresh of data from Supabase
        invalidateProductCache();
      }
      catch (error) {
        console.error("Failed to update product in Supabase:", error);
        // Continue with local update even if Supabase update fails
      }
      
      // Update the product in localStorage
      const success = updateProductSubmission(selectedProduct.id, updatedData);
      
      if (success || supabaseSuccess) {
        // Clear any cached data to force reload
        invalidateProductCache();
        
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

        // Force refresh events to ensure UI updates, but use a single timeout
        console.log("Dispatching reload-products event");
        setTimeout(() => {
          forceProductRefresh();
          window.dispatchEvent(new Event('reload-products'));
        }, 300);
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

  // Completely rewritten product deletion functionality with guaranteed error handling
  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    console.log("Starting deletion process for product ID:", productId);
    
    return new Promise((resolve) => {
      // Create a timeout to guarantee the function resolves
      const masterTimeout = setTimeout(() => {
        console.error("Master timeout triggered - ensuring operation completes");
        resolve(false);
      }, 10000);
      
      // Inner async function with try-catch
      const performDelete = async (): Promise<boolean> => {
        // Track success flags
        let supabaseSuccess = false;
        let localSuccess = false;
        
        try {
          // First try to delete from Supabase with timeout
          try {
            const deletePromise = supabase
              .from('product_submissions')
              .delete()
              .eq('id', productId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error deleting product from Supabase:", error);
                  return false;
                }
                console.log(`Successfully deleted product ${productId} from Supabase`);
                return true;
              });
            
            // Race the delete operation against a timeout
            const timeoutPromise = new Promise<boolean>((_, reject) => {
              setTimeout(() => reject(new Error("Supabase delete operation timed out")), 5000);
            });
            
            supabaseSuccess = await Promise.race([deletePromise, timeoutPromise])
              .catch(error => {
                console.error("Supabase delete failed or timed out:", error);
                return false;
              }) as boolean;
              
            if (supabaseSuccess) {
              console.log("Invalidating product cache after successful Supabase delete");
              invalidateProductCache();
            }
          } catch (dbError) {
            console.error("Exception deleting product from Supabase:", dbError);
            // Continue with local deletion even if Supabase fails
          }

          // Then delete from local storage with a separate try-catch
          try {
            localSuccess = deleteProductSubmission(productId);
            console.log("Local storage deletion result:", localSuccess ? "success" : "failed");
            
            if (!localSuccess) {
              // Fallback deletion method if standard method fails
              try {
                const productsString = localStorage.getItem('product_submissions') || localStorage.getItem('products') || '[]';
                const allProducts = JSON.parse(productsString);
                const filteredProducts = allProducts.filter((p: ProductSubmission) => p.id !== productId);
                localStorage.setItem('product_submissions', JSON.stringify(filteredProducts));
                console.log("Product deleted through fallback method");
                localSuccess = true;
              } catch (fallbackError) {
                console.error("Even fallback deletion failed:", fallbackError);
              }
            }
          } catch (localError) {
            console.error("Error deleting from localStorage:", localError);
          }

          // Determine overall success
          const success = supabaseSuccess || localSuccess;
          
          if (success) {
            console.log("Successfully deleted product:", productId);
            toast({
              title: "Product Deleted",
              description: "Product was successfully deleted",
            });

            // Schedule refresh but with guaranteed completion
            try {
              forceProductRefresh();
              if (typeof onSuccess === 'function') {
                setTimeout(() => {
                  try {
                    onSuccess();
                  } catch (callbackError) {
                    console.error("Error in refresh callback:", callbackError);
                  }
                }, 200);
              }
            } catch (refreshError) {
              console.error("Error during refresh after deletion:", refreshError);
            }
          } else {
            console.error("Both Supabase and local deletion failed for product:", productId);
            toast({
              title: "Delete Failed",
              description: "Failed to delete product completely",
              variant: "destructive"
            });
          }
          
          clearTimeout(masterTimeout);
          resolve(success);
        } catch (error) {
          console.error("Uncaught error in handleDeleteProduct:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred while deleting the product",
            variant: "destructive"
          });
          
          clearTimeout(masterTimeout);
          resolve(false);
        }
      };
      
      // Start the delete operation
      performDelete().catch((error) => {
        console.error("Unhandled promise rejection in performDelete:", error);
        clearTimeout(masterTimeout);
        resolve(false);
      });
    });
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
