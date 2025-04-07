
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
  createCaseInsensitiveQuery,
  normalizeBrandSlug,
  logProductUrlInfo,
  normalizeProductFieldNames
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
  const [loadingSource, setLoadingSource] = useState<string>("initial");
  
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  
  useEffect(() => {
    if (!encodedBrandName) return;
    
    const brandName = decodeBrandNameFromUrl(encodedBrandName);
    const normalizedBrandSlug = normalizeBrandSlug(brandName);
    const brandNameLowercase = normalizeForDatabaseComparison(brandName);
    
    console.log("Brand Profile Page - Request Information:");
    console.log(`- Requested Brand Slug: "${encodedBrandName}"`);
    console.log(`- Decoded Brand Name: "${brandName}"`);
    console.log(`- Normalized Brand Slug: "${normalizedBrandSlug}"`);
    console.log(`- Normalized for DB comparison: "${brandNameLowercase}"`);
    
    if (brandName !== encodedBrandName && brandName) {
      console.log(`Redirecting from "${encodedBrandName}" to "${brandName}"`);
      navigate(`/brand/${encodeURIComponent(brandName)}`, { replace: true });
      return;
    }
    
    const fetchBrandData = async () => {
      setLoading(true);
      setLoadingSource("fetchBrandData");
      try {
        console.log(`Fetching data for brand: "${brandName}"`);
        
        // First, fetch the brand profile using ilike for case-insensitive comparison
        const { data: profileData, error: profileError } = await supabase
          .from('brand_profiles')
          .select('*')
          .ilike('name', brandName)
          .limit(1)
          .single();
        
        if (profileError) {
          console.error('Error fetching brand profile:', profileError);
          
          // Create a placeholder profile since the brand doesn't exist in the database
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
        
        // Fetch product images using ilike for case-insensitive comparison
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .ilike('brand_name', brandName)
          .eq('status', 'approved');
        
        if (imageError) {
          console.error('Error fetching product images:', imageError);
        } else {
          console.log(`Found ${imageData?.length || 0} product images`);
          setProductImages(imageData || []);
        }
        
        console.log('Querying Supabase for products with brand name:', brandName);
        
        // IMPROVED: Use proper column aliasing and explicitly include all necessary fields
        const { data: productData, error: productError } = await supabase
          .from('product_submissions')
          .select(`
            id,
            name,
            brand,
            type,
            description,
            pvastatus,
            pvapercentage,
            approved,
            country,
            websiteurl,
            videourl,
            imageurl,
            ingredients,
            owner_id,
            createdat,
            updatedat
          `)
          .ilike('brand', brandName)
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
          console.log('Raw product data from Supabase:', productData);
          
          if (productData && productData.length > 0) {
            // Transform the data to match ProductSubmission type using normalizeProductFieldNames
            const normalizedProducts = productData.map(product => normalizeProductFieldNames(product));
            console.log('Normalized products:', normalizedProducts);
            setProducts(normalizedProducts);
          }
          
          // Try a more flexible query with just the brand name (without approved filter) as a fallback
          if (!productData || productData.length === 0) {
            console.log('Trying secondary query without approved filter...');
            const { data: allProductData, error: allProductError } = await supabase
              .from('product_submissions')
              .select(`
                id,
                name,
                brand,
                type,
                description,
                pvastatus,
                pvapercentage,
                approved,
                country,
                websiteurl,
                videourl,
                imageurl,
                ingredients,
                owner_id,
                createdat,
                updatedat
              `)
              .ilike('brand', brandName);
              
            if (allProductError) {
              console.error('Error in secondary product query:', allProductError);
            } else {
              console.log(`Secondary query found ${allProductData?.length || 0} total products (including unapproved)`);
              
              // Only use these products if we don't have any from the previous query
              if (allProductData && allProductData.length > 0 && (!productData || productData.length === 0)) {
                console.log('Using secondary query results as fallback');
                const approvedProducts = allProductData.filter(p => p.approved);
                if (approvedProducts.length > 0) {
                  // Transform the data to match ProductSubmission type
                  const normalizedProducts = approvedProducts.map(product => normalizeProductFieldNames(product));
                  console.log('Normalized products from secondary query:', normalizedProducts);
                  setProducts(normalizedProducts);
                }
              }
            }
          }
          
          // Get products from local storage as a LAST resort fallback
          if (products.length === 0) {
            console.log('No products found in Supabase, checking local storage');
            const allLocalProducts = getProductSubmissions();
            console.log(`Got ${allLocalProducts.length} total products from local storage`);
            
            // Filter local products by brand name using case-insensitive comparison
            const brandLocalProducts = allLocalProducts.filter(product => {
              const productBrand = normalizeForDatabaseComparison(product.brand);
              const searchBrand = brandNameLowercase;
              
              const isMatch = (
                productBrand.includes(searchBrand) || 
                searchBrand.includes(productBrand)
              ) && product.approved;
              
              if (isMatch) {
                logProductUrlInfo(product, `Local product match: ${product.name}`);
              }
              
              return isMatch;
            });
            
            console.log(`Found ${brandLocalProducts.length} products in local storage for brand "${brandName}"`);
            
            if (brandLocalProducts.length) {
              console.log('Using local storage products as fallback');
              setProducts(brandLocalProducts);
            }
          }
        }
        
        // ADDED: Perform a final diagnostic direct query using exact match on brand name
        if (products.length === 0) {
          console.log(`Attempting direct exact match query for "${brandName}" products...`);
          const { data: exactMatchData, error: exactMatchError } = await supabase
            .from('product_submissions')
            .select(`
              id,
              name,
              brand,
              type,
              description,
              pvastatus,
              pvapercentage,
              approved,
              country,
              websiteurl,
              videourl,
              imageurl,
              ingredients,
              owner_id,
              createdat,
              updatedat
            `)
            .eq('brand', brandName);
            
          if (exactMatchError) {
            console.error('Error in exact match query:', exactMatchError);
          } else {
            console.log(`Exact match query found ${exactMatchData?.length || 0} products`);
            if (exactMatchData && exactMatchData.length > 0) {
              console.log('Exact match products:', exactMatchData);
              
              // Transform the data to match ProductSubmission type
              const normalizedProducts = exactMatchData.map(product => normalizeProductFieldNames(product));
              console.log('Normalized exact match products:', normalizedProducts);
              setProducts(normalizedProducts);
            }
          }
        }

        // ADDED: Final case-insensitive check with different method
        if (products.length === 0) {
          console.log(`Attempting case-insensitive function query for "${brandName}"...`);
          const { data: lowerData, error: lowerError } = await supabase
            .from('product_submissions')
            .select('*')
            .filter('brand', 'ilike', `%${brandName}%`);
            
          if (lowerError) {
            console.error('Error in case-insensitive filter query:', lowerError);
          } else {
            console.log(`Case-insensitive filter found ${lowerData?.length || 0} products`);
            if (lowerData && lowerData.length > 0) {
              console.log('Case-insensitive products:', lowerData);
              
              // Transform the data to match ProductSubmission type
              const normalizedProducts = lowerData.map(product => normalizeProductFieldNames(product));
              console.log('Normalized case-insensitive products:', normalizedProducts);
              setProducts(normalizedProducts);
            }
          }
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

  const openProductDetail = (product: ProductSubmission) => {
    console.log('Opening product detail:', product);
    logProductUrlInfo(product, 'Opening detail for');
    setSelectedProduct(product);
    setProductDetailOpen(true);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading brand information... ({loadingSource})</p>
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
          {products && products.length > 0 ? (
            <ProductsList 
              products={products}
              onOpenProductDetail={openProductDetail}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-white rounded-md shadow p-6">
              <p>No products found for {brandProfile.name}</p>
              <p className="mt-2 text-sm">
                Please check back later or contribute data about this brand.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                (Brand slug: {encodedBrandName})
              </div>
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
