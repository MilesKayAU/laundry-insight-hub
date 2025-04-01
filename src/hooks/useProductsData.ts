
import { useState, useEffect } from "react";
import { mockProducts } from "@/lib/mockData";
import { getProductSubmissions, ProductSubmission } from "@/lib/textExtractor";
import { normalizeCountry } from "@/utils/countryUtils";
import { isProductSubmission } from "@/components/database/ProductStatusBadges";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define custom typing for product submissions from Supabase
type SupabaseProductSubmission = {
  id: string;
  name: string;
  brand: string;
  type: string;
  description?: string | null;
  pvastatus?: string | null;
  pvapercentage?: number | null;
  approved?: boolean | null;
  country?: string | null;
  websiteurl?: string | null;
  videourl?: string | null;
  imageurl?: string | null;
  owner_id?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
};

// Function to fetch products from Supabase
const fetchProductsFromSupabase = async () => {
  console.log("Fetching products from Supabase...");
  try {
    // Use more explicit typing for Supabase query
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('approved', true) as { data: SupabaseProductSubmission[] | null; error: any };
    
    if (error) {
      console.error("Error fetching products from Supabase:", error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} products from Supabase`);
    
    // Handle the case when data is null
    if (!data) return [];
    
    // Transform the Supabase data to match our ProductSubmission type
    // This handles differences in column naming conventions
    const transformedData = data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      type: item.type,
      description: item.description || '',
      pvaStatus: item.pvastatus || 'needs-verification',
      pvaPercentage: item.pvapercentage || null,
      approved: item.approved || false,
      country: item.country || 'Global',
      websiteUrl: item.websiteurl || '',
      videoUrl: item.videourl || '',
      imageUrl: item.imageurl || '',
      brandVerified: false,
      timestamp: Date.now()
    }));
    
    return transformedData || [];
  } catch (error) {
    console.error("Exception fetching products from Supabase:", error);
    return [];
  }
};

export const useProductsData = (selectedCountry: string) => {
  const [allSubmissions, setAllSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Fetch product submissions from both local and Supabase
  const { data: supabaseProducts, refetch } = useQuery({
    queryKey: ['supabaseProducts', refreshKey],
    queryFn: fetchProductsFromSupabase,
    enabled: true, // Always fetch on mount
  });

  useEffect(() => {
    handleRefreshData();
    
    const intervalId = setInterval(() => {
      handleRefreshData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefreshData = async () => {
    setLoading(true);
    
    // Get local submissions
    const localData = getProductSubmissions();
    console.info(`Local data: Found ${localData.length} submission(s)`);
    
    // Trigger Supabase refetch
    await refetch();
    
    // Update state
    setAllSubmissions(localData);
    setLoading(false);
    setRefreshKey(prev => prev + 1);
    
    console.log("Supabase products:", supabaseProducts);
    
    toast({
      title: "Data refreshed",
      description: "The product database has been refreshed with the latest data.",
    });
  };

  // Get all approved submissions from local data
  const approvedLocalSubmissions = allSubmissions.filter(submission => submission.approved);
  console.info(`Found ${approvedLocalSubmissions.length} approved local submissions`);
  
  // Get all approved submissions from Supabase
  const approvedSupabaseSubmissions = supabaseProducts || [];
  console.info(`Found ${approvedSupabaseSubmissions.length} approved Supabase submissions`);
  
  // Always include mock products if needed for demonstration
  const mockProductsToInclude = mockProducts.filter(product => product.approved);
  console.info(`Including ${mockProductsToInclude.length} mock products`);
  
  // Combine all data sources
  const allApprovedProducts = [
    ...mockProductsToInclude, 
    ...approvedLocalSubmissions,
    ...approvedSupabaseSubmissions
  ];
  
  console.info(`Total products before country filtering: ${allApprovedProducts.length}`);
  
  // Filter by country
  const combinedApprovedProducts = allApprovedProducts.filter(product => {
    if (selectedCountry === "Global") return true;
    
    if (!product.country || product.country.trim() === '') {
      return selectedCountry === "Global";
    }
    
    const productCountry = normalizeCountry(product.country);
    const normalizedSelectedCountry = normalizeCountry(selectedCountry);
    
    return productCountry.toLowerCase() === normalizedSelectedCountry.toLowerCase();
  });

  console.info(`Total combined products after country filtering: ${combinedApprovedProducts.length}`);

  return {
    combinedApprovedProducts,
    loading,
    refreshKey,
    handleRefreshData,
    approvedLocalSubmissions,
    approvedSupabaseSubmissions,
    mockProductsToInclude
  };
};

export const useProductFilters = (products: any[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPvaStatus, setFilterPvaStatus] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;

  // Extract unique product types
  const productTypes = Array.from(new Set(products.map(p => p.type)));

  // Filter products based on search term, type, and PVA status
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === "all" || 
      product.type === filterType;
    
    let matchesPvaStatus = filterPvaStatus === "all";
    
    if (isProductSubmission(product)) {
      if (filterPvaStatus === "contains" && product.pvaStatus === 'contains') {
        matchesPvaStatus = true;
      } else if (filterPvaStatus === "free" && product.pvaStatus === 'verified-free') {
        matchesPvaStatus = true;
      } else if (filterPvaStatus === "unknown" && (product.pvaStatus === 'needs-verification' || product.pvaStatus === 'inconclusive')) {
        matchesPvaStatus = true;
      }
    } else {
      if (filterPvaStatus === "contains" && product.pvaPercentage !== null && product.pvaPercentage > 0) {
        matchesPvaStatus = true;
      } else if (filterPvaStatus === "free" && product.pvaPercentage === 0) {
        matchesPvaStatus = true;
      } else if (filterPvaStatus === "unknown" && product.pvaPercentage === null) {
        matchesPvaStatus = true;
      }
    }
    
    return matchesSearch && matchesType && matchesPvaStatus;
  });

  // Sort products by brand name
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const brandA = a.brand.toLowerCase();
    const brandB = b.brand.toLowerCase();
    
    if (sortDirection === 'asc') {
      return brandA.localeCompare(brandB);
    } else {
      return brandB.localeCompare(brandA);
    }
  });

  // Paginate products
  const paginateData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const paginatedProducts = paginateData(sortedProducts);

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    filterType,
    setFilterType,
    filterPvaStatus,
    setFilterPvaStatus,
    sortDirection,
    toggleSortDirection,
    productTypes,
    filteredProducts,
    paginatedProducts,
    itemsPerPage
  };
};
