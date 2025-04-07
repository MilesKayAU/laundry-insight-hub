
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getProductSubmissions, 
  ProductSubmission 
} from "@/lib/textExtractor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrandHeader,
  ProductsList,
  ProductGallery,
  BrandDataAnalysis,
  ProductDetailDialog,
  ContactBrandDialog
} from "@/components/brand";

interface BrandProfile {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  brand_name: string;
  image_url: string;
  status: string;
  created_at: string;
}

const BrandProfilePage = () => {
  const { brandName } = useParams<{ brandName: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for dialogs
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  
  useEffect(() => {
    if (!brandName) return;
    
    const fetchBrandData = async () => {
      setLoading(true);
      try {
        // Fetch brand profile from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('name', brandName)
          .single();
        
        if (profileError) {
          // If brand doesn't exist in database yet, create a placeholder
          console.log('Brand not found in database, creating placeholder');
          setBrandProfile({
            id: '',
            name: brandName || '',
            description: null,
            website: null,
            contact_email: null,
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          setBrandProfile(profileData);
        }
        
        // Fetch approved product images for this brand
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('brand_name', brandName)
          .eq('status', 'approved');
        
        if (imageError) {
          console.error('Error fetching product images:', imageError);
        } else {
          setProductImages(imageData || []);
        }
        
        // Get product data from local storage
        const allProducts = getProductSubmissions();
        const brandProducts = allProducts.filter(
          product => product.brand.toLowerCase() === brandName?.toLowerCase() && product.approved
        );
        setProducts(brandProducts);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching brand data:', error);
        setLoading(false);
      }
    };
    
    fetchBrandData();
  }, [brandName]);

  const openProductDetail = (product: ProductSubmission) => {
    setSelectedProduct(product);
    setProductDetailOpen(true);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading brand information...</p>
        </div>
      </div>
    );
  }

  if (!brandProfile) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Brand Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The brand you're looking for doesn't exist in our database.
          </p>
          <Link to="/database" className="inline-block mt-4">
            <button className="bg-primary text-white px-4 py-2 rounded">
              Return to Database
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <BrandHeader
        name={brandProfile.name}
        verified={brandProfile.verified}
        description={brandProfile.description}
        website={brandProfile.website}
        onContactClick={() => setContactDialogOpen(true)}
      />
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="gallery">Product Gallery</TabsTrigger>
          <TabsTrigger value="data">PVA Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductsList 
            products={products}
            onOpenProductDetail={openProductDetail}
          />
        </TabsContent>
        
        <TabsContent value="gallery">
          <ProductGallery 
            productImages={productImages}
            products={products}
            brandName={brandProfile.name}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>
        
        <TabsContent value="data">
          <BrandDataAnalysis 
            products={products}
            brandName={brandProfile.name}
          />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <ProductDetailDialog
        product={selectedProduct}
        open={productDetailOpen}
        onOpenChange={setProductDetailOpen}
      />
      
      <ContactBrandDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        brandProfile={brandProfile}
      />
    </div>
  );
};

export default BrandProfilePage;
