
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BadgeCheck, 
  Mail, 
  ExternalLink, 
  Image as ImageIcon,
  Upload,
  BarChart
} from "lucide-react";
import { 
  getProductSubmissions, 
  ProductSubmission 
} from "@/lib/textExtractor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: "",
    company: "",
    message: ""
  });
  
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
  
  const handleContactSubmit = async () => {
    if (!brandProfile?.id) {
      toast({
        title: "Cannot send message",
        description: "This brand hasn't been verified in our system yet.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contactForm.email || !contactForm.email.includes('@') || !contactForm.company || !contactForm.message) {
      toast({
        title: "Invalid form",
        description: "Please fill in all fields with valid information.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if email domain matches brand domain
    const emailDomain = contactForm.email.split('@')[1];
    let brandDomainMatch = false;
    
    if (brandProfile.website) {
      const brandDomain = brandProfile.website.replace('http://', '').replace('https://', '').split('/')[0];
      brandDomainMatch = emailDomain.includes(brandDomain) || brandDomain.includes(emailDomain);
    }
    
    try {
      const { data, error } = await supabase
        .from('brand_messages')
        .insert({
          brand_id: brandProfile.id,
          sender_email: contactForm.email,
          company_name: contactForm.company,
          message: contactForm.message
        });
      
      if (error) throw error;
      
      toast({
        title: "Message sent",
        description: brandDomainMatch 
          ? "Your message has been sent and will be reviewed by our team."
          : "Your message has been sent but may require extra verification as your email domain doesn't match the brand domain.",
      });
      
      setContactDialogOpen(false);
      setContactForm({
        email: "",
        company: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending brand message:', error);
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive"
      });
    }
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
          <Button asChild className="mt-4">
            <Link to="/database">Return to Database</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{brandProfile.name}</h1>
            {brandProfile.verified && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <BadgeCheck className="h-4 w-4 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {brandProfile.description || `View product information for ${brandProfile.name}`}
          </p>
        </div>
        
        <div className="flex gap-2">
          {brandProfile.website && (
            <Button variant="outline" asChild size="sm">
              <a 
                href={brandProfile.website} 
                target="_blank" 
                rel="nofollow noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </a>
            </Button>
          )}
          
          <Button 
            onClick={() => setContactDialogOpen(true)}
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Brand
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="gallery">Product Gallery</TabsTrigger>
          <TabsTrigger value="data">PVA Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products by {brandProfile.name}</CardTitle>
              <CardDescription>
                All products from this brand in our database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>PVA Status</TableHead>
                        <TableHead>PVA %</TableHead>
                        <TableHead>Country</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
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
                            {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'Unknown'}
                          </TableCell>
                          <TableCell>{product.country || 'Global'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No products available for this brand
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery">
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
                        alt={`${brandProfile.name} product`}
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
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>PVA Data Analysis</CardTitle>
              <CardDescription>
                Statistical overview of PVA content in {brandProfile.name} products
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
        </TabsContent>
      </Tabs>
      
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {brandProfile.name}</DialogTitle>
            <DialogDescription>
              As a brand representative, you can send a message to our administrators.
              Please use your company email that matches your brand's domain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-email" className="text-right">
                Company Email
              </Label>
              <Input
                id="company-email"
                type="email"
                placeholder="your@company.com"
                className="col-span-3"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-name" className="text-right">
                Company Name
              </Label>
              <Input
                id="company-name"
                placeholder="Your Company Ltd."
                className="col-span-3"
                value={contactForm.company}
                onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Please describe your relationship to this brand and any information you'd like to provide or update..."
                className="col-span-3"
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              />
            </div>
            
            <div className="col-span-4 text-sm text-muted-foreground text-center">
              <p>Using an email that matches your brand's domain will help us verify your identity faster.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContactSubmit}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandProfilePage;
