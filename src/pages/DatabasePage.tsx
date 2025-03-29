
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockProducts } from "@/lib/mockData";
import { getProductSubmissions, ProductSubmission } from "@/lib/textExtractor";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { requestBrandOwnership } from "@/lib/bulkUpload";
import { useToast } from "@/components/ui/use-toast";
import { 
  BadgeCheck, 
  Shield, 
  Filter, 
  Search as SearchIcon,
  ChevronDown,
  BarChart as BarChartIcon,
  Globe,
  Map,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataCharts from "@/components/DataCharts";
import CountrySelector from "@/components/CountrySelector";

const DatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPvaStatus, setFilterPvaStatus] = useState<string>("all");
  const [chartView, setChartView] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countrySelected, setCountrySelected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allSubmissions, setAllSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Reset country selection state when component mounts to ensure the country selector always shows first
  useEffect(() => {
    setCountrySelected(false);
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
  
  const availableCountries = Array.from(new Set([
    ...approvedProducts.map(p => p.country || "Global"),
    ...approvedSubmissions.map(p => p.country || "Global")
  ])).filter(country => country !== "Global").sort();
  
  const isProductSubmission = (product: any): product is ProductSubmission => {
    return 'pvaStatus' in product;
  };
  
  const combinedApprovedProducts = [...approvedProducts, ...approvedSubmissions].filter(product => {
    return selectedCountry === "Global" || product.country === selectedCountry;
  });
  
  const filteredProducts = combinedApprovedProducts.filter(product => {
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
      } else if (filterPvaStatus === "unknown" && product.pvaStatus === 'needs-verification') {
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
  
  const productTypes = Array.from(new Set(combinedApprovedProducts.map(p => p.type)));
  
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };
  
  const paginatedProducts = paginateData(filteredProducts);
  
  const getTotalPages = (totalItems) => {
    return Math.ceil(totalItems / itemsPerPage);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
  };
  
  const handleViewProducts = () => {
    setCountrySelected(true);
  };

  const resetCountryFilter = () => {
    setCountrySelected(false);
    setSelectedCountry("Global");
  };

  const handleBrandOwnershipRequest = () => {
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
      setContactEmail("");
    } else {
      toast({
        title: "Request failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const PaginationControls = ({ totalItems }) => {
    const totalPages = getTotalPages(totalItems);
    
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={currentPage === index + 1}
                onClick={() => handlePageChange(index + 1)}
                className="cursor-pointer"
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderPvaValue = (product) => {
    if (product.pvaPercentage !== null && product.pvaPercentage !== undefined) {
      return `${product.pvaPercentage}%`;
    } else {
      return (
        <span className="flex items-center gap-1">
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Unknown
          </Badge>
        </span>
      );
    }
  };
  
  const renderBrandVerification = (product) => {
    if (!isProductSubmission(product)) return null;
    
    if (product.brandVerified) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">
          <BadgeCheck className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (product.brandOwnershipRequested) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 ml-2">
          Verification Pending
        </Badge>
      );
    }
    return null;
  };

  const renderBrandButtons = (product) => {
    if (!isProductSubmission(product)) return null;
    
    if (product.brandVerified || product.brandOwnershipRequested) {
      return null;
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        className="ml-2 text-xs"
        onClick={() => {
          setSelectedProduct(product as ProductSubmission);
          setIsDialogOpen(true);
        }}
      >
        <Shield className="h-3 w-3 mr-1" />
        Own this brand?
      </Button>
    );
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  // Always show the country selector first before showing the product data
  if (!countrySelected) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Product Database</h1>
          <p className="text-muted-foreground mt-2">
            Explore our database of laundry products and their PVA content
          </p>
        </div>
        
        <CountrySelector
          selectedCountry={selectedCountry}
          countries={availableCountries}
          onCountrySelect={handleCountrySelect}
          onSubmit={handleViewProducts}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Product Database</h1>
        <p className="text-muted-foreground mt-2">
          Explore our database of laundry products and their PVA content
        </p>
      </div>
      
      <Card>
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
                onClick={handleRefreshData}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product or brand name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              
              <div className="flex gap-3">
                <Select 
                  value={filterType} 
                  onValueChange={(value) => {
                    setFilterType(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      PVA Filter
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by PVA</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filterPvaStatus === "all"}
                      onCheckedChange={() => {
                        setFilterPvaStatus("all");
                        setCurrentPage(1);
                      }}
                    >
                      All Products
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterPvaStatus === "contains"}
                      onCheckedChange={() => {
                        setFilterPvaStatus("contains");
                        setCurrentPage(1);
                      }}
                    >
                      Contains PVA
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterPvaStatus === "free"}
                      onCheckedChange={() => {
                        setFilterPvaStatus("free");
                        setCurrentPage(1);
                      }}
                    >
                      PVA-Free
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterPvaStatus === "unknown"}
                      onCheckedChange={() => {
                        setFilterPvaStatus("unknown");
                        setCurrentPage(1);
                      }}
                    >
                      Unknown PVA
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {chartView ? (
            <div>
              <div className="h-96">
                {filteredProducts.length > 0 ? (
                  <DataCharts key={refreshKey} products={filteredProducts.filter(isProductSubmission)} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No products found matching your criteria
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">PVA %</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                            {renderBrandVerification(product)}
                          </TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell className="text-right">
                            {renderPvaValue(product)}
                          </TableCell>
                          <TableCell>
                            {renderBrandButtons(product)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No products matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls totalItems={filteredProducts.length} />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Verify Brand Ownership</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>
                  Submit a request to verify that you represent {selectedProduct.brand}. 
                  Our administrators will review your request.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact-email" className="text-right">
                Business Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="your@company.com"
                className="col-span-3"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            
            <div className="col-span-4 text-sm text-muted-foreground">
              <p>Please use an email address associated with your brand's domain for faster verification.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBrandOwnershipRequest}>
              Submit Verification Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabasePage;
