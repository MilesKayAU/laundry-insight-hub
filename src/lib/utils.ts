
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeExternalLinkProps({ url }: { url: string }) {
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
    // Handle URLs without protocol
    const urlToTest = url.startsWith('http') ? url : `https://${url}`;
    
    // Attempt to parse the URL
    const parsedUrl = new URL(urlToTest);
    
    // Additional validation checks
    const domain = parsedUrl.hostname;
    if (!domain || domain.length < 3) {
      console.log(`URL validation failed for "${url}": domain too short or invalid`);
      return false;
    }
    
    // Check for common TLDs or IP addresses
    const hasTLD = domain.includes('.') && domain.split('.').pop()!.length >= 2;
    if (!hasTLD && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      console.log(`URL validation failed for "${url}": missing valid TLD`);
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
    let processedUrl = url;
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }
    
    const urlObj = new URL(processedUrl);
    
    // Format the URL for display (remove protocol and trailing slash)
    let formatted = urlObj.hostname;
    
    // Add path if it exists and isn't just a slash
    if (urlObj.pathname && urlObj.pathname !== '/') {
      formatted += urlObj.pathname;
    }
    
    console.log(`Formatted URL "${url}" to "${formatted}"`);
    return formatted;
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
