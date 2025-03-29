
import { ProductSubmission, getProductSubmissions } from "./textExtractor";

// Define the expected format for the CSV/Excel data
export interface BulkProductData {
  brand: string;
  name: string;
  type: string;
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  pvaPercentage?: number;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
  additionalNotes?: string;
}

// Check if product with same brand and name already exists
export const isDuplicateProduct = (brand: string, name: string): boolean => {
  const existingProducts = getProductSubmissions();
  return existingProducts.some(
    product => 
      product.brand.toLowerCase() === brand.toLowerCase() && 
      product.name.toLowerCase() === name.toLowerCase()
  );
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

      // Determine PVA status based on percentage or additional notes
      let pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive' = 'needs-verification';
      
      // Check additional notes for PVA indicators
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
      
      // Use provided pvaStatus if it exists, otherwise use our determined one
      item.pvaStatus = item.pvaStatus || pvaStatus;

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
        pvaStatus: item.pvaStatus,
        pvaPercentage: item.pvaPercentage,
        description: item.additionalNotes || item.description || "",
        imageUrl: item.imageUrl || "",
        videoUrl: item.videoUrl || "",
        websiteUrl: item.websiteUrl || "",
        submittedAt: new Date().toISOString(),
        approved: true, // Auto-approve admin uploads
        dateSubmitted: new Date().toISOString()
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

// Parse CSV data
export const parseCSV = (csvText: string): BulkProductData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const item: any = {};
    
    headers.forEach((header, index) => {
      // Convert headers to match our expected format
      let fieldName = header.toLowerCase().replace(/\s+/g, '');
      
      // Map CSV headers to our interface properties
      if (fieldName === 'brandname') fieldName = 'brand';
      if (fieldName === 'productname') fieldName = 'name';
      if (fieldName === 'producttype') fieldName = 'type';
      if (fieldName === 'pvapercentage(ifknown)') fieldName = 'pvaPercentage';
      if (fieldName === 'additionalnotes') fieldName = 'additionalNotes';
      
      if (fieldName === 'pvaPercentage') {
        const numValue = parseFloat(values[index]);
        item[fieldName] = isNaN(numValue) ? undefined : numValue;
      } else {
        item[fieldName] = values[index];
      }
    });
    
    return item as BulkProductData;
  });
};

// Get sample CSV template content
export const getSampleCSVTemplate = (): string => {
  return 'Brand Name,Product Name,Product Type,PVA Percentage (if known),Additional Notes\n' +
    'Example Brand,Product Name,Laundry Sheets,0,Product contains no PVA. Verified by manufacturer.';
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
  
  const otherCount = otherBrands.reduce((sum, [_, products]) => sum + products.length, 0);
  
  result.push({
    brand: 'Others',
    count: otherCount
  });
  
  return result;
};
