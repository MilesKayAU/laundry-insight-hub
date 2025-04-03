
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Expanded PVA patterns including CAS numbers
const PVA_PATTERNS = [
  "pva",
  "pvoh", 
  "polyvinyl alcohol",
  "polyvinylalcohol", // Without spaces
  "poly vinyl alcohol", 
  "poly(vinyl alcohol)",
  "polyethenol",
  "vinyl alcohol polymer",
  "ethenol homopolymer",
  "25213-24-5", // CAS number for PVA
  "9002-89-5",  // Another CAS number for PVA
  "polyvinyl acetate", // Related polymer
  "polyvinylacetate", // Without spaces
  "vinnapas", // Commercial name
  "mowiol",   // Commercial name
  "elvanol",   // Commercial name
  "water-soluble polymer",
  "water soluble film",
  "pva film",
  "pvoh film",
  "pva coating",
  "dissolvable film",
  "hydrolyzed pva",
  "fully hydrolyzed pva",
  "partially hydrolyzed pva",
  "modified polyvinyl alcohol",
  "pva/pvoh",
  "polyvinyl alcohol film"
];

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
              pvastatus: productInfo.pvaFound ? 'contains' : 'needs-verification',
              pvapercentage: productInfo.pvaPercentage || null,
              approved: false, // IMPORTANT: Always set to false to require admin approval
              country: productInfo.country || 'Global',
              websiteurl: url,
              imageurl: productInfo.imageUrl || null,
              ingredients: productInfo.extractedIngredients || '',
              createdat: new Date().toISOString(),
              updatedat: new Date().toISOString(),
            });
          
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

// Improved URL scanning with better PVA detection
async function simulateUrlScan(url: string) {
  // Extract domain from URL for simulated brand name
  let domain = '';
  let brand = '';
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '');
    
    // Extract brand more intelligently
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      // Use the second-level domain as the brand name
      brand = domainParts[domainParts.length - 2];
      // Handle special cases like co.uk, com.au
      if (brand === 'co' || brand === 'com') {
        brand = domainParts[domainParts.length - 3] || brand;
      }
    } else {
      brand = domain;
    }
    
    // Clean up and capitalize brand name
    brand = brand.charAt(0).toUpperCase() + brand.slice(1);
    
    // Try to extract brand from path if it looks like a brand site
    const pathParts = urlObj.pathname.split('/');
    if (pathParts.length > 1) {
      const possibleBrands = pathParts.filter(part => 
        part.length > 2 && !part.includes('.') && part !== 'products' && part !== 'product'
      );
      if (possibleBrands.length > 0) {
        // Use the first meaningful part of the path
        const pathBrand = possibleBrands[0];
        if (pathBrand && pathBrand.length < 20) {
          brand = pathBrand.charAt(0).toUpperCase() + pathBrand.slice(1);
        }
      }
    }
  } catch (e) {
    domain = 'Unknown';
    brand = 'Unknown';
  }
  
  // Generate random data for simulation or extract from URL if possible
  const productTypes = ['Detergent', 'Dishwasher Pod', 'Laundry Pod', 'Cleaning Sheet', 'Dish Soap'];
  const randomType = productTypes[Math.floor(Math.random() * productTypes.length)];
  
  // Enhanced PVA detection logic
  let hasPva = false;
  let detectedTerms: string[] = [];
  let pvaPercentage = null;
  let extractedIngredients = null;
  
  // Check URL content for PVA indicators (in a real implementation, this would be done by scraping)
  const urlLower = url.toLowerCase();
  
  // Simulate finding PVA in the URL or page content
  for (const pattern of PVA_PATTERNS) {
    const patternLower = pattern.toLowerCase();
    
    // Try different matching strategies
    if (
      urlLower.includes(patternLower) || 
      urlLower.includes(patternLower.replace(/\s+/g, '-')) || 
      urlLower.includes(patternLower.replace(/\s+/g, '_')) || 
      urlLower.includes(patternLower.replace(/\s+/g, ''))
    ) {
      hasPva = true;
      if (!detectedTerms.includes(pattern)) {
        detectedTerms.push(pattern);
      }
    }
  }
  
  // Special check for "POLYVINYL ALCOHOL 25213-24-5" pattern
  if ((urlLower.includes("polyvinyl") && urlLower.includes("alcohol")) || 
      (urlLower.includes("pva") && (urlLower.includes("25213-24-5") || urlLower.includes("9002-89-5")))) {
    hasPva = true;
    if (!detectedTerms.includes("POLYVINYL ALCOHOL")) {
      detectedTerms.push("POLYVINYL ALCOHOL");
    }
    if (urlLower.includes("25213-24-5") && !detectedTerms.includes("25213-24-5")) {
      detectedTerms.push("25213-24-5");
    }
    if (urlLower.includes("9002-89-5") && !detectedTerms.includes("9002-89-5")) {
      detectedTerms.push("9002-89-5");
    }
  }
  
  // Try to extract PVA percentage (if mentioned)
  const percentMatch = url.match(/(\d+(?:\.\d+)?)(%|\s*percent|\s*pva)/i);
  if (percentMatch && !isNaN(parseFloat(percentMatch[1]))) {
    pvaPercentage = parseFloat(percentMatch[1]);
    hasPva = true;
  } else if (hasPva) {
    // Default PVA percentage for detected PVA
    pvaPercentage = Math.floor(Math.random() * 30) + 5;
  }
  
  // Generate a product name that makes more sense
  let productName;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Try to extract a meaningful product name from the path
    const meaningfulParts = pathParts.filter(part => 
      part && 
      part.length > 3 && 
      !['pages', 'products', 'product', 'shop', 'category'].includes(part.toLowerCase())
    );
    
    if (meaningfulParts.length > 0) {
      // Use the last meaningful part as it's often the product name
      productName = meaningfulParts[meaningfulParts.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
        
      if (productName.length > 30) {
        // Truncate very long names
        productName = productName.substring(0, 30) + '...';
      }
    } else {
      // Fallback to a generic name with a random identifier
      productName = `${randomType} ${Math.random().toString(36).substring(2, 7)}`;
    }
  } catch (e) {
    productName = `${randomType} ${Math.random().toString(36).substring(2, 7)}`;
  }
  
  // Create a more realistic ingredients list based on detected PVA
  if (hasPva) {
    const pvaIngredient = detectedTerms[0] || 'Polyvinyl Alcohol';
    extractedIngredients = `Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, ${pvaIngredient} ${pvaPercentage ? `(${pvaPercentage}%)` : ''}, Sodium Chloride, Glycerin, Fragrance`;
  } else {
    extractedIngredients = "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Citric Acid, Sodium Benzoate";
  }
  
  return {
    name: productName,
    brand: brand,
    type: randomType,
    description: `A ${randomType.toLowerCase()} product that was scanned from URL: ${url}`,
    pvaPercentage: hasPva ? pvaPercentage : null,
    country: 'Global',
    imageUrl: null,
    pvaFound: hasPva,
    detectedTerms,
    extractedIngredients
  };
}
