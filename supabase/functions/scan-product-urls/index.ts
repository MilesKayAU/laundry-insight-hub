
// Follow Deno and Oak pattern for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility to extract product brand from URL
const extractBrandFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Remove www. and common TLDs
    let brandName = hostname.replace(/^www\./, '');
    brandName = brandName.split('.')[0]; // Get first part of domain
    
    // Format brand name (capitalize first letter of each word)
    brandName = brandName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    // Some common domain cleanup
    brandName = brandName
      .replace(/shop/i, '')
      .replace(/store/i, '')
      .trim();
    
    return brandName || 'Unknown Brand';
  } catch (error) {
    console.error('Error extracting brand from URL:', error);
    return 'Unknown Brand';
  }
};

// Utility to extract product name from URL
const extractProductNameFromUrl = (url: string): string => {
  try {
    // First try to get from path
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname
      .split('/')
      .filter(segment => segment.length > 0);
    
    if (pathSegments.length > 0) {
      // Use the last path segment as it often contains the product name
      const lastSegment = pathSegments[pathSegments.length - 1];
      
      // Clean up the segment
      let productName = lastSegment
        .replace(/-/g, ' ')
        .replace(/\.(html|php|aspx|jsp)$/, '')
        .replace(/[0-9]+$/, '')
        .trim();
      
      // Capitalize first letter of each word
      productName = productName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (productName && productName.length > 3) {
        return productName;
      }
    }
    
    // Fallback to search parameters
    if (parsedUrl.searchParams.has('product')) {
      return parsedUrl.searchParams.get('product')!;
    }
    
    if (parsedUrl.searchParams.has('p')) {
      return parsedUrl.searchParams.get('p')!;
    }
    
    // If we can't extract a good name, return a generic one based on the domain
    const brandName = extractBrandFromUrl(url);
    return `${brandName} Product`;
  } catch (error) {
    console.error('Error extracting product name from URL:', error);
    return 'Product From URL';
  }
};

// Utility to determine product type from URL or brand
const determineProductType = (url: string, brandName: string): string => {
  const urlLower = url.toLowerCase();
  const brandLower = brandName.toLowerCase();
  
  // Check for common detergent-related keywords in URL
  if (
    urlLower.includes('laundry') || 
    urlLower.includes('detergent') || 
    urlLower.includes('washing') ||
    urlLower.includes('clean')
  ) {
    return 'Laundry Detergent';
  }
  
  // Check for dishwasher related keywords
  if (
    urlLower.includes('dish') || 
    urlLower.includes('dishwasher') || 
    urlLower.includes('dishwashing')
  ) {
    return 'Dishwasher Detergent';
  }
  
  // Check for pod related keywords
  if (
    urlLower.includes('pod') || 
    urlLower.includes('capsule') || 
    urlLower.includes('tablet')
  ) {
    return 'Detergent Pods';
  }
  
  // Check for sheet related keywords
  if (
    urlLower.includes('sheet') || 
    urlLower.includes('dryer')
  ) {
    return 'Laundry Sheets';
  }
  
  // Default
  return 'Detergent';
};

// Extract meaningful description from URL
const generateDescription = (url: string, brandName: string, productName: string): string => {
  return `This product may contain PVA according to customers - please verify`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, markAsPending = false } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ status: 'error', message: 'URL is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    console.log(`Processing URL: ${url}`);
    console.log(`Mark as pending: ${markAsPending}`);
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // First check if the product already exists by matching the URL
    const { data: existingProducts } = await supabaseClient
      .from('product_submissions')
      .select('id, brand, name')
      .eq('websiteurl', url);
      
    if (existingProducts && existingProducts.length > 0) {
      console.log('Product with this URL already exists:', existingProducts[0]);
      return new Response(JSON.stringify({
        status: 'error',
        message: `Product already exists: ${existingProducts[0].brand} - ${existingProducts[0].name}`,
        productData: existingProducts[0]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Still return 200 to avoid error handling in frontend
      });
    }
    
    // Extract product information from the URL
    const brand = extractBrandFromUrl(url);
    const name = extractProductNameFromUrl(url);
    const type = determineProductType(url, brand);
    const description = generateDescription(url, brand, name);
    
    // Build the product object
    const product = {
      brand,
      name,
      type,
      description,
      pvaStatus: 'needs-verification',
      pvaPercentage: null,
      country: 'Global',
      websiteUrl: url,
      // Important: Set approved to false for batch added products
      approved: false,
      timestamp: new Date().toISOString()
    };
    
    console.log('Extracted product information:', product);
    
    // Insert the product into the database
    const { data: insertedProduct, error } = await supabaseClient
      .from('product_submissions')
      .insert({
        brand: product.brand,
        name: product.name,
        type: product.type,
        description: product.description,
        pvastatus: product.pvaStatus,
        pvapercentage: product.pvaPercentage,
        country: product.country,
        websiteurl: product.websiteUrl,
        approved: product.approved,
        createdat: product.timestamp,
        updatedat: product.timestamp
      })
      .select();
    
    if (error) {
      console.error('Error inserting product:', error);
      return new Response(JSON.stringify({ status: 'error', message: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    console.log('Product successfully inserted:', insertedProduct);
    
    return new Response(JSON.stringify({
      status: 'success',
      message: `Successfully processed URL and created product: ${product.brand} - ${product.name}`,
      productData: insertedProduct[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error processing URL:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: `Error processing URL: ${error.message || 'Unknown error'}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
