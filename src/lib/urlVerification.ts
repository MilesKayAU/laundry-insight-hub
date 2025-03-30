
import { getAllPvaPatterns } from './textExtractor';

interface VerificationResult {
  success: boolean;
  containsPva: boolean;
  detectedTerms: string[];
  extractedIngredients: string | null;
  message: string;
  url?: string;
}

export const verifyProductUrl = async (
  url: string
): Promise<VerificationResult> => {
  if (!url || !url.startsWith('http')) {
    return {
      success: false,
      containsPva: false,
      detectedTerms: [],
      extractedIngredients: null,
      message: 'Invalid URL provided. Please enter a valid product URL.'
    };
  }

  try {
    console.log(`Attempting to verify product at URL: ${url}`);
    
    // In a real implementation, this would be an edge function
    // For now, we'll simulate the behavior
    const response = await simulateUrlScan(url);
    return {
      ...response,
      url: url // Add the URL to the response for manual verification
    };
  } catch (error) {
    console.error('Error verifying product URL:', error);
    return {
      success: false,
      containsPva: false,
      detectedTerms: [],
      extractedIngredients: null,
      message: 'Failed to scan the product URL. Please try again later.'
    };
  }
};

// Simulate URL scanning - in production this would be a server-side function
// that actually fetches and parses the website content
const simulateUrlScan = async (url: string): Promise<VerificationResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For testing purposes, we'll simulate finding PVA in certain URLs
  const containsPva = url.includes('pva') || 
                     url.includes('polyvinyl') || 
                     Math.random() > 0.7; // Randomly find PVA sometimes
  
  const pvaPatterns = getAllPvaPatterns();
  const randomDetectedTerms = containsPva 
    ? pvaPatterns.slice(0, Math.floor(Math.random() * 3) + 1) 
    : [];
  
  // Simulate extracting ingredients
  let sampleIngredients = null;
  if (containsPva) {
    sampleIngredients = `Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, ${randomDetectedTerms[0] || 'Polyvinyl Alcohol'}, Sodium Chloride, Glycerin, Fragrance`;
  } else {
    sampleIngredients = Math.random() > 0.5 
      ? "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Citric Acid, Sodium Benzoate" 
      : null; // Sometimes we don't find ingredients
  }
  
  return {
    success: true,
    containsPva,
    detectedTerms: randomDetectedTerms,
    extractedIngredients: sampleIngredients,
    message: containsPva 
      ? 'PVA ingredients detected in the product page.' 
      : sampleIngredients 
        ? 'No PVA ingredients detected in the product page.' 
        : 'Could not find ingredients list on the product page.'
  };
};
