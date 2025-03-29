
// Tesseract.js for OCR (Optical Character Recognition)
import Tesseract from 'tesseract.js';

// Get product submissions from localStorage
export const getProductSubmissions = () => {
  const submissions = localStorage.getItem('product_submissions');
  return submissions ? JSON.parse(submissions) : [];
};

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

// Define the ProductSubmission type
export interface ProductSubmission {
  id: string;
  brand: string;
  name: string;
  type: string;
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive' | string;
  pvaPercentage: number | null;
  extractedText?: string;
  foundKeywords?: string[];
  hasSDSFile?: boolean;
  additionalNotes?: string;
  userId?: string | null;
  userName?: string | null;
  mediaFiles?: string[];
  approved: boolean;
  dateSubmitted: string;
  submittedAt?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
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
