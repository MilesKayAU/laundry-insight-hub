import { ProductSubmission, getProductSubmissions, analyzePvaContent, getAllPvaPatterns } from "./textExtractor";

export interface BulkProductData {
  brand: string;
  name: string;
  type: string;
  ingredients?: string;
  pvaStatus?: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  pvaPercentage?: number;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
  additionalNotes?: string;
  country?: string;
  countries?: string[];
  hasPva?: 'yes' | 'no' | 'unidentified';
  productUrl?: string;
}

export const isDuplicateProduct = (brand: string, name: string): boolean => {
  const existingProducts = getProductSubmissions();
  const approvedProducts = existingProducts.filter(product => product.approved);
  
  return approvedProducts.some(
    product => 
      product.brand.toLowerCase() === brand.toLowerCase() && 
      product.name.toLowerCase() === name.toLowerCase()
  );
};

export const analyzePvaStatus = (ingredients?: string): 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive' => {
  if (!ingredients) {
    return 'needs-verification';
  }
  
  console.log(`Analyzing ingredients for PVA: "${ingredients.substring(0, 100)}${ingredients.length > 100 ? '...' : ''}"`);
  
  const analysis = analyzePvaContent(ingredients);
  
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
  
  return ingredients.length > 10 ? 'inconclusive' : 'needs-verification';
};

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

  data.forEach(item => {
    try {
      if (!item.brand || !item.name || !item.type) {
        result.errors.push({ 
          item, 
          error: 'Missing required fields (brand, name, or type)' 
        });
        return;
      }

      let pvaStatus = analyzePvaStatus(item.ingredients);
      
      if (item.pvaStatus) {
        pvaStatus = item.pvaStatus;
      } else if (item.hasPva) {
        if (item.hasPva === 'yes') {
          pvaStatus = 'contains';
        } else if (item.hasPva === 'no') {
          pvaStatus = 'verified-free';
        } else if (item.hasPva === 'unidentified') {
          pvaStatus = 'inconclusive';
        }
      } else {
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
      
      if (isDuplicateProduct(item.brand, item.name)) {
        result.duplicates.push(item);
        return;
      }

      const newProduct = {
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
        websiteUrl: item.productUrl || item.websiteUrl || "",
        submittedAt: new Date().toISOString(),
        dateSubmitted: new Date().toISOString(),
        approved: false,
        brandVerified: false,
        brandContactEmail: "",
        ingredients: item.ingredients || "",
        timestamp: Date.now()
      };

      const existingProducts = getProductSubmissions();
      const updatedProducts = [...existingProducts, newProduct];
      
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      localStorage.setItem('product_submissions', JSON.stringify(updatedProducts));
      
      console.log('Product added to pending:', newProduct.brand, newProduct.name);
      
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

export const parseCSV = (csvText: string): BulkProductData[] => {
  try {
    console.log("Starting CSV parsing process...");
    
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      throw new Error("CSV file is empty or contains only headers");
    }
    
    const headerLine = lines[0].trim();
    const delimiter = headerLine.includes(';') ? ';' : ',';
    
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
    
    headers.push(currentHeader.trim().replace(/^"(.*)"$/, '$1'));
    
    console.log("Detected headers:", headers);
    
    const headerMap: Record<string, string> = {
      'brand': 'brand',
      'brandname': 'brand',
      'brand name': 'brand',
      'manufacturer': 'brand',
      'company': 'brand',
      
      'name': 'name',
      'productname': 'name',
      'product name': 'name',
      'product': 'name',
      
      'type': 'type',
      'producttype': 'type',
      'product type': 'type',
      'category': 'type',
      
      'ingredients': 'ingredients',
      'ingredients list': 'ingredients',
      'product ingredients': 'ingredients',
      'formula': 'ingredients',
      
      'pvastatus': 'hasPva',
      'haspva': 'hasPva',
      'has pva': 'hasPva',
      'containspva': 'hasPva',
      'contains pva': 'hasPva',
      
      'pvapercentage': 'pvaPercentage',
      'pva percentage': 'pvaPercentage',
      'pva percentage (if known)': 'pvaPercentage',
      'pva %': 'pvaPercentage',
      
      'additionalnotes': 'additionalNotes',
      'additional notes': 'additionalNotes',
      'notes': 'additionalNotes',
      'description': 'additionalNotes',
      
      'country': 'country',
      'region': 'country',
      'market': 'country',
      'availability': 'country',
      
      'producturl': 'productUrl',
      'product url': 'productUrl',
      'url': 'productUrl',
      'link': 'productUrl',
      'website': 'productUrl',
      'product link': 'productUrl'
    };
    
    const fieldMapping: Record<number, string> = {};
    const foundRequiredFields: Record<string, boolean> = {
      'brand': false,
      'name': false,
      'type': false
    };
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase().trim();
      console.log(`Processing header: "${lowerHeader}" at index ${index}`);
      
      for (const [possibleName, fieldName] of Object.entries(headerMap)) {
        if (lowerHeader === possibleName) {
          fieldMapping[index] = fieldName;
          
          if (fieldName in foundRequiredFields) {
            foundRequiredFields[fieldName] = true;
          }
          
          console.log(`Mapped "${lowerHeader}" to "${fieldName}"`);
          break;
        }
      }
      
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
    
    const missingRequiredHeaders = Object.entries(foundRequiredFields)
      .filter(([_, found]) => !found)
      .map(([field]) => field);
    
    if (missingRequiredHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingRequiredHeaders.join(', ')}. Please use the template.`);
    }
    
    return lines.slice(1).map((line, lineIndex) => {
      if (!line.trim()) {
        return null;
      }
      
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
      
      values.push(currentValue.trim());
      
      if (values.length !== headers.length) {
        if (values.length < headers.length) {
          values = [...values, ...Array(headers.length - values.length).fill('')];
        } else {
          values = values.slice(0, headers.length);
        }
      }
      
      const item: Partial<BulkProductData> = {};
      
      headers.forEach((header, index) => {
        const fieldName = fieldMapping[index];
        if (!fieldName) return;
        
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

export const getSampleCSVTemplate = (): string => {
  return '"Brand Name","Product Name","Product Type","Ingredients","PVA Percentage (if known)","Additional Notes","Country","Product URL"\n' +
    '"Example Brand","Product Name","Laundry Sheets","Water, Sodium Lauryl Sulfate, Sodium Carbonate, Citric Acid","0","Product contains no PVA. Verified by manufacturer.","Australia","https://example.com/product"';
};

export const groupProductsByBrand = (products: ProductSubmission[]) => {
  const groupedData = products.reduce((acc, product) => {
    const brand = product.brand;
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, ProductSubmission[]>);

  return Object.entries(groupedData)
    .sort((a, b) => b[1].length - a[1].length);
};

export const getTopBrands = (products: ProductSubmission[], limit: number = 10) => {
  const grouped = groupProductsByBrand(products);
  return grouped.slice(0, limit).map(([brand, products]) => ({
    brand,
    count: products.length
  }));
};

export const getBrandCategories = (products: ProductSubmission[], limit: number = 10) => {
  const grouped = groupProductsByBrand(products);
  
  if (grouped.length <= limit) {
    return grouped.map(([brand, products]) => ({
      brand,
      count: products.length
    }));
  }
  
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

export const requestBrandOwnership = (productId: string, contactEmail: string): boolean => {
  try {
    const submissions = getProductSubmissions();
    const product = submissions.find(p => p.id === productId);
    
    if (!product) {
      return false;
    }
    
    const updatedProduct = {
      ...product,
      brandOwnershipRequested: true,
      brandContactEmail: contactEmail,
      brandOwnershipRequestDate: new Date().toISOString()
    };
    
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

export const approveBrandOwnership = (productId: string): boolean => {
  try {
    const submissions = getProductSubmissions();
    const product = submissions.find(p => p.id === productId);
    
    if (!product) {
      return false;
    }
    
    const updatedProduct = {
      ...product,
      brandVerified: true,
      brandOwnershipRequested: false,
      brandVerificationDate: new Date().toISOString()
    };
    
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

export const rejectBrandOwnership = (productId: string): boolean => {
  try {
    const submissions = getProductSubmissions();
    const product = submissions.find(p => p.id === productId);
    
    if (!product) {
      return false;
    }
    
    const updatedProduct = {
      ...product,
      brandOwnershipRequested: false,
      brandVerified: false
    };
    
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

export const cleanDuplicateProducts = (): number => {
  const submissions = getProductSubmissions();
  const seen = new Map<string, string>();
  let duplicatesRemoved = 0;
  
  const uniqueSubmissions = submissions.filter(submission => {
    const key = `${submission.brand.toLowerCase()}_${submission.name.toLowerCase()}`;
    
    if (!seen.has(key)) {
      seen.set(key, submission.id);
      return true;
    }
    
    const existingId = seen.get(key)!;
    const existingSubmission = submissions.find(s => s.id === existingId);
    
    if (existingSubmission && 
        new Date(submission.submittedAt) > new Date(existingSubmission.submittedAt)) {
      seen.set(key, submission.id);
      duplicatesRemoved++;
      return true;
    }
    
    duplicatesRemoved++;
    return false;
  });
  
  if (duplicatesRemoved > 0) {
    localStorage.setItem('product_submissions', JSON.stringify(uniqueSubmissions));
  }
  
  return duplicatesRemoved;
};

export const resetProductDatabase = (): void => {
  localStorage.removeItem('product_submissions');
};
