import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Globe, Map, RefreshCw, BarChart as BarChartIcon, Table, AlertTriangle, AlertCircle, Database, Trash2 } from "lucide-react";
import { requestBrandOwnership } from "@/lib/bulkUpload";
import { useAuth } from "@/contexts/AuthContext";
import DataCharts from "@/components/DataCharts";
import CountrySelector from "@/components/CountrySelector";
import { useProductsData, useProductFilters } from "@/hooks/useProductsData";
import ProductTable from "@/components/database/ProductTable";
import PaginationControls from "@/components/database/PaginationControls";
import FilterControls from "@/components/database/FilterControls";
import ProductOwnershipDialog from "@/components/database/ProductOwnershipDialog";
import { ProductSubmission } from "@/lib/textExtractor";
import { isProductSubmission } from "@/components/database/ProductStatusBadges";
import SupabaseConnectionCheck from "@/components/SupabaseConnectionCheck";
import { isLiveDataOnlyMode, LIVE_DATA_MODE_KEY } from "@/utils/supabaseUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const availableCountries = [
  "Global",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "South Korea",
  "Brazil",
  "India"
];

const DatabasePage = () => {
  const navigate = useNavigate();
  const [chartView, setChartView] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countrySelected, setCountrySelected] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const { 
    combinedApprovedProducts, 
    loading, 
    handleRefreshData, 
    refreshKey, 
    approvedLocalSubmissions, 
    approvedSupabaseSubmissions,
    liveDataOnly
  } = useProductsData(selectedCountry);
  
  console.info(`DatabasePage: Found ${combinedApprovedProducts.length} products to display (${approvedLocalSubmissions?.length || 0} local, ${approvedSupabaseSubmissions?.length || 0} from Supabase)`);
  console.info("Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated");
  console.info("Products in database:", combinedApprovedProducts);
  
  const {
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
  } = useProductFilters(combinedApprovedProducts);
  
  const handleCountrySelect = (country: string) => {
    console.log("Country selected:", country);
    setSelectedCountry(country);
  };
  
  const handleViewProducts = () => {
    setCountrySelected(true);
  };

  const resetCountryFilter = () => {
    setCountrySelected(false);
    setSelectedCountry("Global");
  };

  const handleBrandOwnershipRequest = (contactEmail: string) => {
    if (!selectedProduct) return;
    
    if (!contactEmail || !contactEmail.includes('@') || !contactEmail.includes('.')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    const emailDomain = contactEmail.split('@')[1];
    const brandNameLower = selectedProduct.brand.toLowerCase().replace(/\s+/g, '');
    
    if (!emailDomain.includes(brandNameLower)) {
      toast({
        title: "Email verification",
        description: "Your email does not match the brand domain. Our admin will carefully verify your ownership claim.",
        variant: "default"
      });
    }
    
    const success = requestBrandOwnership(selectedProduct.id, contactEmail);
    
    if (success) {
      toast({
        title: "Ownership request submitted",
        description: "Your request has been sent to our administrators for verification.",
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Request failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePvaUpdateClick = (brand: string, product: string) => {
    navigate(`/update-pva/${encodeURIComponent(brand)}/${encodeURIComponent(product)}`);
  };

  const handleOwnershipRequest = (product: ProductSubmission) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const toggleDiagnostics = () => {
    setShowDiagnostics(prev => !prev);
  };

  const handleClearLocalData = () => {
    localStorage.removeItem("product_submissions");
    toast({
      title: "Local data cleared",
      description: "All locally stored product data has been removed. Refreshing data...",
    });
    handleRefreshData();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!countrySelected) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Product Database</h1>
          <p className="text-muted-foreground mt-2">
            Explore our database of laundry products and their PVA content
          </p>
        </div>
        
        {isLiveDataOnlyMode() && (
          <Alert className="mb-6 border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Live Data Only Mode Enabled</AlertTitle>
            <AlertDescription>
              Only showing data loaded directly from Supabase. No local or fallback data will be used.
            </AlertDescription>
          </Alert>
        )}
        
        <CountrySelector
          selectedCountry={selectedCountry}
          countries={availableCountries}
          onCountrySelect={handleCountrySelect}
          onSubmit={handleViewProducts}
        />
        
        {isAuthenticated && (
          <div className="mt-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Button variant="link" onClick={toggleDiagnostics}>
                {showDiagnostics ? "Hide" : "Show"} Connection Diagnostics
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearLocalData}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Clear Local Data Cache
              </Button>
            </div>
            
            {showDiagnostics && (
              <div className="mt-6">
                <SupabaseConnectionCheck />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (combinedApprovedProducts.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Product Database</h1>
          <p className="text-muted-foreground mt-2">
            Explore our database of laundry products and their PVA content
          </p>
        </div>
        
        {isLiveDataOnlyMode() && (
          <Alert className="mb-6 border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Live Data Only Mode Enabled</AlertTitle>
            <AlertDescription>
              Only showing data loaded directly from Supabase. No local or fallback data will be used.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-10">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {selectedCountry === "Global" ? "Global Product Database" : `Products in ${selectedCountry}`}
                </CardTitle>
                <CardDescription>
                  Search, filter and explore products to find PVA content information
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetCountryFilter}
                  className="mr-2"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Change Region
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                {isAuthenticated && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleDiagnostics}
                      className="mr-2"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {showDiagnostics ? "Hide" : "Show"} Diagnostics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearLocalData}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showDiagnostics && isAuthenticated && (
              <div className="mb-6">
                <SupabaseConnectionCheck />
              </div>
            )}
            
            <div className="text-center py-12 bg-muted/50 rounded-lg mb-20">
              <h3 className="text-lg font-medium mb-2">No products found in the database</h3>
              <p className="text-muted-foreground mb-4">
                {liveDataOnly 
                  ? "No products found in the Supabase database. Live Data Only Mode is enabled." 
                  : "We don't have any approved products in our database for this region yet."}
                {isAuthenticated && " You're logged in as an admin, so you can add products."}
              </p>
              <Button variant="outline" asChild>
                <Link to="/contribute">
                  Contribute a product
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Product Database</h1>
        <p className="text-muted-foreground mt-2">
          Explore our database of laundry products and their PVA content
        </p>
      </div>
      
      {isLiveDataOnlyMode() && (
        <Alert className="mb-6 border-amber-500 bg-amber-500/10">
          <Database className="h-4 w-4 text-amber-500" />
          <AlertTitle>Live Data Only Mode Enabled</AlertTitle>
          <AlertDescription>
            Only showing data loaded directly from Supabase. No local or fallback data will be used.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {selectedCountry === "Global" ? "Global Product Database" : `Products in ${selectedCountry}`}
              </CardTitle>
              <CardDescription>
                Search, filter and explore products to find PVA content information
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetCountryFilter}
              >
                <Map className="h-4 w-4 mr-2" />
                Change Region
              </Button>
              <Button 
                variant={chartView ? "default" : "outline"} 
                size="sm"
                onClick={() => setChartView(true)}
              >
                <BarChartIcon className="h-4 w-4 mr-2" />
                Chart View
              </Button>
              <Button 
                variant={!chartView ? "default" : "outline"} 
                size="sm"
                onClick={() => setChartView(false)}
              >
                <Table className="h-4 w-4 mr-2" />
                Table View
              </Button>
              {isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDiagnostics}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {showDiagnostics ? "Hide" : "Show"} Diagnostics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLocalData}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showDiagnostics && isAuthenticated && (
            <div className="mb-6">
              <SupabaseConnectionCheck />
            </div>
          )}
          
          <FilterControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterPvaStatus={filterPvaStatus}
            setFilterPvaStatus={setFilterPvaStatus}
            productTypes={productTypes}
            setCurrentPage={setCurrentPage}
          />
          
          {chartView ? (
            <div className="mb-20">
              {filteredProducts.length > 0 ? (
                <DataCharts key={refreshKey} products={filteredProducts.filter(isProductSubmission)} />
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  No products found matching your criteria
                </div>
              )}
            </div>
          ) : (
            <div className="mb-20">
              <ProductTable 
                products={paginatedProducts} 
                sortDirection={sortDirection} 
                toggleSortDirection={toggleSortDirection} 
                onOwnershipRequest={handleOwnershipRequest}
                onPvaUpdateClick={handlePvaUpdateClick}
              />
              <PaginationControls 
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <ProductOwnershipDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        selectedProduct={selectedProduct}
        onSubmit={handleBrandOwnershipRequest}
      />
    </div>
  );
};

export default DatabasePage;
