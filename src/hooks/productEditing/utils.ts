
import { ProductDetails } from './types';

/**
 * Validates and normalizes the PVA status to ensure it's one of the allowed values
 */
export function validatePvaStatus(status: string): 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive' {
  if (status === 'contains' || 
      status === 'verified-free' || 
      status === 'needs-verification' || 
      status === 'inconclusive') {
    return status;
  }
  return 'needs-verification';
}

/**
 * Prepares product data for Supabase update
 */
export function prepareProductDataForUpdate(productDetails: ProductDetails) {
  // Format the percentage value
  const pvaPercentage = productDetails.pvaPercentage 
    ? parseFloat(productDetails.pvaPercentage) 
    : null;
  
  // Validate pvaStatus is a valid enum value
  const validPvaStatus = validatePvaStatus(productDetails.pvaStatus);
    
  // Prepare data for Supabase
  return {
    brand: productDetails.brand,
    name: productDetails.name,
    description: productDetails.description,
    type: productDetails.type,
    pvaStatus: validPvaStatus,
    pvaPercentage,
    country: productDetails.country,
    websiteUrl: productDetails.websiteUrl,
    videoUrl: productDetails.videoUrl,
    imageUrl: productDetails.imageUrl,
    ingredients: productDetails.ingredients
  };
}

/**
 * Maps a product submission to product details for editing
 */
export function mapProductToDetails(product: any): ProductDetails {
  if (!product) {
    throw new Error("Cannot map null product to details");
  }
  
  // Ensure pvaStatus is one of the allowed values
  const validPvaStatus = validatePvaStatus(product.pvaStatus);
  
  return {
    brand: product.brand || '',
    name: product.name || '',
    description: product.description || 'This product may contain PVA according to customers - please verify',
    imageUrl: product.imageUrl || product.imageurl || '',
    videoUrl: product.videoUrl || product.videourl || '',
    websiteUrl: product.websiteUrl || product.websiteurl || '',
    pvaPercentage: product.pvaPercentage !== null ? String(product.pvaPercentage) : '',
    country: product.country || 'Global',
    ingredients: product.ingredients || '',
    pvaStatus: validPvaStatus,
    type: product.type || 'Detergent'
  };
}
