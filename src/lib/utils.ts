
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProductSubmission } from "./textExtractor";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to safely handle external links
export function getSafeExternalLinkProps({ url }: { url: string }) {
  console.info("Processing URL in getSafeExternalLinkProps:", url);

  if (!url || url === '#' || !isValidUrl(url)) {
    console.warn("Empty or invalid URL provided to getSafeExternalLinkProps:", url);
    return {
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        console.warn("Prevented navigation to invalid URL:", url);
      }
    };
  }

  return {
    href: url,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

// Parse and validate URL
export function parseUrl(url: string) {
  if (!url || url.trim() === '') return null;
  
  try {
    // Handle URLs without protocol
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }
    
    const parsedUrl = new URL(url);
    return parsedUrl;
  } catch (e) {
    console.warn("Invalid URL format:", url, e);
    return null;
  }
}

// Function to validate URLs
export function isValidUrl(url: string) {
  return !!parseUrl(url);
}

// Function to format URL for display
export function formatUrlForDisplay(url: string) {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return url;
  
  return parsedUrl.hostname;
}

// Format a URL safely
export function formatSafeUrl(url: string) {
  if (!url || url.trim() === '') return '';
  
  const parsedUrl = parseUrl(url);
  return parsedUrl ? parsedUrl.href : '';
}

// Normalize brand name 
export function normalizeBrandName(brand: string): string {
  if (!brand) return '';
  const normalized = brand.trim();
  console.log(`Normalized brand name from "${brand}" to "${normalized}"`);
  return normalized;
}

// Normalize product field names between Supabase and local storage
export function normalizeProductFieldNames(product: any): ProductSubmission {
  if (!product) return {} as ProductSubmission;
  
  // Create a normalized object that works with ProductSubmission type
  const normalized: ProductSubmission = {
    id: product.id || '',
    name: product.name || '',
    brand: product.brand || '',
    type: product.type || 'Detergent',
    
    // Handle database (snakecase) vs client (camelcase) naming differences
    pvaStatus: product.pvastatus || product.pvaStatus || 'needs-verification',
    pvaPercentage: product.pvapercentage !== undefined ? product.pvapercentage : 
                   (product.pvaPercentage !== undefined ? product.pvaPercentage : null),
    
    description: product.description || '',
    approved: product.approved !== undefined ? product.approved : true,
    country: product.country || 'Global',
    
    // URL fields - support both naming conventions
    websiteUrl: product.websiteurl || product.websiteUrl || '',
    videoUrl: product.videourl || product.videoUrl || '',
    imageUrl: product.imageurl || product.imageUrl || '',
    
    // Support both naming formats for database compatibility
    websiteurl: product.websiteurl || product.websiteUrl || '',
    videourl: product.videourl || product.videoUrl || '',
    imageurl: product.imageurl || product.imageUrl || '',
    
    ingredients: product.ingredients || '',
    
    // Use the timestamp fields if they exist
    timestamp: product.timestamp || Date.now(),
    dateSubmitted: product.dateSubmitted || product.createdat || new Date().toISOString(),
    submittedAt: product.submittedAt || product.createdat || new Date().toISOString(),
    
    // Other fields
    brandVerified: product.brandVerified !== undefined ? product.brandVerified : false,
    brandOwnershipRequested: product.brandOwnershipRequested !== undefined ? 
                             product.brandOwnershipRequested : false,
    brandContactEmail: product.brandContactEmail || '',
    brandOwnershipRequestDate: product.brandOwnershipRequestDate || '',
    brandVerificationDate: product.brandVerificationDate || '',
    uploadedBy: product.owner_id || product.uploadedBy || ''
  };
  
  return normalized;
}

// Debug helper to log product URL information
export function logProductUrlInfo(product: any, context: string) {
  if (!product) {
    console.log(`[${context}] No product provided for URL info logging`);
    return;
  }
  
  console.log(`[${context}] Product URL info for "${product.name}":`, {
    websiteUrl: product.websiteUrl,
    websiteurl: product.websiteurl,
    videoUrl: product.videoUrl,
    videourl: product.videourl,
    imageUrl: product.imageUrl,
    imageurl: product.imageurl
  });
}

// Normalize for case-insensitive database comparison
export function normalizeForDatabaseComparison(text: string): string {
  if (!text) return '';
  const normalized = text.toLowerCase().trim();
  console.log(`Normalized for DB comparison: "${text}" to "${normalized}"`);
  return normalized;
}

// Create a case-insensitive query for Supabase
export function createCaseInsensitiveQuery(columnName: string, value: string) {
  const normalized = normalizeForDatabaseComparison(value);
  return `${columnName}.ilike.%${normalized}%`;
}

// Normalize brand slug for URL usage
export function normalizeBrandSlug(brandName: string): string {
  if (!brandName) return '';
  const normalized = brandName.trim().toLowerCase().replace(/\s+/g, '-');
  console.log(`Normalized brand slug: "${brandName}" to "${normalized}"`);
  return normalized;
}

// Decode brand name from URL parameter
export function decodeBrandNameFromUrl(encodedBrandName: string): string {
  if (!encodedBrandName) return '';
  try {
    const decoded = decodeURIComponent(encodedBrandName);
    const normalized = normalizeBrandName(decoded);
    console.log(`Decoded URL parameter "${encodedBrandName}" to brand name "${normalized}"`);
    return normalized;
  } catch (e) {
    console.warn(`Error decoding brand name from URL: ${encodedBrandName}`, e);
    return encodedBrandName.trim();
  }
}
