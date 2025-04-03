
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function absoluteUrl(path: string) {
  return `${window.location.origin}${path}`;
}

// Add a utility function for creating safe external links with proper SEO attributes
export interface SafeExternalLinkProps {
  url: string;
  noFollow?: boolean;
  sponsored?: boolean;
  ugc?: boolean;
}

export function getSafeExternalLinkProps(props: SafeExternalLinkProps) {
  const { url, noFollow = true, sponsored = false, ugc = false } = props;
  
  const relAttributes: string[] = ['noopener', 'noreferrer'];
  if (noFollow) relAttributes.push('nofollow');
  if (sponsored) relAttributes.push('sponsored');
  if (ugc) relAttributes.push('ugc');
  
  return {
    href: url,
    target: "_blank",
    rel: relAttributes.join(' ')
  };
}
