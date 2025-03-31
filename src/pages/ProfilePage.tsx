
import { useEffect, useState } from "react";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Image as ImageIcon, Upload, Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductSubmissions, ProductSubmission } from "@/lib/textExtractor";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }
        
        // Get product submissions from local storage
        const allSubmissions = getProductSubmissions();
        // Filter submissions by user ID if that information is stored
        // For now, we'll just show all approved submissions since local storage
        // might not track which user submitted what
        const userSubmissions = allSubmissions.filter(
          submission => submission.approved
        );
        setSubmissions(userSubmissions);
        
        // Fetch uploaded images
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('uploaded_by', user.id);
          
        if (imageError) {
          console.error('Error fetching uploaded images:', imageError);
        } else {
          setUploadedImages(imageData || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/auth">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Track your contributions and manage your PVA database submissions
          </p>
        </div>
        
        <Button asChild>
          <Link to="/contribute">
            <Upload className="h-4 w-4 mr-2" />
            Submit New Product
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>{profile?.username || user.email?.split('@')[0]}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p>{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Your Contribution Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground text-sm">Product Submissions</p>
                <p className="text-3xl font-bold">{submissions.length}</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground text-sm">Uploaded Images</p>
                <p className="text-3xl font-bold">{uploadedImages.length}</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground text-sm">PVA-Free Finds</p>
                <p className="text-3xl font-bold">
                  {submissions.filter(s => s.pvaStatus === 'verified-free').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-8" />
      
      <Tabs defaultValue="submissions">
        <TabsList className="mb-6">
          <TabsTrigger value="submissions">Your Submissions</TabsTrigger>
          <TabsTrigger value="images">Uploaded Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Product Submissions</CardTitle>
              <CardDescription>
                Products you've contributed to the PVA database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>PVA Status</TableHead>
                        <TableHead>PVA %</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.name}</TableCell>
                          <TableCell>{submission.brand}</TableCell>
                          <TableCell>
                            {submission.pvaStatus === 'contains' && (
                              <Badge variant="destructive">Contains PVA</Badge>
                            )}
                            {submission.pvaStatus === 'verified-free' && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">Verified Free</Badge>
                            )}
                            {submission.pvaStatus === 'needs-verification' && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Needs Verification</Badge>
                            )}
                            {submission.pvaStatus === 'inconclusive' && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">Inconclusive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.pvaPercentage !== null ? `${submission.pvaPercentage}%` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                asChild
                              >
                                <Link to={`/update-pva/${submission.brand}/${submission.name}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                asChild
                              >
                                <Link to={`/brand/${submission.brand}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p>You haven't submitted any products yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <Link to="/contribute">
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Your First Product
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Images</CardTitle>
              <CardDescription>
                Product images you've contributed to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img 
                        src={image.image_url}
                        alt="Product"
                        className="h-40 w-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end rounded-md">
                        <div className="p-2 w-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="text-sm font-medium truncate">
                            {image.brand_name || 'Brand'}
                          </p>
                          <Badge className="mt-1" variant={image.status === 'approved' ? 'outline' : 'secondary'}>
                            {image.status === 'approved' ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                    <p>You haven't uploaded any product images yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <Link to="/contribute">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Product Images
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
