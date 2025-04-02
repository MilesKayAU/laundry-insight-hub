export const PVA_KEYWORDS_CATEGORIES = {
  commonNames: ["PVA", "PVOH", "Polyvinyl Alcohol", "Polyvinyl alcohol"],
  chemicalSynonyms: ["Ethenol homopolymer", "Vinyl alcohol polymer"],
  inciTerms: ["Polyvinyl Alcohol"],
  additional: ["Film", "Soluble film", "Dissolving film"]
};

export function getProductSubmissions() {
  try {
    const productsString = localStorage.getItem('products');
    if (!productsString) return [];
    return JSON.parse(productsString) || [];
  } catch (error) {
    console.error("Error retrieving products from localStorage:", error);
    return [];
  }
}

export function deleteProductSubmission(productId) {
  try {
    if (!productId) {
      console.error("No product ID provided for deletion");
      return false;
    }

    console.log("Deleting product with ID:", productId);
    
    // Get all products
    const allProducts = getProductSubmissions();
    
    // Check if product exists
    const productExists = allProducts.some(p => p.id === productId);
    if (!productExists) {
      console.error("Product not found in localStorage:", productId);
      return false;
    }
    
    // Filter out the product to delete
    const filteredProducts = allProducts.filter(p => p.id !== productId);
    
    // Save back to localStorage
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    
    console.log("Product deleted, remaining products:", filteredProducts.length);
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

// Add a stub for ProductSubmission type if needed
export class ProductSubmission {
  id = "";
  name = "";
  brand = "";
  // other properties as needed
}
