
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeExternalLinkProps({ url }: { url: string }) {
  // Ensure URL has a protocol if missing
  let safeUrl = url;
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    safeUrl = `https://${url}`;
  }
  
  // Log the URL we're creating a link for
  console.log("Creating safe external link for:", safeUrl);
  
  return {
    href: safeUrl,
    target: "_blank",
    rel: "nofollow noopener noreferrer",
    // Ensure links don't break layout
    className: "max-w-full overflow-hidden text-ellipsis"
  };
}
