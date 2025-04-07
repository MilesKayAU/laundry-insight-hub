import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeExternalLinkProps({ url }: { url: string }) {
  return {
    href: url,
    target: "_blank",
    rel: "nofollow noopener noreferrer",
    // Ensure links don't break layout
    className: "max-w-full overflow-hidden text-ellipsis"
  };
}
