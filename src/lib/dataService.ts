
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/lib/textExtractor";
import { useToast } from "@/hooks/use-toast";

/**
 * Updates a product in the Supabase database
 */
export async function updateProductInSupabase(
  productId: string, 
  productData: Record<string, any>
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log("DataService: Updating product in Supabase:", { productId, data: productData });
    
    // Ensure all fields use snake_case format expected by Supabase
    const normalizedData: Record<string, any> = {};
    
    // Explicitly map camelCase to snake_case for known fields
    if ('pvaStatus' in productData) {
      // Validate pvaStatus is one of the allowed values
      const status = productData.pvaStatus;
      if (status === 'contains' || status === 'verified-free' || status === 'needs-verification' || status === 'inconclusive') {
        normalizedData.pvastatus = status;
      } else {
        // Default to needs-verification if invalid
        normalizedData.pvastatus = 'needs-verification';
        console.warn(`Invalid pvaStatus value: ${status}, defaulting to 'needs-verification'`);
      }
    }
    
    if ('pvaPercentage' in productData) normalizedData.pvapercentage = productData.pvaPercentage;
    if ('websiteUrl' in productData) normalizedData.websiteurl = productData.websiteUrl;
    if ('videoUrl' in productData) normalizedData.videourl = productData.videoUrl;
    if ('imageUrl' in productData) normalizedData.imageurl = productData.imageUrl;
    
    // Copy all other fields directly
    Object.entries(productData).forEach(([key, value]) => {
      // Skip fields we've already mapped
      if (!['pvaStatus', 'pvaPercentage', 'websiteUrl', 'videoUrl', 'imageUrl'].includes(key)) {
        // For any other camelCase properties, convert to snake_case
        const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        normalizedData[snakeCaseKey] = value;
      }
    });
    
    // Add updated timestamp
    normalizedData.updatedat = new Date().toISOString();
    
    console.log("DataService: Normalized data for Supabase:", normalizedData);
    
    const { data, error } = await supabase
      .from('product_submissions')
      .update(normalizedData)
      .eq('id', productId)
      .select();
    
    if (error) {
      console.error("DataService: Supabase update error:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log("DataService: Supabase update successful:", data);
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error("DataService: Exception during Supabase update:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Updates a product in localStorage
 */
export function updateProductInLocalStorage(
  productId: string,
  updatedProduct: Partial<ProductSubmission>
): boolean {
  try {
    console.log("DataService: Updating product in localStorage:", { productId, updatedProduct });
    
    // Get products from both possible storage keys
    const storageKeys = ['product_submissions', 'products'];
    let updateSuccess = false;
    
    storageKeys.forEach(key => {
      const productsJson = localStorage.getItem(key);
      if (!productsJson) return;
      
      try {
        const products = JSON.parse(productsJson);
        if (!Array.isArray(products)) return;
        
        const productIndex = products.findIndex((p: any) => p.id === productId);
        if (productIndex === -1) return;
        
        console.log(`DataService: Found product in '${key}' at index ${productIndex}`);
        
        // Ensure the pvaStatus is a valid value
        let pvaStatus = updatedProduct.pvaStatus;
        if (pvaStatus && !['contains', 'verified-free', 'needs-verification', 'inconclusive'].includes(pvaStatus)) {
          console.warn(`Invalid pvaStatus: ${pvaStatus}, defaulting to 'needs-verification'`);
          pvaStatus = 'needs-verification';
        }
        
        // Update the product, preserving existing fields
        products[productIndex] = {
          ...products[productIndex],
          ...updatedProduct,
          // Ensure pvaStatus is a valid value
          pvaStatus: pvaStatus || products[productIndex].pvaStatus,
          // Ensure both camelCase and snake_case URL fields are updated
          websiteUrl: updatedProduct.websiteUrl || updatedProduct.websiteurl || products[productIndex].websiteUrl || products[productIndex].websiteurl,
          websiteurl: updatedProduct.websiteUrl || updatedProduct.websiteurl || products[productIndex].websiteUrl || products[productIndex].websiteurl,
          videoUrl: updatedProduct.videoUrl || updatedProduct.videourl || products[productIndex].videoUrl || products[productIndex].videourl,
          videourl: updatedProduct.videoUrl || updatedProduct.videourl || products[productIndex].videoUrl || products[productIndex].videourl,
          imageUrl: updatedProduct.imageUrl || updatedProduct.imageurl || products[productIndex].imageUrl || products[productIndex].imageurl,
          imageurl: updatedProduct.imageUrl || updatedProduct.imageurl || products[productIndex].imageUrl || products[productIndex].imageurl
        };
        
        // Save back to localStorage
        localStorage.setItem(key, JSON.stringify(products));
        console.log(`DataService: Updated product in '${key}' storage`);
        updateSuccess = true;
      } catch (e) {
        console.error(`DataService: Error updating '${key}' storage:`, e);
      }
    });
    
    return updateSuccess;
  } catch (error) {
    console.error("DataService: Exception during localStorage update:", error);
    return false;
  }
}

/**
 * Deletes a product from both Supabase and localStorage
 */
export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  console.log("DataService: Starting deletion process for product:", productId);
  
  try {
    // Step 1: Try direct deletion from Supabase
    const { error } = await supabase
      .from('product_submissions')
      .delete()
      .eq('id', productId);
      
    if (error) {
      console.error("DataService: Supabase delete error:", error);
      // Continue to localStorage cleanup regardless of Supabase result
    } else {
      console.log("DataService: Successfully deleted product from Supabase");
    }
    
    // Step 2: Clean up localStorage
    let localStorageSuccess = false;
    
    ['product_submissions', 'products'].forEach(key => {
      try {
        const productsJson = localStorage.getItem(key);
        if (!productsJson) return;
        
        const products = JSON.parse(productsJson);
        if (!Array.isArray(products)) return;
        
        const filteredProducts = products.filter((p: any) => p.id !== productId);
        
        if (filteredProducts.length !== products.length) {
          localStorage.setItem(key, JSON.stringify(filteredProducts));
          console.log(`DataService: Removed product from '${key}' storage`);
          localStorageSuccess = true;
        }
      } catch (e) {
        console.error(`DataService: Error cleaning up '${key}' storage:`, e);
      }
    });
    
    return { 
      success: !error || localStorageSuccess,
      error: error?.message
    };
  } catch (error) {
    console.error("DataService: Exception during product deletion:", error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
