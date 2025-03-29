
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
import { mockProducts } from "@/lib/mockData";
import { getProductSubmissions } from "@/lib/textExtractor";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface ChartDataItem {
  name: string;
  PVA: number;
  isUnknown: boolean;
}

const DatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const { isAuthenticated } = useAuth();
  
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
  
  // Updated to properly handle unknown values with a default 25% for visualization
  const sheetChartData: ChartDataItem[] = sheetProducts.map(p => ({
    name: p.name,
    PVA: p.pvaPercentage !== null ? p.pvaPercentage : 25,
    isUnknown: p.pvaPercentage === null
  }));
  
  // Updated to properly handle unknown values with a default 25% for visualization
  const podChartData: ChartDataItem[] = podProducts.map(p => ({
    name: p.name,
    PVA: p.pvaPercentage !== null ? p.pvaPercentage : 25,
    isUnknown: p.pvaPercentage === null
  }));

  // Colors for chart bars
  const knownValueColor = "#3cca85";
  const podKnownValueColor = "#4799ff";
  const unknownValueColor = "#8E9196"; // Gray color for unknown values

  // Custom tooltip component with proper typing
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload as ChartDataItem;
      
      return (
        <div className="p-2 bg-white border border-gray-200 rounded shadow-md">
          <p className="font-medium">{label}</p>
          <p>
            {dataItem.isUnknown ? (
              <span className="text-gray-600">PVA: Unknown (Awaiting Verification)</span>
            ) : (
              <span>PVA: {payload[0].value}%</span>
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
    if (product.pvaPercentage !== null) {
      return `${product.pvaPercentage}%`;
    } else {
      return (
        <span className="flex items-center gap-1">
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Unknown (Awaiting Verification)
          </Badge>
        </span>
      );
    }
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
                            fill={entry.isUnknown ? unknownValueColor : knownValueColor} 
                          />
                        ))}
                        <LabelList 
                          dataKey="isUnknown" 
                          position="top" 
                          formatter={(value) => value ? "*" : ""}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {sheetChartData.some(item => item.isUnknown) && (
                    <div className="text-xs text-gray-500 italic mt-2">
                      * Unknown value, set to 25% for visualization purposes. Awaiting verification.
                    </div>
                  )}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSheets.length > 0 ? (
                        paginatedSheets.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell className="text-right">
                              {renderPvaValue(product)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
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
                            fill={entry.isUnknown ? unknownValueColor : podKnownValueColor} 
                          />
                        ))}
                        <LabelList 
                          dataKey="isUnknown" 
                          position="top" 
                          formatter={(value) => value ? "*" : ""}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {podChartData.some(item => item.isUnknown) && (
                    <div className="text-xs text-gray-500 italic mt-2">
                      * Unknown value, set to 25% for visualization purposes. Awaiting verification.
                    </div>
                  )}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPods.length > 0 ? (
                        paginatedPods.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell className="text-right">
                              {renderPvaValue(product)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAll.length > 0 ? (
                      paginatedAll.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell className="text-right">
                            {renderPvaValue(product)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
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
    </div>
  );
};

export default DatabasePage;
