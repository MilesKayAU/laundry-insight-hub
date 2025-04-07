
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
  
  // Log the URL we're creating a link for
  console.log("Creating safe external link for:", safeUrl);
  
  return {
    href: safeUrl,
    target: "_blank",
    rel: "nofollow noopener noreferrer",
    // Ensure links don't break layout
    className: "max-w-full overflow-hidden text-ellipsis hover:underline text-blue-600"
  };
}

// Add a utility function to validate URLs
export function isValidUrl(url: string): boolean {
  if (!url || url === '#' || url.trim() === '') return false;
  
  try {
    // Use URL constructor to validate
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (e) {
    return false;
  }
}

// Helper to format URLs for display
export function formatUrlForDisplay(url: string): string {
  if (!url || url.trim() === '') return '';
  
  try {
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }
    
    const urlObj = new URL(processedUrl);
    return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
  } catch (e) {
    console.warn("Error formatting URL for display:", url, e);
    return url;
  }
}
