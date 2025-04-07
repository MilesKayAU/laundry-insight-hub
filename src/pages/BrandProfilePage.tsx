import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { 
  normalizeBrandName, 
  decodeBrandNameFromUrl,
  normalizeForDatabaseComparison,
  createCaseInsensitiveQuery
} from "@/lib/utils";

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
  const { brandName: encodedBrandName } = useParams<{ brandName: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  
  useEffect(() => {
    if (!encodedBrandName) return;
    
    const brandName = decodeBrandNameFromUrl(encodedBrandName);
    const brandNameLowercase = normalizeForDatabaseComparison(brandName);
    
    if (brandName !== encodedBrandName && brandName) {
      console.log(`Redirecting from "${encodedBrandName}" to "${brandName}"`);
      navigate(`/brand/${encodeURIComponent(brandName)}`, { replace: true });
      return;
    }
    
    const fetchBrandData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching data for brand: "${brandName}"`);
        console.log(`Brand name lowercase for comparison: "${brandNameLowercase}"`);
        console.log(`URL parameter was: "${encodedBrandName}"`);
        
        const { data: profileData, error: profileError } = await supabase
          .from('brand_profiles')
          .select('*')
          .or(`name.eq.${brandName},name.ilike.${brandNameLowercase}`)
          .limit(1)
          .single();
        
        if (profileError) {
          console.error('Error fetching brand profile:', profileError);
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
          console.log('Brand profile found:', profileData);
          setBrandProfile(profileData);
        }
        
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .or(`brand_name.eq.${brandName},brand_name.ilike.${brandNameLowercase}`)
          .eq('status', 'approved');
        
        if (imageError) {
          console.error('Error fetching product images:', imageError);
        } else {
          console.log(`Found ${imageData?.length || 0} product images`);
          setProductImages(imageData || []);
        }
        
        console.log('Querying Supabase for products with brand name (multiple approaches):', brandName);
        
        const { data: productData, error: productError } = await supabase
          .from('product_submissions')
          .select('*')
          .or(`brand.eq.${brandName},brand.ilike.${brandNameLowercase}`)
          .eq('approved', true);
          
        if (productError) {
          console.error('Error fetching products from Supabase:', productError);
          toast({
            title: "Database Error",
            description: "Could not fetch product data from the database.",
            variant: "destructive"
          });
        } else {
          console.log(`Found ${productData?.length || 0} products in Supabase`);
          console.log('Raw product data:', productData);
          
          const transformedProducts: ProductSubmission[] = productData?.map(item => {
            console.log(`Product ${item.name} website URL:`, item.websiteurl || 'No URL provided');
            
            return {
              id: item.id,
              name: item.name,
              brand: item.brand ? item.brand.trim() : '',
              type: item.type,
              description: item.description || '',
              pvaStatus: mapPvaStatus(item.pvastatus || 'needs-verification'),
              pvaPercentage: item.pvapercentage,
              approved: true,
              country: item.country || 'Global',
              websiteUrl: item.websiteurl || '',
              videoUrl: item.videourl || '',
              imageUrl: item.imageurl || '',
              ingredients: item.ingredients || '',
              brandVerified: false,
              timestamp: Date.now()
            };
          }) || [];
          
          const allLocalProducts = getProductSubmissions();
          const brandLocalProducts = allLocalProducts.filter(product => {
            const productBrand = normalizeForDatabaseComparison(product.brand);
            const searchBrand = brandNameLowercase;
            
            return (
              productBrand.includes(searchBrand) || 
              searchBrand.includes(productBrand)
            ) && product.approved;
          });
          
          console.log(`Found ${brandLocalProducts.length} products in local storage`);
          
          const combinedProducts: ProductSubmission[] = [...transformedProducts];
          
          brandLocalProducts.forEach(localProduct => {
            if (!combinedProducts.some(p => p.id === localProduct.id)) {
              combinedProducts.push(localProduct);
            }
          });
          
          console.log(`Total combined products: ${combinedProducts.length}`);
          setProducts(combinedProducts);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching brand data:', error);
        toast({
          title: "Error loading brand data",
          description: "There was a problem loading the brand information. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchBrandData();
  }, [encodedBrandName, toast, navigate]);

  const mapPvaStatus = (status: string): ProductSubmission['pvaStatus'] => {
    switch (status.toLowerCase()) {
      case 'contains':
        return 'contains';
      case 'verified-free':
        return 'verified-free';
      case 'inconclusive':
        return 'inconclusive';
      default:
        return 'needs-verification';
    }
  };

  const openProductDetail = (product: ProductSubmission) => {
    console.log('Opening product detail:', product);
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
          {products.length > 0 ? (
            <ProductsList 
              products={products}
              onOpenProductDetail={openProductDetail}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-white rounded-md shadow p-6">
              <p>No products found for {brandProfile.name}</p>
              <p className="mt-2 text-sm">Please check back later or contribute data about this brand.</p>
              <Link to="/contribute" className="mt-4 inline-block">
                <button className="bg-primary text-white px-4 py-2 mt-2 rounded text-sm">
                  Contribute Product Data
                </button>
              </Link>
            </div>
          )}
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
