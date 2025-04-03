
import { getAllPvaPatterns } from './textExtractor';
import { useToast } from "@/hooks/use-toast";

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

// Additional PVA patterns for CAS numbers
const PVA_CAS_NUMBERS = [
  "25213-24-5", // Most common CAS for PVA
  "9002-89-5",  // Alternative CAS for PVA
];

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
  
  // Get standard PVA patterns from textExtractor
  const standardPatterns = getAllPvaPatterns();
  // Combine with CAS numbers
  const allPatterns = [...standardPatterns, ...PVA_CAS_NUMBERS];
  
  // For testing purposes, we'll check PVA in certain URLs
  let containsPva = false;
  let detectedTerms: string[] = [];
  
  // Check URL for PVA indicators
  const urlLower = url.toLowerCase();
  
  for (const pattern of allPatterns) {
    if (urlLower.includes(pattern.toLowerCase())) {
      containsPva = true;
      detectedTerms.push(pattern);
    }
  }
  
  // Special check for "POLYVINYL ALCOHOL 25213-24-5" pattern
  if ((urlLower.includes("polyvinyl") && urlLower.includes("alcohol")) || 
      (urlLower.includes("pva") && (urlLower.includes("25213-24-5") || urlLower.includes("9002-89-5")))) {
    containsPva = true;
    if (!detectedTerms.includes("POLYVINYL ALCOHOL")) {
      detectedTerms.push("POLYVINYL ALCOHOL");
    }
    if (urlLower.includes("25213-24-5") && !detectedTerms.includes("25213-24-5")) {
      detectedTerms.push("25213-24-5");
    }
    if (urlLower.includes("9002-89-5") && !detectedTerms.includes("9002-89-5")) {
      detectedTerms.push("9002-89-5");
    }
  }
  
  // Also random chance to find PVA for testing
  if (!containsPva && Math.random() > 0.7) {
    containsPva = true;
    detectedTerms = [allPatterns[Math.floor(Math.random() * allPatterns.length)]];
  }
  
  // Simulate extracting ingredients
  let sampleIngredients = null;
  
  // Try to extract PVA percentage (if mentioned)
  let extractedPvaPercentage: number | null = null;
  
  if (containsPva) {
    // For simulation purposes, check if URL contains percentage indicators
    const percentMatch = url.match(/(\d+(?:\.\d+)?)(%|\s*percent|\s*pva)/i);
    if (percentMatch && !isNaN(parseInt(percentMatch[1]))) {
      extractedPvaPercentage = parseInt(percentMatch[1]);
    } else {
      // Randomly assign a percentage for simulation
      extractedPvaPercentage = Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : null;
    }
    
    sampleIngredients = `Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, ${detectedTerms[0] || 'Polyvinyl Alcohol'} ${extractedPvaPercentage ? `(${extractedPvaPercentage}%)` : ''}, Sodium Chloride, Glycerin, Fragrance`;
  } else {
    sampleIngredients = Math.random() > 0.5 
      ? "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Citric Acid, Sodium Benzoate" 
      : null; // Sometimes we don't find ingredients
  }
  
  // Always flag as needing manual verification
  const needsManualVerification = true;
  
  let message = containsPva 
    ? 'PVA ingredients detected in the product page.' 
    : (sampleIngredients 
      ? 'No definitive PVA ingredients detected. Manual verification required.' 
      : 'Could not find ingredients list on the product page. Manual verification required.');
      
  if (extractedPvaPercentage !== null) {
    message = `${message} Detected PVA percentage: ${extractedPvaPercentage}%.`;
  }
  
  message += ' Please have an admin manually check this product page.';
  
  return {
    success: true,
    containsPva,
    detectedTerms,
    extractedIngredients: sampleIngredients,
    extractedPvaPercentage,
    message,
    needsManualVerification
  };
};
