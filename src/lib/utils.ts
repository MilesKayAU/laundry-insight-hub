import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeExternalLinkProps({ url }: { url: string }) {
  // Enhanced URL validation and logging
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

  // Ensure URL has a protocol if missing
  let safeUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    safeUrl = `https://${url}`;
  }
  
  // Detailed logging for debugging
  console.log(`getSafeExternalLinkProps for "${url}":`);
  console.log(`- Original URL: "${url}"`);
  console.log(`- Safe URL: "${safeUrl}"`);
  
  return {
    href: safeUrl,
    target: "_blank",
    rel: "nofollow noopener noreferrer",
    // Ensure links don't break layout
    className: "max-w-full overflow-hidden text-ellipsis hover:underline text-blue-600"
  };
}

// Enhanced URL validation with detailed logging
export function isValidUrl(url: string): boolean {
  // First check for empty or placeholder URLs
  if (!url || url === '#' || url.trim() === '') {
    console.log(`URL validation failed for "${url}": empty or placeholder`);
    return false;
  }
  
  try {
    // Handle URLs without protocol by adding one for validation purposes
    let urlToTest = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToTest = `https://${url}`;
    }
    
    // Attempt to parse the URL
    new URL(urlToTest);
    
    // Additional validation to check for domain-like patterns
    // This handles cases where technically valid URLs might not be real websites
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

// Improved URL formatting for display
export function formatUrlForDisplay(url: string): string {
  if (!url || url.trim() === '') {
    console.log("Empty URL provided to formatUrlForDisplay");
    return '';
  }
  
  try {
    // For basic cases, just return the URL without http/https
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.replace(/^https?:\/\//, '');
    }
    
    return url;
  } catch (e) {
    console.warn("Error formatting URL for display:", url, e);
    return url; // Return original URL if formatting fails
  }
}

// Enhanced brand name normalization - fixes issue with leading/trailing spaces
export function normalizeBrandName(brand: string): string {
  if (!brand) return '';
  
  // Trim spaces and convert to consistent case
  const normalized = brand.trim();
  console.log(`Normalized brand name from "${brand}" to "${normalized}"`);
  
  return normalized;
}

// Encoding and decoding for URL parameters - new function to help with URL handling
export function encodeBrandNameForUrl(brandName: string): string {
  if (!brandName) return '';
  
  const normalized = normalizeBrandName(brandName);
  const encoded = encodeURIComponent(normalized);
  console.log(`Encoded brand name "${normalized}" to "${encoded}" for URL`);
  
  return encoded;
}

// Decoding for URL parameters - new function to help with URL handling
export function decodeBrandNameFromUrl(encodedName: string): string {
  if (!encodedName) return '';
  
  try {
    const decoded = decodeURIComponent(encodedName);
    const normalized = normalizeBrandName(decoded);
    console.log(`Decoded URL parameter "${encodedName}" to brand name "${normalized}"`);
    
    return normalized;
  } catch (e) {
    console.warn(`Error decoding brand name from URL: ${encodedName}`, e);
    // Try to recover by trimming spaces at least
    return encodedName.trim();
  }
}
