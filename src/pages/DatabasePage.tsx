
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
  ResponsiveContainer 
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

const DatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  
  // Filter products - only show approved products and filter by search term
  const filteredProducts = mockProducts.filter(product => 
    product.approved && 
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Separate products by type
  const sheetProducts = filteredProducts.filter(p => p.type === "Laundry Sheet");
  const podProducts = filteredProducts.filter(p => p.type === "Laundry Pod");
  
  // Calculate pagination for each tab
  const paginateData = (data: typeof filteredProducts) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };
  
  const paginatedSheets = paginateData(sheetProducts);
  const paginatedPods = paginateData(podProducts);
  const paginatedAll = paginateData(filteredProducts);
  
  // Calculate total pages for current tab
  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Prepare data for charts
  const sheetChartData = sheetProducts
    .filter(p => p.pvaPercentage !== null)
    .map(p => ({
      name: p.name,
      PVA: p.pvaPercentage
    }));
  
  const podChartData = podProducts
    .filter(p => p.pvaPercentage !== null)
    .map(p => ({
      name: p.name,
      PVA: p.pvaPercentage
    }));

  // Pagination component
  const PaginationControls = ({ totalItems }: { totalItems: number }) => {
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
            setCurrentPage(1); // Reset to first page on search
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
          </TabsList>
        </div>
        
        {/* Laundry Sheets Tab */}
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
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="PVA" 
                        fill="#3cca85" 
                        name="PVA Content (%)" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
                              {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'N/A'}
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
        
        {/* Laundry Pods Tab */}
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
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="PVA" 
                        fill="#4799ff" 
                        name="PVA Content (%)" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
                              {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'N/A'}
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
        
        {/* All Products Tab */}
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
                            {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'N/A'}
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
              <PaginationControls totalItems={filteredProducts.length} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabasePage;
