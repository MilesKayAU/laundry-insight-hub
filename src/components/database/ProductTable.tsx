
import React from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Shield, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSubmission } from "@/lib/textExtractor";
import { 
  PvaStatusBadge, 
  PvaPercentageDisplay, 
  BrandVerificationBadge,
  isProductSubmission 
} from "./ProductStatusBadges";

interface ProductTableProps {
  products: any[];
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: () => void;
  onOwnershipRequest: (product: ProductSubmission) => void;
  onPvaUpdateClick: (brand: string, product: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  sortDirection, 
  toggleSortDirection,
  onOwnershipRequest,
  onPvaUpdateClick
}) => {

  const renderActionButtons = (product: any) => {
    const buttons = [];
    
    if (isProductSubmission(product) && !product.brandVerified && !product.brandOwnershipRequested) {
      buttons.push(
        <Button
          key="brand-ownership"
          variant="outline"
          size="sm"
          className="ml-2 text-xs"
          onClick={() => onOwnershipRequest(product as ProductSubmission)}
        >
          <Shield className="h-3 w-3 mr-1" />
          Own this brand?
        </Button>
      );
    }
    
    const hasPvaPercentage = isProductSubmission(product) 
      ? !!product.pvaPercentage 
      : product.pvaPercentage !== null && product.pvaPercentage !== undefined;
      
    if (!hasPvaPercentage || product.pvaPercentage === 'Unknown') {
      buttons.push(
        <Button
          key="pva-update"
          variant="outline"
          size="sm"
          className={buttons.length > 0 ? "ml-2 text-xs" : "text-xs"}
          onClick={() => onPvaUpdateClick(product.brand, product.name)}
        >
          <Percent className="h-3 w-3 mr-1" />
          Submit PVA %
        </Button>
      );
    }
    
    return buttons.length > 0 ? <div className="flex flex-wrap gap-2">{buttons}</div> : null;
  };

  return (
    <div className="rounded-md border">
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
            <TableHead className="text-right">PVA %</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Link 
                    to={`/brand/${product.brand}`}
                    className="text-blue-600 hover:underline hover:text-blue-800 text-[115%] font-medium"
                  >
                    {product.brand}
                  </Link>
                  <BrandVerificationBadge product={product} />
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                </TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell><PvaStatusBadge product={product} /></TableCell>
                <TableCell className="text-right">
                  <PvaPercentageDisplay product={product} />
                </TableCell>
                <TableCell>
                  {renderActionButtons(product)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No products matching your search criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
