
import { useState, useEffect } from "react";
import { mockProducts } from "@/lib/mockData";
import { getProductSubmissions, ProductSubmission } from "@/lib/textExtractor";
import { normalizeCountry } from "@/utils/countryUtils";
import { isProductSubmission } from "@/components/database/ProductStatusBadges";
import { useToast } from "@/components/ui/use-toast";

export const useProductsData = (selectedCountry: string) => {
  const [allSubmissions, setAllSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Fetch product submissions
  useEffect(() => {
    handleRefreshData();
    
    const intervalId = setInterval(() => {
      handleRefreshData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefreshData = () => {
    setLoading(true);
    const freshData = getProductSubmissions();
    console.info(`Refreshed data: Found ${freshData.length} submission(s)`);
    setAllSubmissions(freshData);
    setLoading(false);
    setRefreshKey(prev => prev + 1);
    
    toast({
      title: "Data refreshed",
      description: "The product database has been refreshed with the latest data.",
    });
  };

  const approvedSubmissions = allSubmissions.filter(submission => submission.approved);
  const approvedProducts = approvedSubmissions.length > 0 ? [] : mockProducts.filter(product => product.approved);

  // Filter products by country
  const combinedApprovedProducts = [...approvedProducts, ...approvedSubmissions].filter(product => {
    if (selectedCountry === "Global") return true;
    
    if (!product.country || product.country.trim() === '') {
      return selectedCountry === "Global";
    }
    
    const productCountry = normalizeCountry(product.country);
    const normalizedSelectedCountry = normalizeCountry(selectedCountry);
    
    return productCountry.toLowerCase() === normalizedSelectedCountry.toLowerCase();
  });

  return {
    combinedApprovedProducts,
    loading,
    refreshKey,
    handleRefreshData
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
