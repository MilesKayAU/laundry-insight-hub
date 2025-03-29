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
  country: string; 
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  pvaPercentage?: number | null;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
  description?: string;
  ingredients?: string; // Added ingredients field
  submittedAt: string;
  dateSubmitted?: string;
  approved: boolean;
  brandVerified?: boolean;
  brandOwnershipRequested?: boolean;
  brandContactEmail?: string;
  brandOwnershipRequestDate?: string;
  brandVerificationDate?: string;
}

// Extract text from image using Tesseract OCR
export const extractTextFromImage = async (file: File): Promise<{ text: string }> => {
  try {
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(file);
    
    // Use Tesseract.js to extract text from the image
    const result = await Tesseract.recognize(
      imageUrl,
      'eng', // Language: English
      { 
        logger: m => console.log(m) // Optional: log progress to console
      }
    );
    
    // Clean up the URL to prevent memory leaks
    URL.revokeObjectURL(imageUrl);
    
    // Return the extracted text
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

// Get stored product submissions from local storage
export const getProductSubmissions = (): ProductSubmission[] => {
  try {
    // Force a fresh read from localStorage
    const storageString = localStorage.getItem('productSubmissions');
    if (!storageString) return [];
    
    // Parse and return the data
    const submissions = JSON.parse(storageString) as ProductSubmission[];
    console.info(`Retrieved ${submissions.length} product submissions`);
    return submissions;
  } catch (error) {
    console.error("Error retrieving product submissions:", error);
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
  
  // Check for each PVA pattern in the ingredients
  for (const pattern of allPatterns) {
    // Use word boundary regex to avoid partial matches
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    
    if (regex.test(ingredientsLower)) {
      detectedTerms.push(pattern);
    }
  }
  
  // Also check for general cases without word boundaries
  for (const pattern of allPatterns) {
    if (ingredientsLower.includes(pattern) && !detectedTerms.includes(pattern)) {
      detectedTerms.push(pattern);
    }
  }
  
  // Check for explicit PVA-free claims
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
