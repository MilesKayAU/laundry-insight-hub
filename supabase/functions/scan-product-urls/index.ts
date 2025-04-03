
// Follow Deno and Oak pattern for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    
    // Here we would typically have logic to scrape the URL and extract product details
    // For this example, we'll create a mock product
    const mockProduct = {
      brand: 'Example Brand',
      name: 'Product From URL',
      type: 'Detergent',
      description: 'This product may contain PVA according to customers - please verify',
      pvaStatus: 'needs-verification',
      pvaPercentage: null,
      country: 'Global',
      websiteUrl: url,
      approved: false, // Always set to false for new products so they appear in pending
      timestamp: new Date().toISOString()
    };
    
    // Insert the product into the database
    const { data: insertedProduct, error } = await supabaseClient
      .from('product_submissions')
      .insert({
        brand: mockProduct.brand,
        name: mockProduct.name,
        type: mockProduct.type,
        description: mockProduct.description,
        pvastatus: mockProduct.pvaStatus,
        pvapercentage: mockProduct.pvaPercentage,
        country: mockProduct.country,
        websiteurl: mockProduct.websiteUrl,
        approved: mockProduct.approved,
        createdat: mockProduct.timestamp,
        updatedat: mockProduct.timestamp
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
      message: `Successfully processed URL and created product: ${mockProduct.brand} - ${mockProduct.name}`,
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
