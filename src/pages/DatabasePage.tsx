
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LabelList,
  TooltipProps
} from "recharts";
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
  BarChart as BarChartIcon
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

interface ChartDataItem {
  name: string;
  PVA: number | null;
  brand: string;
  pvaMissing?: string;
  productId: string;
}

const DatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPvaStatus, setFilterPvaStatus] = useState<string>("all");
  const [chartView, setChartView] = useState(true);
  const itemsPerPage = 10; // Increased items per page
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const allSubmissions = getProductSubmissions();
  
  const approvedProducts = mockProducts.filter(product => product.approved);
  const approvedSubmissions = allSubmissions.filter(submission => submission.approved);
  
  const combinedApprovedProducts = [...approvedProducts, ...approvedSubmissions];
  
  // Apply filters
  const filteredProducts = combinedApprovedProducts.filter(product => {
    // Search filter
    const matchesSearch = 
      searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = 
      filterType === "all" || 
      product.type === filterType;
    
    // PVA status filter
    const matchesPvaStatus = 
      filterPvaStatus === "all" || 
      (filterPvaStatus === "contains" && product.pvaPercentage !== null && product.pvaPercentage > 0) ||
      (filterPvaStatus === "free" && product.pvaPercentage === 0) ||
      (filterPvaStatus === "unknown" && product.pvaPercentage === null);
    
    return matchesSearch && matchesType && matchesPvaStatus;
  });
  
  // Get unique product types for filter
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
  
  // All products combined for the chart view
  const chartData: ChartDataItem[] = filteredProducts.map(p => ({
    name: p.name,
    PVA: p.pvaPercentage,
    brand: p.brand,
    pvaMissing: p.pvaPercentage === null ? "?" : "",
    productId: p.id
  }));

  // Sort chart data by PVA percentage (with nulls at the end)
  chartData.sort((a, b) => {
    if (a.PVA === null && b.PVA === null) return 0;
    if (a.PVA === null) return 1;
    if (b.PVA === null) return -1;
    return a.PVA - b.PVA;
  });

  // Limit chart data to prevent overcrowding (show top 25)
  const limitedChartData = chartData.slice(0, 25);

  const knownValueColor = "#3cca85";
  const podKnownValueColor = "#4799ff";
  const unknownValueColor = "#8E9196"; // Gray color for unknown values

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

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload as ChartDataItem;
      
      return (
        <div className="p-3 bg-white border border-gray-200 rounded shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">{dataItem.brand}</p>
          <p>
            {dataItem.PVA === null ? (
              <span className="text-gray-600">PVA: Unknown - Waiting on verification</span>
            ) : (
              <span>PVA: {dataItem.PVA}%</span>
            )}
          </p>
        </div>
      );
    }
    return null;
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
    if (product.brandVerified || product.brandOwnershipRequested) {
      return null;
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        className="ml-2 text-xs"
        onClick={() => {
          setSelectedProduct(product);
          setIsDialogOpen(true);
        }}
      >
        <Shield className="h-3 w-3 mr-1" />
        Own this brand?
      </Button>
    );
  };

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
              <CardTitle>PVA Content Database</CardTitle>
              <CardDescription>
                Search, filter and explore products to find PVA content information
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
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
            {/* Search and filter controls */}
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
          
          {/* Conditional rendering based on view selection */}
          {chartView ? (
            <div>
              {/* Chart view */}
              {limitedChartData.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={limitedChartData}
                      margin={{ top: 20, right: 30, left: 30, bottom: 100 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number"
                        label={{ value: 'PVA Content (%)', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="PVA" 
                        name="PVA Content (%)" 
                        barSize={20}
                      >
                        {limitedChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.PVA === null ? unknownValueColor : 
                                  (entry.productId in podKnownValueColor ? podKnownValueColor : knownValueColor)}
                            // For unknown values, display at 20% for visual representation
                            value={entry.PVA === null ? 20 : entry.PVA}
                          />
                        ))}
                        <LabelList 
                          dataKey="pvaMissing"
                          position="right"
                        />
                        <LabelList 
                          dataKey="PVA"
                          position="right"
                          formatter={(value) => value === null ? "Unknown" : `${value}%`}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-gray-500 italic mt-2 text-center">
                    ? = Unknown PVA content (displayed at 20% as reference), awaiting verification from suppliers
                  </div>
                  {filteredProducts.length > limitedChartData.length && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Showing top 25 products. Use table view to see all {filteredProducts.length} products.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No products matching your search criteria
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Table view */}
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
