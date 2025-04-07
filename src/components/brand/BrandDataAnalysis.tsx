
import { Link } from "react-router-dom";
import { ProductSubmission } from "@/lib/textExtractor";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";

interface BrandDataAnalysisProps {
  products: ProductSubmission[];
  brandName: string;
}

const BrandDataAnalysis = ({ products, brandName }: BrandDataAnalysisProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PVA Data Analysis</CardTitle>
        <CardDescription>
          Statistical overview of PVA content in {brandName} products
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average PVA Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const productsWithPva = products.filter(p => p.pvaPercentage !== null);
                      if (productsWithPva.length === 0) return 'Unknown';
                      
                      const avg = productsWithPva.reduce((sum, p) => sum + (p.pvaPercentage || 0), 0) / productsWithPva.length;
                      return `${avg.toFixed(2)}%`;
                    })()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    PVA-Free Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.pvaStatus === 'verified-free').length}
                    <span className="text-sm text-muted-foreground ml-1">
                      / {products.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Product Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(products.map(p => p.type)).size}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to="/database">
                  <BarChart className="h-4 w-4 mr-2" />
                  View Complete Data Analysis
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No data available for this brand
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandDataAnalysis;
