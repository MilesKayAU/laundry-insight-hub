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
  // Additional fields used throughout the codebase
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  submittedAt?: string;
  dateSubmitted?: string;
  brandContactEmail?: string;
  brandOwnershipRequestDate?: string;
  brandVerificationDate?: string;
  uploadedBy?: string; // Add user ID who submitted the product
}

// Now let's define the ProductSubmitData interface that's referenced elsewhere
export interface ProductSubmitData {
  name: string;
  brand: string;
  type: string;
  ingredients?: string;
  country?: string;
  countries?: string[]; // Added countries array for multi-select functionality
  websiteUrl?: string;
  comments?: string;
  media?: File[];
  pvaPercentage?: number; // Add pvaPercentage to the interface
}

// Extract text from image using Tesseract OCR
export const extractTextFromImage = async (file: File): Promise<{ text: string }> => {
  try {
    const imageUrl = URL.createObjectURL(file);
    
    const result = await Tesseract.recognize(
      imageUrl,
      'eng', // Language: English
      { 
        logger: m => console.log(m) // Optional: log progress to console
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
export const deleteProductSubmission = (productId: string) => {
  const submissions = getProductSubmissions();
  const updatedSubmissions = submissions.filter(submission => submission.id !== productId);
  localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
  return updatedSubmissions;
};

// Modified function to add fallback data if localStorage is empty
export const getProductSubmissions = (userId?: string): ProductSubmission[] => {
  try {
    const storedSubmissions = localStorage.getItem('product_submissions');
    
    if (storedSubmissions) {
      const submissions = JSON.parse(storedSubmissions);
      
      // If a userId is provided, filter submissions to only show those from this user
      if (userId) {
        return submissions.filter(submission => 
          submission.uploadedBy === userId || 
          // If no uploadedBy field exists, don't include in user-specific results
          (submission.uploadedBy === undefined && submission.id.startsWith('default_'))
        );
      }
      
      return submissions;
    } else {
      console.warn('No product submissions found in localStorage, using fallback data');
      // Fallback data with pre-populated Australian products
      const fallbackData: ProductSubmission[] = [
        {
          id: 'default_product_1',
          brand: 'Lil\' Bit Better',
          name: 'Laundry Detergent Sheets',
          type: 'Laundry Sheets',
          country: 'Australia',
          pvaStatus: 'verified-free',
          pvaPercentage: 0,
          description: 'These laundry sheets are PVA-free and environmentally friendly.',
          imageUrl: 'https://littleecoshop.com.au/cdn/shop/files/LilBitBetter-LaundrySheets-_Front_1200x1200.jpg?v=1694400671',
          websiteUrl: 'https://littleecoshop.com.au/products/lil-bit-better-laundry-detergent-sheets',
          submittedAt: new Date().toISOString(),
          approved: true,
          dateSubmitted: new Date().toISOString(),
          brandVerified: true,
          brandContactEmail: "",
          ingredients: "Sodium dodecyl sulfate, Sodium carbonate, Sodium silicate, Sodium percarbonate, Sodium carboxymethyl cellulose, Water conditioner, Brightening agent, Fragrance",
          uploadedBy: 'system'  // Mark as system-added to distinguish from user submissions
        },
        {
          id: 'default_product_2',
          brand: 'Zero Co',
          name: 'Laundry Liquid',
          type: 'Laundry Liquid',
          country: 'Australia',
          pvaStatus: 'verified-free',
          pvaPercentage: 0,
          description: 'Plant-based laundry liquid that\'s tough on stains but gentle on the planet.',
          imageUrl: 'https://cdn.shopify.com/s/files/1/0073/9212/7830/products/REFILLABLE-LAUNDRY-LIQUID_720x.jpg?v=1676936205',
          websiteUrl: 'https://zeroco.com.au/products/laundry-liquid',
          submittedAt: new Date().toISOString(),
          approved: true,
          dateSubmitted: new Date().toISOString(),
          brandVerified: true,
          brandContactEmail: "",
          ingredients: "Water, Decyl Glucoside, Sodium Lauryl Ether Sulfate, Cocamidopropyl Betaine, Sodium Citrate, Glycerin",
          uploadedBy: 'system'  // Mark as system-added
        },
        {
          id: 'default_product_3',
          brand: 'Dirt',
          name: 'Laundry Powder',
          type: 'Laundry Powder',
          country: 'Australia',
          pvaStatus: 'verified-free',
          pvaPercentage: 0,
          description: 'Australian-made, plant-based laundry powder that\'s free from PVA.',
          imageUrl: 'https://www.dirtcompany.com.au/wp-content/uploads/2021/04/LP_OH_Web1000x1000-square.jpg',
          websiteUrl: 'https://www.dirtcompany.com.au/product/laundry-powder/',
          submittedAt: new Date().toISOString(),
          approved: true,
          dateSubmitted: new Date().toISOString(),
          brandVerified: true,
          brandContactEmail: "",
          ingredients: "Sodium carbonate, Sodium bicarbonate, Sodium percarbonate, Sodium citrate, Plant-derived surfactants",
          uploadedBy: 'system'  // Mark as system-added
        },
        {
          id: 'default_product_4',
          brand: 'That Red House',
          name: 'Soapberries',
          type: 'Soapberries',
          country: 'Australia',
          pvaStatus: 'verified-free',
          pvaPercentage: 0,
          description: 'Natural laundry detergent alternative made from dried soapberry shells.',
          imageUrl: 'https://www.thatredhouse.com.au/wp-content/uploads/2019/05/soap-nuts-bag-organic.jpg',
          websiteUrl: 'https://www.thatredhouse.com.au/product/organic-soapberries/',
          submittedAt: new Date().toISOString(),
          approved: true,
          dateSubmitted: new Date().toISOString(),
          brandVerified: true,
          brandContactEmail: "",
          ingredients: "100% Sapindus Mukorossi (Soapberry shells)",
          uploadedBy: 'system'  // Mark as system-added
        }
      ];
      
      // Store the fallback data in localStorage for future sessions
      localStorage.setItem('product_submissions', JSON.stringify(fallbackData));
      
      // If a userId is provided, return an empty array as these are system defaults
      if (userId) {
        return [];
      }
      
      return fallbackData;
    }
  } catch (error) {
    console.error('Error retrieving product submissions:', error);
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
    country: submission.country || 'Global', // Default country to Global
    pvaStatus: submission.pvaStatus || 'needs-verification',
    pvaPercentage: submission.pvaPercentage || null,
    ingredients: submission.ingredients || '',
    submittedAt: submission.submittedAt || new Date().toISOString(),
    approved: submission.approved || false,
    brandVerified: submission.brandVerified || false,
    ...submission
  };
};

// Analyze ingredients for PVA content
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
  
  // Determine status and confidence level
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
    // No explicit mention found either way
    return {
      pvaStatus: 'needs-verification',
      detectedTerms: [],
      confidence: 'low'
    };
  }
};

// Simulate product submission
export const submitProduct = async (data: ProductSubmitData, userId?: string): Promise<boolean> => {
  // Simulated product submission
  console.info("Product submission:", data);
  
  try {
    // In a real application, this would send the data to the server
    // For now, we'll add it to local storage
    
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
      uploadedBy: userId // Store the user ID who submitted this product
    };
    
    // Simulate PVA detection from ingredients if available
    if (data.ingredients) {
      const ingredientsLower = data.ingredients.toLowerCase();
      if (ingredientsLower.includes('polyvinyl alcohol') || 
          ingredientsLower.includes('pva') || 
          ingredientsLower.includes('poly(vinyl alcohol)')) {
        newSubmission.pvaStatus = 'contains';
        
        // If a percentage was manually entered, use that
        if (data.pvaPercentage !== undefined) {
          newSubmission.pvaPercentage = data.pvaPercentage;
        } else {
          // Simulate finding a percentage from the text
          const percentMatch = ingredientsLower.match(/pva[^\d]*(\d+(?:\.\d+)?)%/);
          if (percentMatch) {
            newSubmission.pvaPercentage = parseFloat(percentMatch[1]);
          } else {
            newSubmission.pvaPercentage = 25; // Default to 25% if PVA is mentioned but no percentage
          }
        }
      }
    }
    
    // If PVA status is 'contains' but no percentage is set, default to 25%
    if (newSubmission.pvaStatus === 'contains' && newSubmission.pvaPercentage === null) {
      newSubmission.pvaPercentage = 25;
    }
    
    // Simulate image analysis (would be server-side in production)
    if (data.media && data.media.length > 0) {
      // Simulate delay for "processing" images
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set a timestamp to make it feel like we did something with the images
      newSubmission.timestamp = Date.now();
    }
    
    // Store submission in local storage
    const existingSubmissions = getProductSubmissions();
    const updatedSubmissions = [...existingSubmissions, newSubmission];
    localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
    
    return true;
  } catch (error) {
    console.error("Error submitting product:", error);
    return false;
  }
};
