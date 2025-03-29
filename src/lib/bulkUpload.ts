import { ProductSubmission, getProductSubmissions, analyzePvaContent, getAllPvaPatterns } from "./textExtractor";

// Define the expected format for the CSV/Excel data
export interface BulkProductData {
  brand: string;
  name: string;
  type: string;
  ingredients?: string; // Primary field for PVA detection
  pvaStatus?: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive'; // Now optional as it will be derived
  pvaPercentage?: number;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
  additionalNotes?: string;
  country?: string;
  hasPva?: 'yes' | 'no' | 'unidentified';
  productUrl?: string; // New field for product URL
}

// Check if product with same brand and name already exists in APPROVED products
export const isDuplicateProduct = (brand: string, name: string): boolean => {
  const existingProducts = getProductSubmissions();
  // Only check against approved products
  const approvedProducts = existingProducts.filter(product => product.approved);
  
  return approvedProducts.some(
    product => 
      product.brand.toLowerCase() === brand.toLowerCase() && 
      product.name.toLowerCase() === name.toLowerCase()
  );
};

// Analyze ingredients to determine PVA status with enhanced detection
export const analyzePvaStatus = (ingredients?: string): 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive' => {
  if (!ingredients) {
    return 'needs-verification';
  }
  
  console.log(`Analyzing ingredients for PVA: "${ingredients.substring(0, 100)}${ingredients.length > 100 ? '...' : ''}"`);
  
  // Use the enhanced PVA content analyzer
  const analysis = analyzePvaContent(ingredients);
  
  // Log the analysis result for debugging
  if (analysis.detectedTerms.length > 0) {
    console.log(`PVA detected! Terms found: ${analysis.detectedTerms.join(', ')}`);
  }
  
  if (analysis.isExplicitlyFree) {
    console.log('Product explicitly marked as PVA-free');
    return 'verified-free';
  }
  
  if (analysis.containsPva) {
    return 'contains';
  }
  
  // If ingredients are provided but no PVA is detected, and it's not explicitly marked as free
  // We consider it inconclusive rather than verified-free to be cautious
  return ingredients.length > 10 ? 'inconclusive' : 'needs-verification';
};

// Process bulk data and add to database
export const processBulkUpload = (data: BulkProductData[]): { 
  success: BulkProductData[]; 
  duplicates: BulkProductData[];
  errors: { item: BulkProductData; error: string }[];
} => {
  const result = {
    success: [] as BulkProductData[],
    duplicates: [] as BulkProductData[],
    errors: [] as { item: BulkProductData; error: string }[]
  };

  // Process each item from the bulk upload
  data.forEach(item => {
    try {
      // Validate required fields
      if (!item.brand || !item.name || !item.type) {
        result.errors.push({ 
          item, 
          error: 'Missing required fields (brand, name, or type)' 
        });
        return;
      }

      // Determine PVA status based on ingredients list
      let pvaStatus = analyzePvaStatus(item.ingredients);
      
      // Override with explicit status if provided
      if (item.pvaStatus) {
        pvaStatus = item.pvaStatus;
      } else if (item.hasPva) {
        // If the explicit hasPva field is provided, use it to determine status
        if (item.hasPva === 'yes') {
          pvaStatus = 'contains';
        } else if (item.hasPva === 'no') {
          pvaStatus = 'verified-free';
        } else if (item.hasPva === 'unidentified') {
          pvaStatus = 'inconclusive';
        }
      } else {
        // Otherwise, use the notes to try and determine status
        if (item.additionalNotes) {
          const notes = item.additionalNotes.toLowerCase();
          if (notes.includes('contains polyvinyl alcohol') || 
              notes.includes('contains pva') || 
              notes.includes('pva listed in ingredients')) {
            pvaStatus = 'contains';
          } else if (notes.includes('pva-free') || 
                    notes.includes('no pva') || 
                    notes.includes('verified free')) {
            pvaStatus = 'verified-free';
          }
        }
      }
      
      // Check for duplicates
      if (isDuplicateProduct(item.brand, item.name)) {
        result.duplicates.push(item);
        return;
      }

      // Create a new product submission
      const newProduct: ProductSubmission = {
        id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        brand: item.brand,
        name: item.name,
        type: item.type,
        country: item.country || 'Global',
        pvaStatus: pvaStatus,
        pvaPercentage: item.pvaPercentage,
        description: item.additionalNotes || item.description || "",
        imageUrl: item.imageUrl || "",
        videoUrl: item.videoUrl || "",
        websiteUrl: item.productUrl || item.websiteUrl || "", // Use productUrl as websiteUrl if available
        submittedAt: new Date().toISOString(),
        approved: false,
        dateSubmitted: new Date().toISOString(),
        brandVerified: false,
        brandContactEmail: "",
        ingredients: item.ingredients || "" // Store ingredients for later reference
      };

      // Add to database
      const existingProducts = getProductSubmissions();
      const updatedProducts = [...existingProducts, newProduct];
      localStorage.setItem('product_submissions', JSON.stringify(updatedProducts));
      
      result.success.push(item);
    } catch (error) {
      result.errors.push({ 
        item, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  return result;
};

// Parse CSV data with improved error handling and more flexible header detection
export const parseCSV = (csvText: string): BulkProductData[] => {
  try {
    console.log("Starting CSV parsing process...");
    
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      throw new Error("CSV file is empty or contains only headers");
    }
    
    // Clean up the header row and detect delimiter (comma or semicolon)
    const headerLine = lines[0].trim();
    const delimiter = headerLine.includes(';') ? ';' : ',';
    
    // Handle quoted header values properly
    let headers: string[] = [];
    let inQuote = false;
    let currentHeader = '';
    let i = 0;
    
    while (i < headerLine.length) {
      const char = headerLine[i];
      
      if (char === '"' && (i === 0 || headerLine[i-1] !== '\\')) {
        inQuote = !inQuote;
      } else if ((char === delimiter) && !inQuote) {
        headers.push(currentHeader.trim().replace(/^"(.*)"$/, '$1'));
        currentHeader = '';
      } else {
        currentHeader += char;
      }
      
      i++;
    }
    
    // Add the last header
    headers.push(currentHeader.trim().replace(/^"(.*)"$/, '$1'));
    
    console.log("Detected headers:", headers);
    
    // Map various possible header names to our standardized field names
    const headerMap: Record<string, string> = {
      // Brand variations
      'brand': 'brand',
      'brandname': 'brand',
      'brand name': 'brand',
      'manufacturer': 'brand',
      'company': 'brand',
      
      // Name variations
      'name': 'name',
      'productname': 'name',
      'product name': 'name',
      'product': 'name',
      
      // Type variations
      'type': 'type',
      'producttype': 'type',
      'product type': 'type',
      'category': 'type',
      
      // Ingredients (new field)
      'ingredients': 'ingredients',
      'ingredients list': 'ingredients',
      'product ingredients': 'ingredients',
      'formula': 'ingredients',
      
      // Legacy PVA Status variations (kept for backward compatibility)
      'pvastatus': 'hasPva',
      'haspva': 'hasPva',
      'has pva': 'hasPva',
      'containspva': 'hasPva',
      'contains pva': 'hasPva',
      
      // PVA Percentage variations
      'pvapercentage': 'pvaPercentage',
      'pva percentage': 'pvaPercentage',
      'pva percentage (if known)': 'pvaPercentage',
      'pva %': 'pvaPercentage',
      
      // Notes variations
      'additionalnotes': 'additionalNotes',
      'additional notes': 'additionalNotes',
      'notes': 'additionalNotes',
      'description': 'additionalNotes',
      
      // Country variations
      'country': 'country',
      'region': 'country',
      'market': 'country',
      'availability': 'country',
      
      // Product URL variations
      'producturl': 'productUrl',
      'product url': 'productUrl',
      'url': 'productUrl',
      'link': 'productUrl',
      'website': 'productUrl',
      'product link': 'productUrl'
    };
    
    // Create a mapping from the actual headers to our field names
    const fieldMapping: Record<number, string> = {};
    const foundRequiredFields: Record<string, boolean> = {
      'brand': false,
      'name': false,
      'type': false
    };
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase().trim();
      console.log(`Processing header: "${lowerHeader}" at index ${index}`);
      
      // Check if this header maps to a known field
      for (const [possibleName, fieldName] of Object.entries(headerMap)) {
        if (lowerHeader === possibleName) {
          fieldMapping[index] = fieldName;
          
          // Mark if we found a required field
          if (fieldName in foundRequiredFields) {
            foundRequiredFields[fieldName] = true;
          }
          
          console.log(`Mapped "${lowerHeader}" to "${fieldName}"`);
          break;
        }
      }
      
      // Special case handling for specific headers
      if (!fieldMapping[index]) {
        if (lowerHeader.includes('brand')) {
          fieldMapping[index] = 'brand';
          foundRequiredFields['brand'] = true;
          console.log(`Special mapped "${lowerHeader}" to "brand"`);
        } else if (lowerHeader.includes('product name') || lowerHeader === 'product') {
          fieldMapping[index] = 'name';
          foundRequiredFields['name'] = true;
          console.log(`Special mapped "${lowerHeader}" to "name"`);
        } else if (lowerHeader.includes('product type')) {
          fieldMapping[index] = 'type';
          foundRequiredFields['type'] = true;
          console.log(`Special mapped "${lowerHeader}" to "type"`);
        } else if (lowerHeader.includes('ingredient')) {
          fieldMapping[index] = 'ingredients';
          console.log(`Special mapped "${lowerHeader}" to "ingredients"`);
        }
      }
    });
    
    console.log("Field mappings:", fieldMapping);
    console.log("Found required fields:", foundRequiredFields);
    
    // Check if all required fields were found
    const missingRequiredHeaders = Object.entries(foundRequiredFields)
      .filter(([_, found]) => !found)
      .map(([field]) => field);
    
    if (missingRequiredHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingRequiredHeaders.join(', ')}. Please use the template.`);
    }
    
    // Process each data row
    return lines.slice(1).map((line, lineIndex) => {
      // Skip empty lines
      if (!line.trim()) {
        return null;
      }
      
      // Handle quoted values properly (in case commas are in quoted strings)
      let values: string[] = [];
      let inQuote = false;
      let currentValue = '';
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuote = !inQuote;
        } else if ((char === delimiter) && !inQuote) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
        
        i++;
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      // Ensure we have the right number of values
      if (values.length !== headers.length) {
        // Try to fix by adding empty values or truncating
        if (values.length < headers.length) {
          values = [...values, ...Array(headers.length - values.length).fill('')];
        } else {
          values = values.slice(0, headers.length);
        }
      }
      
      // Create an empty product data object
      const item: Partial<BulkProductData> = {};
      
      // Populate the item using the field mapping
      headers.forEach((header, index) => {
        const fieldName = fieldMapping[index];
        if (!fieldName) return; // Skip unknown headers
        
        const value = values[index] ? values[index].replace(/^"(.*)"$/, '$1') : '';
        
        if (fieldName === 'pvaPercentage') {
          if (value) {
            const cleanValue = value.replace(/[^0-9.]/g, '');
            const numValue = parseFloat(cleanValue);
            item[fieldName] = isNaN(numValue) ? undefined : numValue;
          }
        } 
        else if (fieldName === 'hasPva') {
          const lowValue = value.toLowerCase();
          if (['yes', 'true', '1', 'y', 'contains', 'contains pva', 'unknown pva'].includes(lowValue)) {
            if (lowValue === 'unknown pva') {
              item[fieldName] = 'unidentified';
            } else {
              item[fieldName] = 'yes';
            }
          } else if (['no', 'false', '0', 'n', 'free', 'pva-free'].includes(lowValue)) {
            item[fieldName] = 'no';
          } else {
            item[fieldName] = 'unidentified';
          }
        }
        else {
          (item as any)[fieldName] = value;
        }
      });
      
      // Ensure required fields are present
      if (!item.brand || !item.name || !item.type) {
        console.warn(`Row ${lineIndex + 2} is missing required fields`);
      }
      
      return item as BulkProductData;
    }).filter(Boolean) as BulkProductData[];
  } catch (error) {
    console.error("CSV parsing error:", error);
    throw new Error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get sample CSV template content
export const getSampleCSVTemplate = (): string => {
  return '"Brand Name","Product Name","Product Type","Ingredients","PVA Percentage (if known)","Additional Notes","Country","Product URL"\n' +
    '"Example Brand","Product Name","Laundry Sheets","Water, Sodium Lauryl Sulfate, Sodium Carbonate, Citric Acid","0","Product contains no PVA. Verified by manufacturer.","Australia","https://example.com/product"';
};

// Group products by brand for chart visualization
export const groupProductsByBrand = (products: ProductSubmission[]) => {
  const groupedData = products.reduce((acc, product) => {
    const brand = product.brand;
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, ProductSubmission[]>);

  // Sort brands by count (descending)
  return Object.entries(groupedData)
    .sort((a, b) => b[1].length - a[1].length);
};

// Get top brands for visualization
export const getTopBrands = (products: ProductSubmission[], limit: number = 10) => {
  const grouped = groupProductsByBrand(products);
  return grouped.slice(0, limit).map(([brand, products]) => ({
    brand,
    count: products.length
  }));
};

// Get brand categories for visualization (top N + "Others")
export const getBrandCategories = (products: ProductSubmission[], limit: number = 10) => {
  const grouped = groupProductsByBrand(products);
  
  // If we have fewer brands than the limit, return all of them
  if (grouped.length <= limit) {
    return grouped.map(([brand, products]) => ({
      brand,
      count: products.length
    }));
  }
  
  // Otherwise, return top N brands + an "Others" category
  const topBrands = grouped.slice(0, limit);
  const otherBrands = grouped.slice(limit);
  
  const result = topBrands.map(([brand, products]) => ({
    brand,
    count: products.length
  }));
  
  const otherCount = otherBrands.reduce((sum, [products]) => sum + products.length, 0);
  
  result.push({
    brand: 'Others',
    count: otherCount
  });
  
  return result;
};

// Request brand ownership verification
export const requestBrandOwnership = (productId: string, contactEmail: string): boolean => {
  try {
    const submissions = getProductSubmissions();
    const product = submissions.find(p => p.id === productId);
    
    if (!product) {
      return false;
    }
    
    // Update product with brand ownership request details
    const updatedProduct = {
      ...product,
      brandOwnershipRequested: true,
      brandContactEmail: contactEmail,
      brandOwnershipRequestDate: new Date().toISOString()
    };
    
    // Update in localStorage
    const updatedSubmissions = submissions.map(p => 
      p.id === productId ? updatedProduct : p
    );
    
    localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
    return true;
  } catch (error) {
    console.error("Error requesting brand ownership:", error);
    return false;
  }
};

// Approve brand ownership
export const approveBrandOwnership = (productId: string): boolean => {
  try {
    const submissions = getProductSubmissions();
    const product = submissions.find(p => p.id === productId);
    
    if (!product) {
      return false;
    }
    
    // Update product with verified status
    const updatedProduct = {
      ...product,
      brandVerified: true,
      brandOwnershipRequested: false,
      brandVerificationDate: new Date().toISOString()
    };
    
    // Update in localStorage
    const updatedSubmissions = submissions.map(p => 
      p.id === productId ? updatedProduct : p
    );
    
    localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
    return true;
  } catch (error) {
    console.error("Error approving brand ownership:", error);
    return false;
  }
};

// Reject brand ownership request
export const rejectBrandOwnership = (productId: string): boolean => {
  try {
    const submissions = getProductSubmissions();
    const product = submissions.find(p => p.id === productId);
    
    if (!product) {
      return false;
    }
    
    // Update product to remove ownership request
    const updatedProduct = {
      ...product,
      brandOwnershipRequested: false,
      brandVerified: false
    };
    
    // Update in localStorage
    const updatedSubmissions = submissions.map(p => 
      p.id === productId ? updatedProduct : p
    );
    
    localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
    return true;
  } catch (error) {
    console.error("Error rejecting brand ownership:", error);
    return false;
  }
};

// Function to clean duplicates from localStorage
export const cleanDuplicateProducts = (): number => {
  const submissions = getProductSubmissions();
  const seen = new Map<string, string>();
  let duplicatesRemoved = 0;
  
  // Filter out duplicates keeping only the most recent one
  const uniqueSubmissions = submissions.filter(submission => {
    const key = `${submission.brand.toLowerCase()}_${submission.name.toLowerCase()}`;
    
    // If we haven't seen this product before, mark it as seen
    if (!seen.has(key)) {
      seen.set(key, submission.id);
      return true;
    }
    
    // If this is a more recent version of a product we've seen,
    // update the seen map and keep this one
    const existingId = seen.get(key)!;
    const existingSubmission = submissions.find(s => s.id === existingId);
    
    if (existingSubmission && 
        new Date(submission.submittedAt) > new Date(existingSubmission.submittedAt)) {
      seen.set(key, submission.id);
      duplicatesRemoved++;
      return true;
    }
    
    // Otherwise, this is a duplicate to be removed
    duplicatesRemoved++;
    return false;
  });
  
  if (duplicatesRemoved > 0) {
    localStorage.setItem('product_submissions', JSON.stringify(uniqueSubmissions));
  }
  
  return duplicatesRemoved;
};

// Function to completely reset product database (for admin use only)
export const resetProductDatabase = (): void => {
  localStorage.removeItem('product_submissions');
};
