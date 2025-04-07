
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
import { ImageIcon, Upload } from "lucide-react";

interface ProductImage {
  id: string;
  product_id: string;
  brand_name: string;
  image_url: string;
  status: string;
  created_at: string;
}

interface ProductGalleryProps {
  productImages: ProductImage[];
  products: ProductSubmission[];
  brandName: string;
  isAuthenticated: boolean;
}

const ProductGallery = ({ 
  productImages, 
  products, 
  brandName,
  isAuthenticated 
}: ProductGalleryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Gallery</CardTitle>
        <CardDescription>
          Images of products uploaded by our community
        </CardDescription>
      </CardHeader>
      <CardContent>
        {productImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productImages.map((image) => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.image_url}
                  alt={`${brandName} product`}
                  className="h-40 w-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end rounded-md">
                  <div className="p-2 w-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-sm font-medium truncate">
                      {products.find(p => p.id === image.product_id)?.name || 'Product'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
              <p>No images available for this brand</p>
              
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  asChild
                >
                  <Link to="/contribute">
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Product Images
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductGallery;
