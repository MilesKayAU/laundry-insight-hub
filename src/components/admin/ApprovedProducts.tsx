
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Trash, Search, Upload, Eraser, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ProductSubmission } from "@/lib/textExtractor";
import DataCharts from "@/components/DataCharts";

interface ApprovedProductsProps {
  products: ProductSubmission[];
  filteredProducts: ProductSubmission[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onViewDetails: (product: ProductSubmission) => void;
  onDelete: (productId: string) => void;
  onBulkUpload: () => void;
  showCleanupDialog: boolean;
  setShowCleanupDialog: (show: boolean) => void;
  onCleanDuplicates: () => void;
}

const ApprovedProducts: React.FC<ApprovedProductsProps> = ({
  products,
  filteredProducts,
  searchTerm,
  onSearchChange,
  onViewDetails,
  onDelete,
  onBulkUpload,
  showCleanupDialog,
  setShowCleanupDialog,
  onCleanDuplicates
}) => {
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const brandA = a.brand.toLowerCase();
    const brandB = b.brand.toLowerCase();
    
    if (sortDirection === 'asc') {
      return brandA.localeCompare(brandB);
    } else {
      return brandB.localeCompare(brandA);
    }
  });
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Approved Products</CardTitle>
            <CardDescription>
              All products that have been approved and are displayed in the database
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Button 
              onClick={onBulkUpload}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  title="Remove duplicate products"
                >
                  <Eraser className="h-4 w-4" />
                  Clean Duplicates
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clean Duplicate Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will scan the database and remove any duplicate products, keeping only the most recently added version of each product. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onCleanDuplicates}>
                    Clean Duplicates
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.length > 0 ? (
          <>
            <DataCharts products={products} />
            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button 
                        onClick={toggleSortDirection} 
                        className="flex items-center focus:outline-none hover:text-blue-600 transition-colors"
                      >
                        Brand
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>PVA Status</TableHead>
                    <TableHead>PVA %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-[115%] font-medium">
                        {product.brand}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>
                        {product.pvaStatus === 'contains' && (
                          <Badge variant="destructive">Contains PVA</Badge>
                        )}
                        {product.pvaStatus === 'verified-free' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Verified Free</Badge>
                        )}
                        {product.pvaStatus === 'needs-verification' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Needs Verification</Badge>
                        )}
                        {product.pvaStatus === 'inconclusive' && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">Inconclusive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.pvaPercentage ? `${product.pvaPercentage}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onViewDetails(product)}
                            title="Edit Details"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onDelete(product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No approved products in the database
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovedProducts;
