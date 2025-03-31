
// Utility functions for country normalization and filtering

/**
 * Normalizes a country name to a standard format
 */
export const normalizeCountry = (country: string | undefined | null): string => {
  if (!country) return "Global";
  
  const normalizedCountry = country.trim();
  
  const countryAliases = {
    'usa': 'United States',
    'us': 'United States',
    'united states of america': 'United States',
    'uk': 'United Kingdom',
    'great britain': 'United Kingdom',
    'nz': 'New Zealand',
    'aus': 'Australia'
  };
  
  return countryAliases[normalizedCountry.toLowerCase()] || normalizedCountry;
};
