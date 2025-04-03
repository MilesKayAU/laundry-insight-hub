
export const PVA_KEYWORDS_CATEGORIES = {
  commonNames: ["PVA", "PVOH", "Polyvinyl Alcohol", "Polyvinyl alcohol"],
  chemicalSynonyms: [
    "Ethenol homopolymer", 
    "Vinyl alcohol polymer",
    "Poly(vinyl alcohol)",
    "Poly vinyl alcohol"
  ],
  inciTerms: ["Polyvinyl Alcohol"],
  casNumbers: [
    "25213-24-5", // Most common CAS for PVA
    "9002-89-5"   // Alternative CAS for PVA
  ],
  additional: [
    "Film", 
    "Soluble film", 
    "Dissolving film",
    "Mowiol", // Commercial name
    "Elvanol", // Commercial name
    "Vinnapas" // Commercial name
  ]
};

export const getAllPvaPatterns = () => {
  const allPatterns = [];
  
  for (const category in PVA_KEYWORDS_CATEGORIES) {
    allPatterns.push(...PVA_KEYWORDS_CATEGORIES[category]);
  }
  
  return allPatterns;
};

export function getProductSubmissions(userId = null) {
  try {
    const productsString = localStorage.getItem('products') || localStorage.getItem('product_submissions');
    if (!productsString) return [];
    const submissions = JSON.parse(productsString) || [];
    
    if (userId) {
      return submissions.filter(sub => sub.uploadedBy === userId);
    }
    
    console.log(`Retrieved ${submissions.length} product submissions from localStorage`);
    return submissions;
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
    
    const productsString = localStorage.getItem('products') || localStorage.getItem('product_submissions');
    if (!productsString) {
      console.log("No products found in localStorage");
      return false;
    }
    
    const allProducts = JSON.parse(productsString);
    
    const productExists = allProducts.some(p => p.id === productId);
    if (!productExists) {
      console.error("Product not found in localStorage:", productId);
      return false;
    }
    
    const filteredProducts = allProducts.filter(p => p.id !== productId);
    
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    localStorage.setItem('product_submissions', JSON.stringify(filteredProducts));
    
    console.log("Product deleted, remaining products:", filteredProducts.length);
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

export class ProductSubmission {
  id = "";
  name = "";
  brand = "";
  // other properties as needed
}

export const submitProduct = async (data, userId) => {
  console.info("Product submission:", data);
  
  try {
    const newSubmission = {
      id: `sub_${Date.now()}`,
      name: data.name,
      brand: data.brand,
      type: data.type,
      ingredients: data.ingredients,
      country: data.countries?.length ? data.countries.join(', ') : data.country,
      websiteUrl: data.websiteUrl,
      comments: data.comments,
      approved: false,
      pvaStatus: 'needs-verification',
      pvaPercentage: data.pvaPercentage !== undefined ? data.pvaPercentage : null,
      brandVerified: false,
      brandOwnershipRequested: false,
      timestamp: Date.now(),
      uploadedBy: userId
    };
    
    if (data.ingredients) {
      const ingredientsLower = data.ingredients.toLowerCase();
      if (ingredientsLower.includes('polyvinyl alcohol') || 
          ingredientsLower.includes('pva') || 
          ingredientsLower.includes('poly(vinyl alcohol)') ||
          ingredientsLower.includes('25213-24-5') ||
          ingredientsLower.includes('9002-89-5')) {
        newSubmission.pvaStatus = 'contains';
        
        if (data.pvaPercentage !== undefined) {
          newSubmission.pvaPercentage = data.pvaPercentage;
        } else {
          const percentMatch = ingredientsLower.match(/pva[^\d]*(\d+(?:\.\d+)?)%/);
          if (percentMatch) {
            newSubmission.pvaPercentage = parseFloat(percentMatch[1]);
          } else {
            newSubmission.pvaPercentage = 25;
          }
        }
      }
    }
    
    if (newSubmission.pvaStatus === 'contains' && newSubmission.pvaPercentage === null) {
      newSubmission.pvaPercentage = 25;
    }
    
    if (data.media && data.media.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      newSubmission.timestamp = Date.now();
    }
    
    const existingSubmissionsString = localStorage.getItem('product_submissions') || localStorage.getItem('products') || '[]';
    const existingSubmissions = JSON.parse(existingSubmissionsString);
    const updatedSubmissions = [...existingSubmissions, newSubmission];
    
    localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
    localStorage.setItem('products', JSON.stringify(updatedSubmissions));
    
    console.log("Product submitted successfully:", newSubmission.name, "- Pending approval");
    
    return true;
  } catch (error) {
    console.error("Error submitting product:", error);
    return false;
  }
};

export const updateProductSubmission = (productId, updatedData) => {
  try {
    if (!productId) {
      console.error("No product ID provided for update");
      return false;
    }
    
    console.log("Updating product with ID:", productId, "with data:", updatedData);
    
    const productsString = localStorage.getItem('products') || localStorage.getItem('product_submissions');
    if (!productsString) {
      console.log("No products found in localStorage");
      return false;
    }
    
    const allProducts = JSON.parse(productsString);
    
    const productIndex = allProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      console.error("Product not found in localStorage:", productId);
      return false;
    }
    
    const updatedProduct = {
      ...allProducts[productIndex],
      ...updatedData,
      updated_at: Date.now()
    };
    
    allProducts[productIndex] = updatedProduct;
    
    localStorage.setItem('products', JSON.stringify(allProducts));
    localStorage.setItem('product_submissions', JSON.stringify(allProducts));
    
    console.log("Product updated successfully:", updatedProduct.name);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
};

export const analyzePvaContent = (ingredients) => {
  if (!ingredients) {
    return { containsPva: false, detectedTerms: [], isExplicitlyFree: false };
  }
  
  const ingredientsLower = ingredients.toLowerCase();
  const allPatterns = [
    "pva", "pvoh", "polyvinyl alcohol", "poly vinyl alcohol", "poly(vinyl alcohol)",
    "ethenol homopolymer", "vinyl alcohol polymer", "polyethenol", "pvac", "polyvinyl acetate",
    "alcohol, polyvinyl", "polyvinyl alcohol, partially hydrolyzed",
    "poval", "vinnapas", "mowiol", "elvanol",
    "25213-24-5", "9002-89-5" // CAS numbers
  ];
  const detectedTerms = [];
  
  for (const pattern of allPatterns) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    
    if (regex.test(ingredientsLower)) {
      detectedTerms.push(pattern);
    }
  }
  
  for (const pattern of allPatterns) {
    if (ingredientsLower.includes(pattern) && !detectedTerms.includes(pattern)) {
      detectedTerms.push(pattern);
    }
  }
  
  const freePatterns = [
    'pva-free', 
    'pva free', 
    'free from pva', 
    'does not contain pva',
    'without pva',
    'no pva',
    'pva: none',
    'pva: 0%',
    'free of polyvinyl alcohol'
  ];
  
  const isExplicitlyFree = freePatterns.some(pattern => 
    ingredientsLower.includes(pattern)
  );
  
  return { 
    containsPva: detectedTerms.length > 0, 
    detectedTerms,
    isExplicitlyFree
  };
};

export const analyzePastedIngredients = (ingredients) => {
  if (!ingredients || ingredients.trim() === '') {
    return {
      pvaStatus: 'needs-verification',
      detectedTerms: [],
      confidence: 'low'
    };
  }

  const analysis = analyzePvaContent(ingredients);
  
  if (analysis.containsPva) {
    return {
      pvaStatus: 'contains',
      detectedTerms: analysis.detectedTerms,
      confidence: analysis.detectedTerms.length > 1 ? 'high' : 'medium'
    };
  } else if (analysis.isExplicitlyFree) {
    return {
      pvaStatus: 'verified-free',
      detectedTerms: [],
      confidence: 'high'
    };
  } else {
    return {
      pvaStatus: 'needs-verification',
      detectedTerms: [],
      confidence: 'low'
    };
  }
};
