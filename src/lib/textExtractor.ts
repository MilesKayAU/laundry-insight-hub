import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export type ExtractedText = {
  text: string;
  source: 'pdf' | 'image';
  filename: string;
};

export type PvaStatus = 'contains' | 'inconclusive' | 'verified-free' | 'needs-verification';

export interface ProductSubmission {
  id: string;
  name: string;
  brand: string;
  type: string;
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  pvaPercentage: number | null;
  submittedAt: number;
  approved: boolean;
  // New fields for PVA-free page
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
}

// PVA-related keywords to scan for, organized by category
export const PVA_KEYWORDS_CATEGORIES = {
  commonNames: [
    'pva',
    'pvoh',
    'pval',
    'poly(vinyl alcohol)',
    'polyvinyl alcohol',
    'polyvinylalcohol',
    'polyvinyl alcohol homopolymer',
    'pva copolymer',
    'pva resin',
    'hydrolyzed pva',
    'partially hydrolyzed pva',
    'fully hydrolyzed pva',
    'pva film',
    'pva sheet',
    'pva coating'
  ],
  chemicalSynonyms: [
    'cas 9002-89-5',
    'cas 25213-24-5',
    'ethenol, homopolymer',
    'vinyl alcohol polymer',
    'ethenol, polymer with acetic acid, hydrolyzed',
    'acetic acid ethenyl ester, polymer with ethenol, hydrolyzed',
    'pva copolymer with ethylene',
    'vinyl acetate / vinyl alcohol copolymer'
  ],
  inciTerms: [
    'polyvinyl alcohol',
    'vinyl alcohol/vinyl acetate copolymer',
    'polyvinyl acetate',
    'pvac'
  ],
  additional: [
    'poly vinyl alcohol',
    'poly-vinyl-alcohol',
    'pvai',
    'vinyl alcohol',
    'ethenol homopolymer',
    'ethanol homopolymer'
  ]
};

// Flattened list of all PVA-related keywords for scanning
export const PVA_KEYWORDS = [
  ...PVA_KEYWORDS_CATEGORIES.commonNames,
  ...PVA_KEYWORDS_CATEGORIES.chemicalSynonyms,
  ...PVA_KEYWORDS_CATEGORIES.inciTerms,
  ...PVA_KEYWORDS_CATEGORIES.additional
];

// Function to extract text from PDF files
export const extractTextFromPDF = async (file: File): Promise<ExtractedText> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    return {
      text: fullText.trim(),
      source: 'pdf',
      filename: file.name
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Function to extract text from image files
export const extractTextFromImage = async (file: File): Promise<ExtractedText> => {
  try {
    const worker = await createWorker('eng');
    
    // Convert file to blob URL for Tesseract to use
    const imageBlob = new Blob([await file.arrayBuffer()]);
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Recognize text from image
    const { data } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    // Clean up the blob URL after use
    URL.revokeObjectURL(imageUrl);
    
    return {
      text: data.text,
      source: 'image',
      filename: file.name
    };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Function to find unique instances of PVA keywords in text
export const findKeywordsInText = (text: string, keywords: string[]): string[] => {
  const lowerText = text.toLowerCase();
  
  // First pass: Find all matching keywords and their positions
  const matchesWithPositions = keywords.flatMap(keyword => {
    const keywordLower = keyword.toLowerCase();
    const matches: { keyword: string, position: number }[] = [];
    let position = lowerText.indexOf(keywordLower);
    
    while (position !== -1) {
      matches.push({ keyword, position });
      position = lowerText.indexOf(keywordLower, position + 1);
    }
    
    return matches;
  });
  
  // Sort matches by position
  matchesWithPositions.sort((a, b) => a.position - b.position);
  
  // Second pass: Filter out overlapping matches
  const uniqueMatches: string[] = [];
  const usedRanges: { start: number, end: number }[] = [];
  
  for (const match of matchesWithPositions) {
    const start = match.position;
    const end = start + match.keyword.length;
    
    // Check if this match overlaps with any previously used range
    const overlaps = usedRanges.some(range => 
      (start >= range.start && start < range.end) || // Start is within a used range
      (end > range.start && end <= range.end) || // End is within a used range
      (start <= range.start && end >= range.end) // Match completely contains a used range
    );
    
    if (!overlaps) {
      uniqueMatches.push(match.keyword);
      usedRanges.push({ start, end });
    }
  }
  
  // Third pass: Remove duplicates
  return [...new Set(uniqueMatches)];
};

// Function to determine PVA status based on analysis
export const determinePvaStatus = (foundKeywords: string[], previouslyVerifiedBrands: string[], currentBrand: string): PvaStatus => {
  if (foundKeywords.length > 0) {
    return 'contains';
  }
  
  if (previouslyVerifiedBrands.includes(currentBrand)) {
    return 'verified-free';
  }
  
  // If no keywords found but brand not previously verified
  if (foundKeywords.length === 0 && !previouslyVerifiedBrands.includes(currentBrand)) {
    return 'needs-verification';
  }
  
  return 'inconclusive';
};

// Local storage functions for product submissions
export const saveProductSubmission = (submission: ProductSubmission): void => {
  try {
    // Get current submissions from local storage
    const currentSubmissionsString = localStorage.getItem('productSubmissions');
    const currentSubmissions: ProductSubmission[] = currentSubmissionsString 
      ? JSON.parse(currentSubmissionsString) 
      : [];
    
    // Add new submission
    currentSubmissions.push(submission);
    
    // Save back to local storage
    localStorage.setItem('productSubmissions', JSON.stringify(currentSubmissions));
    
    console.log('Submission saved to local storage:', submission);
  } catch (error) {
    console.error('Error saving submission to local storage:', error);
  }
};

export const getProductSubmissions = (): ProductSubmission[] => {
  try {
    const submissionsString = localStorage.getItem('productSubmissions');
    return submissionsString ? JSON.parse(submissionsString) : [];
  } catch (error) {
    console.error('Error retrieving submissions from local storage:', error);
    return [];
  }
};

export const updateProductApproval = (productId: string, approved: boolean): void => {
  try {
    const submissions = getProductSubmissions();
    const updatedSubmissions = submissions.map(submission => 
      submission.id === productId ? { ...submission, approved } : submission
    );
    localStorage.setItem('productSubmissions', JSON.stringify(updatedSubmissions));
  } catch (error) {
    console.error('Error updating product approval status:', error);
  }
};

export const deleteProductSubmission = (productId: string): void => {
  try {
    const submissions = getProductSubmissions();
    const filteredSubmissions = submissions.filter(submission => submission.id !== productId);
    localStorage.setItem('productSubmissions', JSON.stringify(filteredSubmissions));
  } catch (error) {
    console.error('Error deleting product submission:', error);
  }
};

export const getVerifiedBrands = (): string[] => {
  try {
    const submissions = getProductSubmissions();
    // Extract unique brand names from approved submissions
    const verifiedBrands = [...new Set(
      submissions
        .filter(submission => submission.approved && submission.pvaStatus !== 'contains')
        .map(submission => submission.brand)
    )];
    return verifiedBrands;
  } catch (error) {
    console.error('Error getting verified brands:', error);
    return [];
  }
};
