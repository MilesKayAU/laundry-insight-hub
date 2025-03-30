
import { getAllPvaPatterns } from './textExtractor';

interface VerificationResult {
  success: boolean;
  containsPva: boolean;
  detectedTerms: string[];
  extractedIngredients: string | null;
  extractedPvaPercentage: number | null;
  message: string;
  url?: string;
  needsManualVerification?: boolean;
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
      extractedPvaPercentage: null,
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
      extractedPvaPercentage: null,
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
  
  // Try to extract PVA percentage (if mentioned)
  let extractedPvaPercentage: number | null = null;
  
  if (containsPva) {
    // For simulation purposes, check if URL contains percentage indicators
    const percentageMatch = url.match(/(\d+)(%|percent|\s*pva)/i);
    if (percentageMatch && !isNaN(parseInt(percentageMatch[1]))) {
      extractedPvaPercentage = parseInt(percentageMatch[1]);
    } else {
      // Randomly assign a percentage for simulation
      extractedPvaPercentage = Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : null;
    }
    
    sampleIngredients = `Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, ${randomDetectedTerms[0] || 'Polyvinyl Alcohol'} ${extractedPvaPercentage ? `(${extractedPvaPercentage}%)` : ''}, Sodium Chloride, Glycerin, Fragrance`;
  } else {
    sampleIngredients = Math.random() > 0.5 
      ? "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Citric Acid, Sodium Benzoate" 
      : null; // Sometimes we don't find ingredients
  }
  
  // Always flag as needing manual verification if we don't definitively find PVA
  const needsManualVerification = !containsPva;
  
  let message = containsPva 
    ? 'PVA ingredients detected in the product page.' 
    : (sampleIngredients 
      ? 'No definitive PVA ingredients detected. Manual verification required.' 
      : 'Could not find ingredients list on the product page. Manual verification required.');
      
  if (extractedPvaPercentage !== null) {
    message = `${message} Detected PVA percentage: ${extractedPvaPercentage}%.`;
  }
  
  if (needsManualVerification) {
    message += ' Please have an admin manually check this product page.';
  }
  
  return {
    success: true,
    containsPva,
    detectedTerms: randomDetectedTerms,
    extractedIngredients: sampleIngredients,
    extractedPvaPercentage,
    message,
    needsManualVerification
  };
};

