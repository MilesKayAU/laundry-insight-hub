// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
import { corsHeaders } from '../_shared/cors.ts';
import { v4 as uuid } from 'https://esm.sh/uuid@9.0.0';

console.log("Starting scan-product-urls function");

interface RequestData {
  url: string;
}

interface ProductData {
  id: string;
  name: string;
  brand: string;
  type: string;
  description?: string;
  pvaStatus?: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  pvaPercentage?: number | null;
  country?: string;
  websiteUrl: string;
  videoUrl?: string;
  imageUrl?: string;
  approved: boolean;
}

Deno.serve(async (req) => {
  console.log(`Function invoked: ${req.url}`);
  
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get URL from request body
    const requestData: RequestData = await req.json();
    const url = requestData.url;
    
    if (!url || typeof url !== 'string') {
      throw new Error('Valid URL is required');
    }
    
    console.log(`Processing URL: ${url}`);
    
    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    // Only process HTML content
    if (!contentType.includes('text/html')) {
      console.log(`Skipping non-HTML content: ${contentType}`);
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'Not an HTML page. Only HTML pages are supported.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const html = await response.text();
    console.log(`Fetched ${html.length} bytes of HTML`);
    
    // Extract product info from HTML
    const productData = extractProductData(html, url);
    
    // Only continue if we found a product
    if (!productData) {
      console.log("No product data could be extracted from the URL");
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Could not extract product information from the URL'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    console.log("Extracted product data:", productData);
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );
    
    // Check if the product already exists (by brand and name)
    const { data: existingProducts, error: searchError } = await supabaseClient
      .from('product_submissions')
      .select('id, approved')
      .eq('brand', productData.brand)
      .eq('name', productData.name);
      
    if (searchError) {
      console.error('Error checking for existing product:', searchError);
      throw new Error(`Database query failed: ${searchError.message}`);
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log(`Product already exists: ${productData.brand} - ${productData.name}`);
      
      // Get the existing product with its current approval status
      const existingProduct = existingProducts[0];
      
      // Return the existing product data including its approval status
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Product already exists: ${productData.brand} - ${productData.name}`,
          productData: {
            ...productData,
            id: existingProduct.id,
            approved: existingProduct.approved // Keep the existing approval status
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Insert the product into the database - ALWAYS start as not approved
    const productToInsert = {
      id: uuid(),
      name: productData.name,
      brand: productData.brand,
      type: productData.type || 'Laundry Product',
      description: productData.description || '',
      pvastatus: productData.pvaStatus || 'needs-verification',
      pvapercentage: productData.pvaPercentage || null,
      approved: false, // Always start as not approved, requiring admin review
      country: productData.country || 'Global',
      websiteurl: url,
      videourl: productData.videoUrl || '',
      imageurl: productData.imageUrl || '',
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };
    
    const { data, error } = await supabaseClient
      .from('product_submissions')
      .insert([productToInsert]);
    
    if (error) {
      console.error('Error inserting product:', error);
      throw new Error(`Database insertion failed: ${error.message}`);
    }
    
    console.log(`Product inserted successfully: ${productData.brand} - ${productData.name}`);
    
    return new Response(
      JSON.stringify({
        status: 'success',
        message: `Added "${productData.brand} - ${productData.name}" to the database for review.`,
        productData: {
          ...productData,
          id: productToInsert.id,
          approved: false // Explicitly state this is not approved
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error processing URL:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function extractProductData(html: string, url: string): ProductData | null {
  // Convert HTML to lowercase for case-insensitive matching
  const lowerHtml = html.toLowerCase();
  
  // Initialize product data
  const productData: Partial<ProductData> = {
    id: uuid(),
    websiteUrl: url,
    approved: false // Always start as unapproved
  };
  
  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  console.log("Page title:", title);
  
  // Extract content from meta tags
  const metaTags = html.match(/<meta[^>]+>/g) || [];
  const metaData: Record<string, string> = {};
  
  metaTags.forEach(tag => {
    const nameMatch = tag.match(/name=["']([^"']*)["']/i);
    const propertyMatch = tag.match(/property=["']([^"']*)["']/i);
    const contentMatch = tag.match(/content=["']([^"']*)["']/i);
    
    if (contentMatch) {
      const name = nameMatch ? nameMatch[1].toLowerCase() : 
                  propertyMatch ? propertyMatch[1].toLowerCase() : '';
      
      if (name) {
        metaData[name] = contentMatch[1];
      }
    }
  });
  
  console.log("Meta data:", metaData);
  
  // Try to extract product name and brand from meta tags
  if (metaData['og:title']) {
    const parts = metaData['og:title'].split('-').map(p => p.trim());
    if (parts.length > 1) {
      productData.brand = parts[0];
      productData.name = parts.slice(1).join(' ');
    } else {
      productData.name = metaData['og:title'];
    }
  } else if (title) {
    // Split title by common separators
    const parts = title.split(/\s*[|\-–:]\s*/).map(p => p.trim()).filter(Boolean);
    
    if (parts.length > 1) {
      // Assume first part is brand, rest is product name
      productData.brand = parts[0];
      productData.name = parts.slice(1).join(' ');
    } else {
      productData.name = title;
    }
  }
  
  // Extract description
  if (metaData['og:description'] || metaData['description']) {
    productData.description = metaData['og:description'] || metaData['description'];
  }
  
  // Extract image if available
  if (metaData['og:image']) {
    productData.imageUrl = metaData['og:image'];
    
    // Ensure the image URL is absolute
    if (!productData.imageUrl.startsWith('http')) {
      const baseUrl = new URL(url).origin;
      productData.imageUrl = new URL(productData.imageUrl, baseUrl).href;
    }
  }
  
  // Try to identify if it's a laundry product
  const isLaundryRelated = 
    lowerHtml.includes('laundry') || 
    lowerHtml.includes('detergent') || 
    lowerHtml.includes('washing') ||
    lowerHtml.includes('clean clothes') ||
    lowerHtml.includes('pods') ||
    lowerHtml.includes('sheets') ||
    lowerHtml.includes('fabric');
  
  // Try to determine product type
  if (lowerHtml.includes('pod') && isLaundryRelated) {
    productData.type = 'Laundry Pods';
  } else if (lowerHtml.includes('sheet') && isLaundryRelated) {
    productData.type = 'Laundry Sheets';
  } else if (lowerHtml.includes('detergent') && isLaundryRelated) {
    productData.type = 'Laundry Detergent';
  } else if (isLaundryRelated) {
    productData.type = 'Laundry Product';
  } else {
    productData.type = 'Other';
  }
  
  // Try to determine PVA status if possible
  if (lowerHtml.includes('polyvinyl alcohol') || 
      lowerHtml.includes('pva ') || 
      lowerHtml.includes(' pva') ||
      lowerHtml.includes('pva-')) {
    
    // If explicitly mentions "pva free" or "no pva"
    if (lowerHtml.includes('pva free') || 
        lowerHtml.includes('pva-free') || 
        lowerHtml.includes('free of pva') ||
        lowerHtml.includes('without pva') ||
        lowerHtml.includes('no pva')) {
      productData.pvaStatus = 'verified-free';
      productData.pvaPercentage = 0;
    } else {
      // If it mentions PVA but not explicitly free
      productData.pvaStatus = 'contains';
      
      // Try to find percentage
      const percentageMatch = lowerHtml.match(/(\d+(?:\.\d+)?)%\s*(?:of\s*)?pva/i) || 
                               lowerHtml.match(/pva\s*(?:content|concentration)?\s*(?:of|:)?\s*(\d+(?:\.\d+)?)%/i);
      
      if (percentageMatch) {
        productData.pvaPercentage = parseFloat(percentageMatch[1]);
      }
    }
  } else {
    productData.pvaStatus = 'needs-verification';
  }
  
  // If we couldn't extract a brand or name, the extraction failed
  if (!productData.brand || !productData.name) {
    // Try one more generic approach before giving up
    const browserTitle = title.replace(/^\s+|\s+$/g, '');
    
    if (browserTitle.length > 0) {
      // Split by first space as a last resort
      const parts = browserTitle.split(' ');
      if (parts.length > 1) {
        productData.brand = parts[0];
        productData.name = parts.slice(1).join(' ');
      } else {
        productData.name = browserTitle;
        productData.brand = new URL(url).hostname.replace('www.', '').split('.')[0];
      }
    } else {
      return null;
    }
  }
  
  // Ensure we have all required fields
  if (!productData.brand) {
    // Extract domain as brand if we couldn't find one
    productData.brand = new URL(url).hostname.replace('www.', '').split('.')[0];
    // Capitalize first letter
    productData.brand = productData.brand.charAt(0).toUpperCase() + productData.brand.slice(1);
  }
  
  // Ensure name doesn't contain the brand name at the beginning to avoid redundancy
  if (productData.name && productData.brand && productData.name.toLowerCase().startsWith(productData.brand.toLowerCase())) {
    productData.name = productData.name.substring(productData.brand.length).replace(/^\s*[-:]\s*/, '').trim();
  }
  
  return productData as ProductData;
}
