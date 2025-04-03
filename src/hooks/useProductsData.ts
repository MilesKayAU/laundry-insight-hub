
import { useState, useEffect } from "react";
import { getProductSubmissions, ProductSubmission, updateProductSubmission } from "@/lib/textExtractor";
import { normalizeCountry } from "@/utils/countryUtils";
import { isProductSubmission } from "@/components/database/ProductStatusBadges";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { isLiveDataOnlyMode } from "@/utils/supabaseUtils";

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
const fetchProductsFromSupabase = async (isAuthenticated: boolean) => {
  console.log("Fetching products from Supabase...");
  try {
    // Determine if we're in admin view to fetch appropriate data
    const isAdminView = isAuthenticated && window.location.pathname.includes('/admin');
    console.log("Is admin view in fetch function:", isAdminView);
    
    // Always fetch all products from Supabase first, to ensure we have everything
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*');
    
    if (error) {
      console.error("Error fetching products from Supabase:", error);
      throw new Error(`Supabase query error: ${error.message}`);
    }
    
    console.log(`Fetched ${data?.length || 0} total products from Supabase`);
    console.log("Raw Supabase data:", data);
    
    // Handle the case when data is null
    if (!data) {
      console.warn("No data returned from Supabase - check RLS policies and API keys");
      return [];
    }
    
    // Transform the Supabase data to match our ProductSubmission type
    const transformedData = data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      type: item.type,
      description: item.description || '',
      pvaStatus: item.pvastatus || 'needs-verification',
      pvaPercentage: item.pvapercentage || null,
      approved: typeof item.approved === 'boolean' ? item.approved : false, // Default to false if not specified
      country: item.country || 'Global',
      websiteUrl: item.websiteurl || '',
      videoUrl: item.videourl || '',
      imageUrl: item.imageurl || '',
      brandVerified: false,
      timestamp: Date.now()
    }));
    
    console.log("Transformed Supabase data:", transformedData);
    console.log("Checking approval status of items:", transformedData.map(item => `${item.name}: ${item.approved}`));
    
    return transformedData;
  } catch (error) {
    console.error("Exception fetching products from Supabase:", error);
    throw error; // Rethrow to let React Query handle the error state
  }
};

export const useProductsData = (selectedCountry: string) => {
  const [allSubmissions, setAllSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const liveDataOnly = isLiveDataOnlyMode();

  // Fetch product submissions from both local and Supabase
  const { data: supabaseProducts = [], isError, error, refetch } = useQuery({
    queryKey: ['supabaseProducts', refreshKey, isAuthenticated],
    queryFn: () => fetchProductsFromSupabase(isAuthenticated),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: true, // Always fetch on mount
  });

  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching Supabase data:", error);
      toast({
        title: "Database Connection Error",
        description: "Failed to connect to product database. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    handleRefreshData();
    
    const intervalId = setInterval(() => {
      console.log("Periodic refresh of product data...");
      handleRefreshData();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefreshData = async () => {
    setLoading(true);
    
    try {
      // IMPORTANT: Only get local product submissions if we're not in live-only mode
      let allData: ProductSubmission[] = [];
      
      if (liveDataOnly) {
        console.log("Live data only mode enabled - not loading local submissions");
        // Force clear any localStorage data to ensure we're truly in live mode
        localStorage.removeItem("product_submissions");
      } else {
        // Only fetch from localStorage when not in live data only mode
        allData = getProductSubmissions();
        console.log(`Retrieved ${allData.length} local product submissions`);
      }
      
      setAllSubmissions(allData);
      
      // Trigger Supabase refetch
      await refetch();
      
      // Check Supabase connection
      const { error: checkError } = await supabase.from('product_submissions').select('count').limit(1);
      if (checkError) {
        console.error("Supabase connection check failed:", checkError);
        toast({
          title: "Database Connection Issue",
          description: "Failed to connect to product database. Check network connection or API keys.",
          variant: "destructive"
        });
      }
      
      setLoading(false);
      setRefreshKey(prev => prev + 1);
      
      if (!liveDataOnly) {
        toast({
          title: "Data refreshed",
          description: "The product database has been refreshed with both local and remote data."
        });
      } else {
        toast({
          title: "Live data refreshed",
          description: "Loaded live data only from Supabase. No local data is being used."
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setLoading(false);
      toast({
        title: "Error refreshing data",
        description: "There was an error refreshing the product database.",
        variant: "destructive"
      });
    }
  };

  // Determine which products to show based on authentication, admin view, and filters
  const isAdminView = isAuthenticated && window.location.pathname.includes('/admin');
  console.log("Is authenticated:", isAuthenticated);
  console.log("Is admin view:", isAdminView);
  console.log("Live data only:", liveDataOnly);
  console.log("All Supabase products (before filtering):", supabaseProducts);
  
  // Debug logs for approval status
  console.log("Approval status check:", supabaseProducts.map(p => `${p.name}: ${p.approved}`));
  
  // Filter Supabase products based on admin view or public view
  const approvedSupabaseSubmissions = isAdminView 
    ? supabaseProducts  // In admin view, show ALL products from Supabase
    : supabaseProducts.filter(product => product.approved === true);  // In public view, show only approved
    
  console.info(`Found ${approvedSupabaseSubmissions.length} Supabase submissions for current view`);
  console.info(`Raw Supabase submissions count: ${supabaseProducts.length}`);
  console.info(`Admin view: ${isAdminView}, Filtering by approved: ${!isAdminView}`);
  
  // Get all approved submissions from local data - only if not in live-only mode
  const approvedLocalSubmissions = liveDataOnly ? [] : allSubmissions.filter(submission => submission.approved === true);
  console.info(liveDataOnly 
    ? "Live data only mode - not using local submissions" 
    : `Found ${approvedLocalSubmissions.length} approved local submissions`);
  
  // Combine all products that are approved only for public views
  // For admin views, we include unapproved products too
  const allApprovedProducts = [
    ...approvedSupabaseSubmissions, 
    ...approvedLocalSubmissions
  ];
  
  console.info(`Total approved products before country filtering: ${allApprovedProducts.length}`);
  
  // Filter by country only if a country is selected
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
  
  // Get pending products (not approved)
  const pendingProducts = liveDataOnly ? [] : allSubmissions.filter(submission => submission.approved !== true);
  console.info(liveDataOnly 
    ? "Live data only mode - not using pending local submissions"
    : `Found ${pendingProducts.length} pending local submissions`);
  
  // Start with the filtered products as the baseline for display
  let productsToDisplay = combinedApprovedProducts;
  
  // Special handling for admin views
  if (isAuthenticated) {
    console.info("User is authenticated. Checking if we should show additional products for admin views.");
    
    // Only for admin routes or when working with admin-specific components
    if (isAdminView) {
      if (liveDataOnly) {
        // In live data mode with admin view - show ALL products from Supabase, including unapproved
        productsToDisplay = [...supabaseProducts];
        console.info(`Total products for admin view in live data mode: ${productsToDisplay.length}`);
      } else {
        // Standard mode with admin view - show everything from both sources
        productsToDisplay = [...allSubmissions, ...supabaseProducts];
        console.info(`Total products for admin view: ${productsToDisplay.length}`);
      }
    }
  }

  // Update product function
  const updateProduct = async (productId: string, updatedData: Partial<ProductSubmission>) => {
    try {
      console.log("Updating product:", productId, updatedData);
      
      // First update in Supabase if possible
      try {
        const { error } = await supabase
          .from('product_submissions')
          .update({
            name: updatedData.name,
            brand: updatedData.brand,
            description: updatedData.description,
            type: updatedData.type,
            pvastatus: updatedData.pvaStatus,
            pvapercentage: updatedData.pvaPercentage,
            approved: updatedData.approved,
            country: updatedData.country,
            websiteurl: updatedData.websiteUrl,
            updatedat: new Date().toISOString()
          })
          .eq('id', productId);
        
        if (error) {
          console.error("Error updating product in Supabase:", error);
          toast({
            title: "Database Update Error",
            description: "Failed to update product in database. Will continue with local update.",
            variant: "warning"
          });
        } else {
          console.log("Successfully updated product in Supabase");
        }
      } catch (dbError) {
        console.error("Failed to update product in Supabase:", dbError);
        // Continue with local update
      }
      
      // Update product in the database/localStorage
      const success = updateProductSubmission(productId, updatedData);
      
      if (success) {
        // Update local state to reflect changes immediately
        const updatedSubmissions = allSubmissions.map(product => 
          product.id === productId ? { ...product, ...updatedData } : product
        );
        
        setAllSubmissions(updatedSubmissions);
        
        // Show success message
        toast({
          title: "Product Updated",
          description: "The product has been updated successfully.",
        });
        
        // Force data refresh
        setRefreshKey(prev => prev + 1);
        
        return true;
      } else {
        toast({
          title: "Error Updating Product",
          description: "There was an error updating the product in storage.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      
      toast({
        title: "Error Updating Product",
        description: "There was an error updating the product.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    combinedApprovedProducts: productsToDisplay,
    pendingProducts,
    loading,
    refreshKey,
    handleRefreshData,
    approvedLocalSubmissions,
    approvedSupabaseSubmissions,
    updateProduct,
    liveDataOnly
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
