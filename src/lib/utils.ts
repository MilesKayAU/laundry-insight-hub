
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
  
  // Debug logging for URL processing
  console.log("Creating safe external link for:", safeUrl);
  
  return {
    href: safeUrl,
    target: "_blank",
    rel: "nofollow noopener noreferrer",
    // Ensure links don't break layout
    className: "max-w-full overflow-hidden text-ellipsis hover:underline text-blue-600"
  };
}

// Validate URLs
export function isValidUrl(url: string): boolean {
  if (!url || url === '#' || url.trim() === '') return false;
  
  try {
    // Handle the case when URL doesn't have a protocol
    const urlToTest = url.startsWith('http') ? url : `https://${url}`;
    new URL(urlToTest);
    
    // Additional logging for URL validation
    console.log(`URL validation for "${url}": valid`);
    return true;
  } catch (e) {
    console.warn(`URL validation for "${url}": invalid`, e);
    return false;
  }
}

// Format URLs for display
export function formatUrlForDisplay(url: string): string {
  if (!url || url.trim() === '') return '';
  
  try {
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }
    
    const urlObj = new URL(processedUrl);
    const formatted = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    console.log(`Formatted URL "${url}" to "${formatted}"`);
    return formatted;
  } catch (e) {
    console.warn("Error formatting URL for display:", url, e);
    return url;
  }
}

// Normalize brand names by trimming spaces - this is particularly important
// for database queries to properly match brand names
export function normalizeBrandName(brand: string): string {
  if (!brand) return '';
  return brand.trim();
}
