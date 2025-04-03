
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Please provide an array of URLs" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing ${urls.length} URLs`);
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get user authentication from request (optional for improved error messaging)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("No auth header present, proceeding as anonymous");
    }

    // Process each URL in parallel
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          // Improved logging for debugging
          console.log(`Processing URL: ${url}`);
          
          // Simulate URL scanning
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

          // In a real implementation, you would use a web scraper here
          // For now, simulate extracting product information
          const productInfo = await simulateUrlScan(url);

          // Generate a unique ID for the submission
          const id = crypto.randomUUID();
          
          // Always create product submission in database, even if PVA is not detected
          console.log(`Inserting product from URL ${url} to database`);
          const { data, error } = await supabase
            .from('product_submissions')
            .insert({
              id,
              name: productInfo.name,
              brand: productInfo.brand,
              type: productInfo.type || 'Unknown',
              description: productInfo.description || '',
              // Always add to pending so admins can review, regardless of PVA detection
              pvastatus: 'needs-verification',
              pvapercentage: productInfo.pvaPercentage || null,
              approved: false, // Always set to false to require admin approval
              country: productInfo.country || 'Global',
              websiteurl: url,
              imageurl: productInfo.imageUrl || null,
              createdat: new Date().toISOString(),
              updatedat: new Date().toISOString()
            })
            .select();
          
          if (error) {
            console.error(`Error inserting product from URL ${url}:`, error);
            return { 
              url, 
              success: false, 
              error: error.message 
            };
          }

          console.log(`Successfully processed URL: ${url}`);
          return { 
            url, 
            success: true, 
            productId: id,
            productInfo,
            requiresReview: true // Always require review
          };
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          return { 
            url, 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    // Log the final results count
    const successCount = results.filter(r => r.success).length;
    console.log(`Processed ${urls.length} URLs - ${successCount} successful, ${urls.length - successCount} failed`);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in scan-product-urls function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Simulate URL scanning - this function would be replaced with actual web scraping logic
async function simulateUrlScan(url: string) {
  // Extract domain from URL for simulated brand name
  let domain = '';
  try {
    domain = new URL(url).hostname.replace('www.', '').split('.')[0];
    // Capitalize first letter of domain for brand name
    domain = domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (e) {
    domain = 'Unknown';
  }
  
  // Generate random data for simulation
  const productTypes = ['Detergent', 'Dishwasher Pod', 'Laundry Pod', 'Cleaning Sheet', 'Dish Soap'];
  const randomType = productTypes[Math.floor(Math.random() * productTypes.length)];
  const hasPva = Math.random() > 0.3; // 70% chance of containing PVA
  const pvaPercentage = hasPva ? Math.floor(Math.random() * 30) + 5 : null;
  
  return {
    name: `${randomType} ${Math.random().toString(36).substring(2, 7)}`,
    brand: domain,
    type: randomType,
    description: `A ${randomType.toLowerCase()} product that may contain PVA. URL: ${url}`,
    pvaPercentage: hasPva ? pvaPercentage : null,
    country: 'Global',
    imageUrl: null,
    pvaFound: hasPva
  };
}
