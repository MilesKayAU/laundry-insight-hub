import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Search } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { getProductSubmissions } from "@/lib/textExtractor";
import { useToast } from "@/hooks/use-toast";
import PvaCertificationBadge from "@/components/PvaCertificationBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const fetchPvaFreeProducts = async () => {
  try {
    console.log("PvaFreePage: Fetching from Supabase...");
    
    // Query products from Supabase
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('approved', true)
      .or('pvastatus.eq.verified-free,pvapercentage.eq.0');
    
    if (error) {
      console.error("Error fetching PVA-free products from Supabase:", error);
      return [];
    }
    
    console.info(`PvaFreePage: Fetched ${data?.length || 0} PVA-free products from Supabase`);
    
    if (!data || data.length === 0) {
      console.warn("PvaFreePage: No data returned from Supabase - check RLS policies and API keys");
    }
    
    const transformedProducts = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      type: item.type,
      description: item.description || '',
      pvaStatus: item.pvastatus || 'needs-verification',
      pvaPercentage: item.pvapercentage || null,
      approved: item.approved || false,
      country: item.country || 'Global',
      websiteUrl: item.websiteurl || '',
      videoUrl: item.videourl || '',
      imageUrl: item.imageurl || '',
      brandVerified: false,
      timestamp: Date.now()
    }));
    
    // Make sure we only get approved products from local storage
    const localProducts = getProductSubmissions().filter(
      product => product.approved === true && (
        product.pvaStatus === 'verified-free' || 
        (product.pvaPercentage !== null && product.pvaPercentage === 0)
      )
    );
    
    console.info(`PvaFreePage: Found ${localProducts.length} PVA-free submissions from local storage`);
    
    // Return combined products
    const combinedProducts = [...transformedProducts, ...localProducts];
    console.log("PvaFreePage: Total combined PVA-free products:", combinedProducts.length);
    console.log("PvaFreePage: Product details:", combinedProducts);
    
    return combinedProducts;
  } catch (error) {
    console.error("Exception fetching PVA-free products:", error);
    return [];
  }
};

const PvaFreePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const { data: pvaFreeProducts = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pvaFreeProducts'],
    queryFn: fetchPvaFreeProducts,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    console.log("PVA Free Products loaded:", pvaFreeProducts.length);
    console.log("Products data:", pvaFreeProducts);
    
    // Force refresh of data when the component mounts
    refetch();
    
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from('product_submissions').select('count').limit(1);
        if (error) {
          console.error("Supabase connection check failed:", error);
          toast({
            title: "Database Connection Issue",
            description: "Failed to connect to product database. Check console for details.",
            variant: "destructive"
          });
        } else {
          console.log("Supabase connection check: OK");
        }
      } catch (e) {
        console.error("Error checking Supabase connection:", e);
      }
    };
    
    checkSupabase();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      console.log("Periodic refresh of PVA-free products...");
      refetch();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [refetch, toast]);

  const filteredProducts = pvaFreeProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isProductCertified = (product) => {
    return product.approved && 
           product.pvaStatus === 'verified-free' && 
           (product.type === 'Laundry Sheets' || product.type === 'Laundry Pods' || 
            product.type.toLowerCase().includes('laundry sheet') || 
            product.type.toLowerCase().includes('laundry pod'));
  };

  if (isError) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <p className="text-red-500 font-medium">Error loading product data</p>
          <p className="text-muted-foreground mt-2">{error?.message || "An unknown error occurred"}</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && pvaFreeProducts.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && pvaFreeProducts.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <div className="inline-block bg-green-50 rounded-full px-4 py-2 mb-4">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              0% PVA Products
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">Verified PVA-Free Products</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These products have been verified to contain zero polyvinyl alcohol (PVA).
            Our verification process includes ingredient analysis and manufacturer confirmation.
          </p>
          <div className="mt-4">
            <Link to="/certification" className="text-science-600 hover:text-science-700 underline">
              Learn about our certification program →
            </Link>
          </div>
        </div>
        
        <div className="text-center py-12 bg-muted/50 rounded-lg mb-20">
          <h3 className="text-lg font-medium mb-2">No PVA-free products found</h3>
          <p className="text-muted-foreground mb-4">
            We don't have any verified PVA-free products in our database yet.
            {isAuthenticated && " You're logged in, so you can add products."}
          </p>
          <Button variant="outline" asChild>
            <Link to="/contribute">
              Contribute a product
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <div className="text-center mb-10">
        <div className="inline-block bg-green-50 rounded-full px-4 py-2 mb-4">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            0% PVA Products
          </Badge>
        </div>
        <h1 className="text-4xl font-bold mb-4">Verified PVA-Free Products</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These products have been verified to contain zero polyvinyl alcohol (PVA).
          Our verification process includes ingredient analysis and manufacturer confirmation.
        </p>
        <div className="mt-4">
          <Link to="/certification" className="text-science-600 hover:text-science-700 underline">
            Learn about our certification program →
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for PVA-free products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col h-full relative">
              {isProductCertified(product) && (
                <div className="absolute top-3 right-3 z-10">
                  <PvaCertificationBadge size="sm" />
                </div>
              )}
              
              {product.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn(`Image failed to load for product: ${product.name}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {product.type}
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    0% PVA
                  </Badge>
                </div>
                <CardTitle className="mt-2">{product.name}</CardTitle>
                <CardDescription>{product.brand}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {product.description && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto mb-2 text-muted-foreground">
                        Show details
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {isProductCertified(product) && (
                  <div className="my-2 text-xs text-science-700 italic">
                    This product is PVA-Free Certified. <Link to="/certification" className="underline">Learn more</Link>
                  </div>
                )}
                
                {product.videoUrl && (
                  <div className="my-2">
                    <iframe
                      width="100%"
                      height="180"
                      src={product.videoUrl}
                      title={`${product.name} video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-md"
                    ></iframe>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {product.websiteUrl && (
                  <Button variant="outline" size="sm" className="flex gap-2 items-center" asChild>
                    <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg mb-20">
          <h3 className="text-lg font-medium mb-2">No PVA-free products found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any products matching your search criteria.
          </p>
          {searchTerm ? (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/contribute">
                Contribute a product
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PvaFreePage;
