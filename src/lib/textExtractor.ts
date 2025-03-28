
import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type ExtractedText = {
  text: string;
  source: 'pdf' | 'image';
  filename: string;
};

// Function to extract text from PDF files
export const extractTextFromPDF = async (file: File): Promise<ExtractedText> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    
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
    const worker = await createWorker();
    
    // Load image and recognize text
    const imageData = await file.arrayBuffer();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    
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

// Function to check if text contains specified keywords
export const findKeywordsInText = (text: string, keywords: string[]): string[] => {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
};
