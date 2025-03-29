import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockProducts } from "@/lib/mockData";
import { getProductSubmissions, ProductSubmission } from "@/lib/textExtractor";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { requestBrandOwnership } from "@/lib/bulkUpload";
import { useToast } from "@/components/ui/use-toast";
import { VerifiedIcon, Pencil, BadgeCheck, Shield } from "lucide-react";

interface ChartDataItem {
  name: string;
  PVA: number | null;
  brand: string;
}

const DatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const allSubmissions = getProductSubmissions();
  
  const approvedProducts = mockProducts.filter(product => 
    product.approved && 
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const approvedSubmissions = allSubmissions.filter(submission => 
    submission.approved && 
    (submission.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     submission.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const combinedApprovedProducts = [...approvedProducts, ...approvedSubmissions];
  
  const pendingSubmissions = allSubmissions.filter(submission => 
    !submission.approved && 
    (submission.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     submission.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const sheetProducts = combinedApprovedProducts.filter(p => p.type === "Laundry Sheet");
  const podProducts = combinedApprovedProducts.filter(p => p.type === "Laundry Pod");
  
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };
  
  const paginatedSheets = paginateData(sheetProducts);
  const paginatedPods = paginateData(podProducts);
  const paginatedAll = paginateData(combinedApprovedProducts);
  const paginatedPending = paginateData(pendingSubmissions);
  
  const getTotalPages = (totalItems) => {
    return Math.ceil(totalItems / itemsPerPage);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const sheetChartData: ChartDataItem[] = sheetProducts.map(p => ({
    name: p.name,
    PVA: p.pvaPercentage,
    brand: p.brand
  }));
  
  const podChartData: ChartDataItem[] = podProducts.map(p => ({
    name: p.name,
    PVA: p.pvaPercentage,
    brand: p.brand
  }));

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
        <div className="p-2 bg-white border border-gray-200 rounded shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">{dataItem.brand}</p>
          <p>
            {dataItem.PVA === null ? (
              <span className="text-gray-600">PVA: Unknown</span>
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
      
      <div className="mb-6">
        <Input
          placeholder="Search by product or brand name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-md mx-auto"
        />
      </div>
      
      <Tabs defaultValue="sheets" onValueChange={() => setCurrentPage(1)}>
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="sheets">Laundry Sheets</TabsTrigger>
            <TabsTrigger value="pods">Laundry Pods</TabsTrigger>
            <TabsTrigger value="all">All Products</TabsTrigger>
            {pendingSubmissions.length > 0 && (
              <TabsTrigger value="pending" className="relative">
                Pending Submissions
                <Badge variant="default" className="ml-1 bg-amber-500 text-white">
                  {pendingSubmissions.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <TabsContent value="sheets">
          <Card>
            <CardHeader>
              <CardTitle>Laundry Sheets - PVA Content</CardTitle>
              <CardDescription>
                Comparing PVA percentages across different laundry sheet products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sheetChartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sheetChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis 
                        label={{ 
                          value: 'PVA Content (%)', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="PVA" 
                        name="PVA Content (%)" 
                      >
                        {sheetChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.PVA === null ? unknownValueColor : knownValueColor} 
                          />
                        ))}
                        <LabelList 
                          dataKey={(entry: ChartDataItem) => entry.PVA === null ? "?" : ""}
                          position="top"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-gray-500 italic mt-2">
                    ? = Unknown PVA content, awaiting verification
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No laundry sheet data matching your search criteria
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Laundry Sheets Database</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">PVA %</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSheets.length > 0 ? (
                        paginatedSheets.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                              {renderBrandVerification(product)}
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
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
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No laundry sheet data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls totalItems={sheetProducts.length} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pods">
          <Card>
            <CardHeader>
              <CardTitle>Laundry Pods - PVA Content</CardTitle>
              <CardDescription>
                Comparing PVA percentages across different laundry pod products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {podChartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={podChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis 
                        label={{ 
                          value: 'PVA Content (%)', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="PVA" 
                        name="PVA Content (%)" 
                      >
                        {podChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.PVA === null ? unknownValueColor : podKnownValueColor} 
                          />
                        ))}
                        <LabelList 
                          dataKey={(entry: ChartDataItem) => entry.PVA === null ? "?" : ""}
                          position="top"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-gray-500 italic mt-2">
                    ? = Unknown PVA content, awaiting verification
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No laundry pod data matching your search criteria
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Laundry Pods Database</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">PVA %</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPods.length > 0 ? (
                        paginatedPods.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                              {renderBrandVerification(product)}
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
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
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No laundry pod data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls totalItems={podProducts.length} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Products Database</CardTitle>
              <CardDescription>
                Complete list of all products in our database
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    {paginatedAll.length > 0 ? (
                      paginatedAll.map((product) => (
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
              <PaginationControls totalItems={combinedApprovedProducts.length} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>
                Products that have been submitted but are waiting for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">PVA %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPending.length > 0 ? (
                      paginatedPending.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              Pending Review
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {renderPvaValue(product)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No pending submissions matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls totalItems={pendingSubmissions.length} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
