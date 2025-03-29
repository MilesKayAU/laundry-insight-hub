import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash, 
  Search, 
  Plus, 
  PlusCircle,
  Image,
  Video,
  Link as LinkIcon,
  X,
  Upload,
  BarChart,
  BadgeCheck,
  Shield,
  Eraser,
  AlertTriangle,
  Mail
} from "lucide-react";
import { mockProducts, mockAdminSettings, Product } from "@/lib/mockData";
import { 
  PVA_KEYWORDS_CATEGORIES, 
  getProductSubmissions, 
  ProductSubmission,
  updateProductApproval,
  deleteProductSubmission
} from "@/lib/textExtractor";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import BulkUpload from "@/components/BulkUpload";
import DataCharts from "@/components/DataCharts";
import { 
  isDuplicateProduct, 
  approveBrandOwnership, 
  rejectBrandOwnership,
  cleanDuplicateProducts,
  resetProductDatabase
} from "@/lib/bulkUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const saveProductDetails = (productId: string, details: Partial<ProductSubmission>) => {
  const submissions = getProductSubmissions();
  const updatedSubmissions = submissions.map(submission => 
    submission.id === productId ? { ...submission, ...details } : submission
  );
  localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
};

interface BrandMessage {
  id: string;
  brand_id: string;
  sender_email: string;
  company_name: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

interface BrandProfile {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  verified: boolean;
}

const AdminPage = () => {
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<ProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ProductSubmission[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [bulkUploadMode, setBulkUploadMode] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<ProductSubmission[]>([]);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [brandMessages, setBrandMessages] = useState<BrandMessage[]>([]);
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<BrandMessage | null>(null);
  const [messageResponse, setMessageResponse] = useState("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  
  const [productDetails, setProductDetails] = useState({
    description: "",
    imageUrl: "",
    videoUrl: "",
    websiteUrl: ""
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [keywordCategories, setKeywordCategories] = useState({
    commonNames: [...PVA_KEYWORDS_CATEGORIES.commonNames],
    chemicalSynonyms: [...PVA_KEYWORDS_CATEGORIES.chemicalSynonyms],
    inciTerms: [...PVA_KEYWORDS_CATEGORIES.inciTerms],
    additional: [...PVA_KEYWORDS_CATEGORIES.additional]
  });
  
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("commonNames");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProductSubmissions();
    loadBrandMessages();
    loadBrandProfiles();
  }, []);

  const loadProductSubmissions = () => {
    const submissions = getProductSubmissions();
    setPendingProducts(submissions.filter(p => !p.approved));
    setApprovedProducts(submissions.filter(p => p.approved));
    
    setPendingVerifications(submissions.filter(p => 
      p.approved && p.brandOwnershipRequested && !p.brandVerified
    ));
  };
  
  const loadBrandMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading brand messages:', error);
        return;
      }
      
      setBrandMessages(data || []);
    } catch (error) {
      console.error('Error in loadBrandMessages:', error);
    }
  };
  
  const loadBrandProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading brand profiles:', error);
        return;
      }
      
      setBrandProfiles(data || []);
    } catch (error) {
      console.error('Error in loadBrandProfiles:', error);
    }
  };

  const getAllKeywords = () => {
    return [
      ...keywordCategories.commonNames,
      ...keywordCategories.chemicalSynonyms,
      ...keywordCategories.inciTerms,
      ...keywordCategories.additional
    ];
  };

  const handleApprove = (productId: string) => {
    const product = pendingProducts.find(p => p.id === productId);
    if (product && isDuplicateProduct(product.brand, product.name)) {
      toast({
        title: "Duplicate product",
        description: `A product with brand "${product.brand}" and name "${product.name}" already exists in the approved products.`,
        variant: "destructive"
      });
      return;
    }
    
    updateProductApproval(productId, true);
    loadProductSubmissions();
    
    toast({
      title: "Product approved",
      description: `Product has been added to the database.`,
    });
  };

  const handleReject = (productId: string) => {
    deleteProductSubmission(productId);
    loadProductSubmissions();
    
    toast({
      title: "Product rejected",
      description: "The product submission has been rejected.",
    });
  };

  const handleDelete = (productId: string) => {
    deleteProductSubmission(productId);
    loadProductSubmissions();
    
    toast({
      title: "Product deleted",
      description: "The product has been removed from the database.",
    });
  };

  const handleApproveBrandOwnership = (productId: string) => {
    const success = approveBrandOwnership(productId);
    
    if (success) {
      loadProductSubmissions();
      
      toast({
        title: "Brand ownership approved",
        description: "The brand has been verified.",
      });
    } else {
      toast({
        title: "Approval failed",
        description: "There was an error approving this request.",
        variant: "destructive"
      });
    }
  };

  const handleRejectBrandOwnership = (productId: string) => {
    const success = rejectBrandOwnership(productId);
    
    if (success) {
      loadProductSubmissions();
      
      toast({
        title: "Brand ownership rejected",
        description: "The verification request has been rejected.",
      });
    } else {
      toast({
        title: "Rejection failed",
        description: "There was an error rejecting this request.",
        variant: "destructive"
      });
    }
  };

  const openProductDetails = (product: ProductSubmission) => {
    setSelectedProduct(product);
    setProductDetails({
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      videoUrl: product.videoUrl || "",
      websiteUrl: product.websiteUrl || ""
    });
    setIsDialogOpen(true);
  };

  const handleSaveDetails = () => {
    if (!selectedProduct) return;
    
    saveProductDetails(selectedProduct.id, productDetails);
    loadProductSubmissions();
    
    toast({
      title: "Details updated",
      description: "The product details have been saved.",
    });
    
    setIsDialogOpen(false);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() === "") {
      toast({
        title: "Empty keyword",
        description: "Please enter a keyword to add.",
        variant: "destructive"
      });
      return;
    }
    
    const allKeywords = getAllKeywords();
    if (allKeywords.includes(newKeyword.trim().toLowerCase())) {
      toast({
        title: "Duplicate keyword",
        description: "This keyword already exists in the list.",
        variant: "destructive"
      });
      return;
    }
    
    setKeywordCategories({
      ...keywordCategories,
      [selectedCategory]: [...keywordCategories[selectedCategory as keyof typeof keywordCategories], newKeyword.trim().toLowerCase()]
    });
    
    setNewKeyword("");
    
    toast({
      title: "Keyword added",
      description: `"${newKeyword.trim()}" has been added to the ${getCategoryDisplayName(selectedCategory)} category.`,
    });
  };

  const handleRemoveKeyword = (keyword: string, category: keyof typeof keywordCategories) => {
    setKeywordCategories({
      ...keywordCategories,
      [category]: keywordCategories[category].filter(k => k !== keyword)
    });
    
    toast({
      title: "Keyword removed",
      description: `"${keyword}" has been removed from the keyword list.`,
    });
  };

  const getCategoryDisplayName = (category: string) => {
    switch(category) {
      case 'commonNames': return 'Common Names & Abbreviations';
      case 'chemicalSynonyms': return 'Chemical Synonyms';
      case 'inciTerms': return 'INCI (Cosmetic Labeling Terms)';
      case 'additional': return 'Additional Terms';
      default: return category;
    }
  };

  const filteredApprovedProducts = approvedProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBulkUploadComplete = () => {
    loadProductSubmissions();
    setBulkUploadMode(false);
    setActiveTab("approved");
    
    toast({
      title: "Bulk upload complete",
      description: "The approved products list has been updated.",
    });
  };

  const handleCleanDuplicates = () => {
    const count = cleanDuplicateProducts();
    loadProductSubmissions();
    
    if (count > 0) {
      toast({
        title: "Duplicates removed",
        description: `Successfully removed ${count} duplicate products from the database.`,
      });
    } else {
      toast({
        title: "No duplicates found",
        description: "Your product database is already clean with no duplicates.",
      });
    }
    
    setShowCleanupDialog(false);
  };
  
  const handleResetDatabase = () => {
    resetProductDatabase();
    loadProductSubmissions();
    
    toast({
      title: "Database reset",
      description: "All products have been removed from the database.",
    });
    
    setShowResetDialog(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage product submissions and configuration
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved Products</TabsTrigger>
          <TabsTrigger value="verifications" className="relative">
            Brand Verifications
            {pendingVerifications.length > 0 && (
              <Badge className="ml-1 bg-orange-500" variant="default">
                {pendingVerifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="relative">
            Brand Messages
            {brandMessages.filter(m => !m.admin_response).length > 0 && (
              <Badge className="ml-1 bg-orange-500" variant="default">
                {brandMessages.filter(m => !m.admin_response).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>
                Review and approve user-submitted product information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>PVA Status</TableHead>
                        <TableHead>PVA %</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
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
                          <TableCell>
                            {product.submittedAt ? 
                              new Date(product.submittedAt).toLocaleDateString() : 
                              product.dateSubmitted ? 
                                new Date(product.dateSubmitted).toLocaleDateString() : 
                                'Unknown date'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openProductDetails(product)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleApprove(product.id)}
                                className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleReject(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
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
                  No pending submissions to review
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      setActiveTab("bulk");
                      setBulkUploadMode(true);
                    }}
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
                        <AlertDialogAction onClick={handleCleanDuplicates}>
                          Clean Duplicates
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {approvedProducts.length > 0 ? (
                <>
                  <DataCharts products={approvedProducts} />
                  <div className="rounded-md border mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>PVA Status</TableHead>
                          <TableHead>PVA %</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApprovedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.brand}</TableCell>
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
                                  onClick={() => openProductDetails(product)}
                                  title="Edit Details"
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(product.id)}
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
        </TabsContent>
        
        <TabsContent value="verifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Verification Requests</CardTitle>
              <CardDescription>
                Review and approve brand ownership verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingVerifications.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Contact Email</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVerifications.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.brandContactEmail || "N/A"}</TableCell>
                          <TableCell>
                            {product.brandOwnershipRequestDate ? 
                              new Date(product.brandOwnershipRequestDate).toLocaleDateString() : 
                              'Unknown date'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleApproveBrandOwnership(product.id)}
                                className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                title="Approve Verification"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRejectBrandOwnership(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Reject Verification"
                              >
                                <XCircle className="h-4 w-4" />
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
                  No pending brand verification requests
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-6">
          <BulkUpload onComplete={handleBulkUploadComplete} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure application settings and scan parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">PVA Scan Keywords</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These keywords will be used to scan uploaded documents for PVA-related ingredients
                </p>
                
                <Accordion type="single" collapsible className="w-full mb-4">
                  <AccordionItem value="common-names">
                    <AccordionTrigger className="text-md font-medium hover:no-underline">
                      ✅ Common Names & Abbreviations
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {keywordCategories.commonNames.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                            {keyword}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveKeyword(keyword, 'commonNames')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        These are primary trigger terms in your scan.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="chemical-synonyms">
                    <AccordionTrigger className="text-md font-medium hover:no-underline">
                      ✅ Chemical Synonyms
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {keywordCategories.chemicalSynonyms.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                            {keyword}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveKeyword(keyword, 'chemicalSynonyms')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Useful for detecting in scientific SDS or INCI-type declarations.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="inci-terms">
                    <AccordionTrigger className="text-md font-medium hover:no-underline">
                      ✅ INCI (Cosmetic Labeling Terms)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {keywordCategories.inciTerms.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                            {keyword}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveKeyword(keyword, 'inciTerms')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        These show up often in personal care products, wipes, and cleaning sprays.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="additional-terms">
                    <AccordionTrigger className="text-md font-medium hover:no-underline">
                      Additional Terms
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {keywordCategories.additional.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                            {keyword}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveKeyword(keyword, 'additional')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex flex-col space-y-2 mt-6">
                  <h4 className="font-medium">Add New Keyword</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Enter new keyword or abbreviation..."
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commonNames">Common Names & Abbreviations</SelectItem>
                          <SelectItem value="chemicalSynonyms">Chemical Synonyms</SelectItem>
                          <SelectItem value="inciTerms">INCI Terms</SelectItem>
                          <SelectItem value="additional">Additional Terms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddKeyword} className="w-full md:w-auto self-end">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Keyword
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-new" defaultChecked />
                    <Label htmlFor="notify-new">Email notifications for new submissions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-approved" defaultChecked />
                    <Label htmlFor="notify-approved">Email notifications when products are approved</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Database Maintenance</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-yellow-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-yellow-600 h-5 w-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Emergency Database Actions</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          These actions will permanently modify your database. Use with caution.
                        </p>
                        <div className="flex gap-3 mt-4">
                          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Reset Database
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Entire Database</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete ALL products in the database.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialog
