import { useState, useEffect, useCallback } from "react";
import { getProductSubmissions, ProductSubmission, updateProductSubmission } from "@/lib/textExtractor";
import { normalizeCountry } from "@/utils/countryUtils";
import { isProductSubmission } from "@/components/database/ProductStatusBadges";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    console.log("Raw Supabase data sample:", data?.slice(0, 3));
    console.log("Approval status sample:", data?.slice(0, 10).map(item => `${item.brand} ${item.name}: ${item.approved}`));
    
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
    
    console.log("Transformed Supabase data count:", transformedData.length);
    console.log("Approval status after transform:", transformedData.slice(0, 10).map(item => `${item.brand} ${item.name}: ${item.approved}`));
    
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
  const queryClient = useQueryClient();

  // Fetch product submissions from both local and Supabase
  const { data: supabaseProducts = [], isError, error, refetch } = useQuery({
    queryKey: ['supabaseProducts', refreshKey, isAuthenticated],
    queryFn: () => fetchProductsFromSupabase(isAuthenticated),
    staleTime: 30 * 1000, // Increased to 30 seconds - less frequent refresh
    gcTime: 2 * 60 * 1000, // Increased to 2 minutes - less frequent cache clearing
    retry: 2, 
    enabled: true, 
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
    const handleInvalidateCache = () => {
      console.log("useProductsData: Cache invalidation event received");
      queryClient.invalidateQueries({ queryKey: ['supabaseProducts'] });
      handleRefreshData();
    };
    
    const handleReloadProducts = () => {
      console.log("useProductsData: reload-products event received");
      setRefreshKey(prev => prev + 1);
      handleRefreshData();
    };
    
    window.addEventListener('invalidate-product-cache', handleInvalidateCache);
    window.addEventListener('reload-products', handleReloadProducts);
    
    // Initial load
    handleRefreshData();
    
    // Less frequent auto-refresh
    const refreshInterval = setInterval(() => {
      console.log("useProductsData: Periodic refresh of product data...");
      handleRefreshData();
    }, 60000); // Increased to 60 seconds
    
    return () => {
      window.removeEventListener('invalidate-product-cache', handleInvalidateCache);
      window.removeEventListener('reload-products', handleReloadProducts);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleRefreshData = useCallback(async () => {
    setLoading(true);
    
    try {
      // IMPORTANT: Only get local product submissions if we're not in live-only mode
      let allData: ProductSubmission[] = [];
      
      if (liveDataOnly) {
        console.log("Live data only mode enabled - not loading local submissions");
      } else {
        // Only fetch from localStorage when not in live data only mode
        allData = getProductSubmissions();
        console.log(`Retrieved ${allData.length} local product submissions`);
      }
      
      setAllSubmissions(allData);
      
      // Trigger Supabase refetch
      await refetch();
      
      // Check Supabase connection and count approved products
      try {
        const { data, error: checkError } = await supabase
          .from('product_submissions')
          .select('count')
          .eq('approved', true);
          
        if (checkError) {
          console.error("Supabase connection check failed:", checkError);
          toast({
            title: "Database Connection Issue",
            description: "Failed to connect to product database. Check network connection or API keys.",
            variant: "destructive"
          });
        } else {
          console.log("Approved products count from direct query:", data);
        }
      } catch (e) {
        console.error("Error checking approved products:", e);
      }
      
      setRefreshKey(prev => prev + 1);
      
      if (!liveDataOnly) {
        console.log("Data refreshed with both local and remote data");
      } else {
        console.log("Live data refreshed from Supabase only. No local data is being used.");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setLoading(false);
      toast({
        title: "Error refreshing data",
        description: "There was an error refreshing the product database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [liveDataOnly, refetch, toast]);

  // Determine which products to show based on authentication, admin view, and filters
  const isAdminView = isAuthenticated && window.location.pathname.includes('/admin');
  console.log("Is authenticated:", isAuthenticated);
  console.log("Is admin view:", isAdminView);
  console.log("Live data only:", liveDataOnly);
  console.log("All Supabase products count:", supabaseProducts.length);
  
  // Debug logs for approval status
  console.log("Approval status count:", supabaseProducts.filter(p => p.approved === true).length);
  
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
  // If in admin view, show all products that are not approved
  // If in public view, show only approved products that are also not pending verification
  const pendingProducts = isAdminView
    ? (liveDataOnly 
        ? supabaseProducts.filter(product => product.approved !== true)
        : [...allSubmissions.filter(submission => submission.approved !== true),
           ...supabaseProducts.filter(product => product.approved !== true)])
    : [];
    
  console.info(`Found ${pendingProducts.length} pending submissions for current view`);
  
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
            videourl: updatedData.videoUrl,
            imageurl: updatedData.imageUrl,
            updatedat: new Date().toISOString()
          })
          .eq('id', productId);
        
        if (error) {
          console.error("Error updating product in Supabase:", error);
          throw error;
        }
        
        console.log("Successfully updated product in Supabase");
        
        // Force a refetch to ensure we have the latest data
        queryClient.invalidateQueries({ queryKey: ['supabaseProducts'] });
        refetch();
        
        // Also trigger a global refresh
        window.dispatchEvent(new Event('reload-products'));
      } catch (dbError) {
        console.error("Failed to update product in Supabase:", dbError);
        // Continue with local update
      }
      
      // Update product in localStorage
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
        handleRefreshData();
        
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
