import { createHash } from "crypto";
import Tesseract from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';

// PVA keyword categories for detection in documents
export const PVA_KEYWORDS_CATEGORIES = {
  commonNames: [
    "pva",
    "pvoh",
    "polyvinyl alcohol",
    "poly vinyl alcohol",
    "poly(vinyl alcohol)"
  ],
  chemicalSynonyms: [
    "ethenol homopolymer",
    "vinyl alcohol polymer",
    "polyethenol",
    "pvac",
    "polyvinyl acetate"
  ],
  inciTerms: [
    "alcohol, polyvinyl",
    "polyvinyl alcohol, partially hydrolyzed"
  ],
  additional: [
    "poval",
    "vinnapas"
  ]
};

// Get all PVA patterns as a flat array for detection
export const getAllPvaPatterns = () => {
  return [
    ...PVA_KEYWORDS_CATEGORIES.commonNames,
    ...PVA_KEYWORDS_CATEGORIES.chemicalSynonyms,
    ...PVA_KEYWORDS_CATEGORIES.inciTerms,
    ...PVA_KEYWORDS_CATEGORIES.additional
  ];
};

// Define the ProductSubmission type
export interface ProductSubmission {
  id: string;
  name: string;
  brand: string;
  type: string;
  ingredients?: string;
  approved: boolean;
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  pvaPercentage: number | null;
  country?: string;
  websiteUrl?: string;
  comments?: string;
  brandVerified: boolean;
  brandOwnershipRequested?: boolean;
  timestamp?: number;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  submittedAt?: string;
  dateSubmitted?: string;
  brandContactEmail?: string;
  brandOwnershipRequestDate?: string;
  brandVerificationDate?: string;
  uploadedBy?: string;
}

// Now let's define the ProductSubmitData interface that's referenced elsewhere
export interface ProductSubmitData {
  name: string;
  brand: string;
  type: string;
  ingredients?: string;
  country?: string;
  countries?: string[];
  websiteUrl?: string;
  comments?: string;
  media?: File[];
  pvaPercentage?: number;
}

// Extract text from image using Tesseract OCR
export const extractTextFromImage = async (file: File): Promise<{ text: string }> => {
  try {
    const imageUrl = URL.createObjectURL(file);
    
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      { 
        logger: m => console.log(m)
      }
    );
    
    URL.revokeObjectURL(imageUrl);
    
    return { text: result.data.text };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Update product approval status
export const updateProductApproval = (productId: string, approved: boolean) => {
  const submissions = getProductSubmissions();
  const updatedSubmissions = submissions.map(submission => 
    submission.id === productId 
      ? { ...submission, approved }
      : submission
  );
  localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
  return updatedSubmissions;
};

// Delete a product submission
export const deleteProductSubmission = (productId: string): boolean => {
  try {
    console.log("Attempting to delete product with ID:", productId);
    
    // Get all products from localStorage
    const storedProducts = localStorage.getItem('products');
    if (!storedProducts) {
      console.log("No products found in localStorage");
      return false;
    }
    
    // Parse products
    let products: ProductSubmission[] = JSON.parse(storedProducts);
    const initialCount = products.length;
    
    // Filter out the product to delete
    const filteredProducts = products.filter(p => p.id !== productId);
    
    if (filteredProducts.length === initialCount) {
      console.log("Product not found in storage, nothing was deleted");
      return false;
    }
    
    // Save filtered products back to localStorage
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    console.log(`Product deleted successfully. Products count: ${initialCount} → ${filteredProducts.length}`);
    
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

// Modified function to ensure we get all products with improved error handling
export const getProductSubmissions = (userId?: string): ProductSubmission[] => {
  try {
    const storedSubmissions = localStorage.getItem('product_submissions') || localStorage.getItem('products');
    
    if (storedSubmissions) {
      const submissions = JSON.parse(storedSubmissions);
      console.log(`Retrieved ${submissions.length} product submissions from localStorage`);
      
      if (userId) {
        const userSubmissions = submissions.filter(submission => 
          submission.uploadedBy === userId
        );
        console.log(`Filtered to ${userSubmissions.length} submissions for user ${userId}`);
        return userSubmissions;
      }
      
      return submissions;
    } else {
      console.warn('No product submissions found in localStorage, creating empty array');
      localStorage.setItem('product_submissions', JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error('Error retrieving product submissions:', error);
    localStorage.setItem('product_submissions', JSON.stringify([]));
    return [];
  }
};

// Helper function to create a new product submission with defaults
export const createProductSubmission = (submission: Partial<ProductSubmission>): ProductSubmission => {
  return {
    id: submission.id || uuidv4(),
    name: submission.name || '',
    brand: submission.brand || '',
    type: submission.type || '',
    country: submission.country || 'Global',
    pvaStatus: submission.pvaStatus || 'needs-verification',
    pvaPercentage: submission.pvaPercentage || null,
    ingredients: submission.ingredients || '',
    submittedAt: submission.submittedAt || new Date().toISOString(),
    approved: submission.approved || false,
    brandVerified: submission.brandVerified || false,
    ...submission
  };
};

// Function to analyze ingredients for PVA content
export const analyzePvaContent = (ingredients: string): { 
  containsPva: boolean; 
  detectedTerms: string[];
  isExplicitlyFree: boolean;
} => {
  if (!ingredients) {
    return { containsPva: false, detectedTerms: [], isExplicitlyFree: false };
  }
  
  const ingredientsLower = ingredients.toLowerCase();
  const allPatterns = getAllPvaPatterns();
  const detectedTerms: string[] = [];
  
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

// New utility to analyze pasted ingredients text
export const analyzePastedIngredients = (ingredients: string): {
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  detectedTerms: string[];
  confidence: 'high' | 'medium' | 'low';
} => {
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

// Simulate product submission
export const submitProduct = async (data: ProductSubmitData, userId?: string): Promise<boolean> => {
  console.info("Product submission:", data);
  
  try {
    const newSubmission: ProductSubmission = {
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
          ingredientsLower.includes('poly(vinyl alcohol)')) {
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
    
    const existingSubmissions = getProductSubmissions();
    const updatedSubmissions = [...existingSubmissions, newSubmission];
    localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
    
    return true;
  } catch (error) {
    console.error("Error submitting product:", error);
    return false;
  }
};

// Explicitly export the updateProductSubmission function
export const updateProductSubmission = (productId: string, updatedData: Partial<ProductSubmission>): boolean => {
  try {
    if (!productId) {
      console.error("No product ID provided for update");
      return false;
    }
    
    console.log("Updating product with ID:", productId, "with data:", updatedData);
    
    // Get all products from localStorage - trying both possible keys
    const productsString = localStorage.getItem('products') || localStorage.getItem('product_submissions');
    if (!productsString) {
      console.log("No products found in localStorage");
      return false;
    }
    
    const allProducts = JSON.parse(productsString);
    
    // Find the product to update
    const productIndex = allProducts.findIndex((p: ProductSubmission) => p.id === productId);
    if (productIndex === -1) {
      console.error("Product not found in localStorage:", productId);
      return false;
    }
    
    // Update the product with new data while preserving other properties
    const updatedProduct = {
      ...allProducts[productIndex],
      ...updatedData,
      updated_at: Date.now() // Add updated timestamp
    };
    
    console.log("Product before update:", allProducts[productIndex]);
    console.log("Product after update:", updatedProduct);
    
    // Replace the product in the array
    allProducts[productIndex] = updatedProduct;
    
    // Save back to localStorage - save to both locations to ensure compatibility
    localStorage.setItem('products', JSON.stringify(allProducts));
    localStorage.setItem('product_submissions', JSON.stringify(allProducts));
    
    console.log("Product updated successfully:", updatedProduct.name);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
};
