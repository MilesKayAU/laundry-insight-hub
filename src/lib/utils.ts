
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProductSubmission } from "@/lib/textExtractor"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Improved external link handling with better error handling and logging
export function getSafeExternalLinkProps({ url }: { url: string }) {
  // Enhanced URL validation with debugging
  console.log(`Processing URL in getSafeExternalLinkProps: "${url}"`);
  
  // Handle empty or invalid URLs
  if (!url || url === '#' || url.trim() === '') {
    console.warn("Empty or invalid URL provided to getSafeExternalLinkProps:", url);
    return {
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("Prevented navigation to empty URL");
      },
      className: "text-muted-foreground cursor-not-allowed"
    };
  }

  // Ensure URL has a protocol
  let safeUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    safeUrl = `https://${url}`;
  }
  
  console.log(`External link: Original URL: "${url}", Safe URL: "${safeUrl}"`);
  
  return {
    href: safeUrl,
    target: "_blank",
    rel: "nofollow noopener noreferrer",
    className: "max-w-full overflow-hidden text-ellipsis hover:underline text-blue-600"
  };
}

// Improved URL validation with better debugging
export function isValidUrl(url: string): boolean {
  // First check for empty URLs
  if (!url || url === '#' || url.trim() === '') {
    console.log(`URL validation failed for "${url}": empty or placeholder`);
    return false;
  }
  
  try {
    // Add protocol if missing for validation purposes
    let urlToTest = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToTest = `https://${url}`;
    }
    
    // Validate URL format
    new URL(urlToTest);
    
    // Additional validation for domain-like patterns
    const domainPattern = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?/i;
    const extractedDomain = url.replace(/^https?:\/\//, '').split('/')[0];
    
    if (!domainPattern.test(extractedDomain)) {
      console.log(`URL validation failed for "${url}": invalid domain pattern`);
      return false;
    }
    
    console.log(`URL validation succeeded for "${url}"`);
    return true;
  } catch (e) {
    console.warn(`URL validation error for "${url}":`, e);
    return false;
  }
}

// Format URLs for display (remove http/https)
export function formatUrlForDisplay(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }
  
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.replace(/^https?:\/\//, '');
    }
    return url;
  } catch (e) {
    console.warn("Error formatting URL for display:", url, e);
    return url;
  }
}

// Brand name normalization
export function normalizeBrandName(brand: string): string {
  if (!brand) return '';
  const normalized = brand.trim();
  console.log(`Normalized brand name from "${brand}" to "${normalized}"`);
  return normalized;
}

// URL encoding for brand names
export function encodeBrandNameForUrl(brandName: string): string {
  if (!brandName) return '';
  const normalized = normalizeBrandName(brandName);
  const encoded = encodeURIComponent(normalized);
  console.log(`Encoded brand name "${normalized}" to "${encoded}" for URL`);
  return encoded;
}

// Decoding for brand names from URLs
export function decodeBrandNameFromUrl(encodedName: string): string {
  if (!encodedName) return '';
  try {
    const decoded = decodeURIComponent(encodedName);
    const normalized = normalizeBrandName(decoded);
    console.log(`Decoded URL parameter "${encodedName}" to brand name "${normalized}"`);
    return normalized;
  } catch (e) {
    console.warn(`Error decoding brand name from URL: ${encodedName}`, e);
    return encodedName.trim();
  }
}

// Normalize a string for database comparison
export function normalizeForDatabaseComparison(value: string): string {
  if (!value) return '';
  const normalized = value.toLowerCase().trim();
  console.log(`Normalized for DB comparison: "${value}" to "${normalized}"`);
  return normalized;
}

// Format URLs for safe navigation
export function formatSafeUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  
  let safeUrl = url.trim();
  if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
    safeUrl = `https://${safeUrl}`;
  }
  
  console.log(`Formatted safe URL: "${url}" to "${safeUrl}"`);
  return safeUrl;
}

// Create a database query condition for case-insensitive search
export function createCaseInsensitiveQuery(column: string, value: string): string {
  const normalized = normalizeForDatabaseComparison(value);
  return `${column}.ilike.%${normalized}%`;
}

// Normalize a brand slug for URL comparison
export function normalizeBrandSlug(slug: string): string {
  if (!slug) return '';
  const normalized = slug.trim().toLowerCase().replace(/\s+/g, '-');
  console.log(`Normalized brand slug: "${slug}" to "${normalized}"`);
  return normalized;
}

// Log product URL info for debugging
export function logProductUrlInfo(product: any, prefix: string = ''): void {
  if (!product) {
    console.log(`${prefix} Product is null or undefined`);
    return;
  }
  
  // Extract the website URL with fallback handling
  const websiteUrl = product.websiteUrl || '';
  
  console.log(`${prefix} Product URL Info:`, {
    name: product.name || 'No name',
    brand: product.brand || 'No brand',
    websiteUrl: websiteUrl,
    isUrlValid: isValidUrl(websiteUrl),
    formattedUrl: formatSafeUrl(websiteUrl)
  });
}

// NEW - Check if a URL already has http/https prefix
export function hasProtocol(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

// NEW - Cleanly parse a URL string and ensure it's valid
export function parseUrl(url: string): string | null {
  if (!url || url.trim() === '') return null;
  
  try {
    let urlToTest = url.trim();
    if (!hasProtocol(urlToTest)) {
      urlToTest = `https://${urlToTest}`;
    }
    
    // This will throw if the URL is invalid
    new URL(urlToTest);
    return urlToTest;
  } catch (e) {
    console.warn(`Failed to parse URL: "${url}"`, e);
    return null;
  }
}

// NEW - Get domain name from URL
export function getDomainFromUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) return '';
    
    const domain = new URL(parsedUrl).hostname;
    return domain;
  } catch (e) {
    console.warn(`Failed to extract domain from URL: "${url}"`, e);
    return '';
  }
}

// UPDATED - Normalize product data field names with ALL required fields
// This helps handle inconsistencies between camelCase in TypeScript and lowercase in DB
export function normalizeProductFieldNames(product: any): ProductSubmission {
  if (!product) return {} as ProductSubmission;
  
  return {
    id: product.id || '',
    name: product.name || '',
    brand: product.brand || '',
    type: product.type || '',
    description: product.description || '',
    pvaStatus: product.pvaStatus || product.pvastatus || 'needs-verification',
    pvaPercentage: product.pvaPercentage || product.pvapercentage || null,
    approved: product.approved !== undefined ? product.approved : true,
    country: product.country || 'Global',
    websiteUrl: product.websiteUrl || product.websiteurl || '',
    videoUrl: product.videoUrl || product.videourl || '',
    imageUrl: product.imageUrl || product.imageurl || '',
    ingredients: product.ingredients || '',
    brandVerified: product.brandVerified !== undefined ? product.brandVerified : 
                  (product.brandverified !== undefined ? product.brandverified : false),
    brandOwnershipRequested: product.brandOwnershipRequested !== undefined ? product.brandOwnershipRequested : 
                            (product.brandownershiprequested !== undefined ? product.brandownershiprequested : false),
    timestamp: product.timestamp || Date.now(),
    submittedAt: product.submittedAt || product.createdat || product.submittedat || new Date().toISOString(),
    dateSubmitted: product.dateSubmitted || product.createdat || product.submittedat || new Date().toISOString(),
    brandContactEmail: product.brandContactEmail || product.brandcontactemail || '',
    brandOwnershipRequestDate: product.brandOwnershipRequestDate || product.brandownershiprequestdate || '',
    brandVerificationDate: product.brandVerificationDate || product.brandverificationdate || '',
    uploadedBy: product.uploadedBy || product.owner_id || ''
  };
}
