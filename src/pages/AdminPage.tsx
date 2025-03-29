
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
  Link,
  X
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

// Helper function to save additional product details
const saveProductDetails = (productId: string, details: Partial<ProductSubmission>) => {
  const submissions = getProductSubmissions();
  const updatedSubmissions = submissions.map(submission => 
    submission.id === productId ? { ...submission, ...details } : submission
  );
  localStorage.setItem('product_submissions', JSON.stringify(updatedSubmissions));
};

const AdminPage = () => {
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<ProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ProductSubmission[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  
  // State for product details form
  const [productDetails, setProductDetails] = useState({
    description: "",
    imageUrl: "",
    videoUrl: "",
    websiteUrl: ""
  });
  
  // State to control dialog open/close
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Initialize keyword state from our categorized keywords
  const [keywordCategories, setKeywordCategories] = useState({
    commonNames: [...PVA_KEYWORDS_CATEGORIES.commonNames],
    chemicalSynonyms: [...PVA_KEYWORDS_CATEGORIES.chemicalSynonyms],
    inciTerms: [...PVA_KEYWORDS_CATEGORIES.inciTerms],
    additional: [...PVA_KEYWORDS_CATEGORIES.additional]
  });
  
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("commonNames");
  const [searchTerm, setSearchTerm] = useState("");

  // Load submissions from local storage when the component mounts
  useEffect(() => {
    loadProductSubmissions();
  }, []);

  const loadProductSubmissions = () => {
    const submissions = getProductSubmissions();
    setPendingProducts(submissions.filter(p => !p.approved));
    setApprovedProducts(submissions.filter(p => p.approved));
  };

  // Get all keywords as a flat array for scanning functionality
  const getAllKeywords = () => {
    return [
      ...keywordCategories.commonNames,
      ...keywordCategories.chemicalSynonyms,
      ...keywordCategories.inciTerms,
      ...keywordCategories.additional
    ];
  };

  const handleApprove = (productId: string) => {
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

  // Open product details dialog
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

  // Save product details
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
    
    // Add the keyword to the selected category
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

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage product submissions and configuration
        </p>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved Products</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Pending Submissions Tab */}
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
                            {new Date(product.submittedAt || product.dateSubmitted).toLocaleDateString()}
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
        
        {/* Approved Products Tab */}
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
              </div>
            </CardHeader>
            <CardContent>
              {approvedProducts.length > 0 ? (
                <div className="rounded-md border">
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
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No approved products in the database
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
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
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Product Details</DialogTitle>
                <DialogDescription>
                  Update details for {selectedProduct.name} from {selectedProduct.brand}. These details will be displayed on the PVA-free products page if the product is verified free.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pva-status" className="text-right">PVA Status</Label>
                  <div className="col-span-3">
                    <Select 
                      defaultValue={selectedProduct.pvaStatus}
                      onValueChange={(value: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive') => {
                        saveProductDetails(selectedProduct.id, { pvaStatus: value });
                        loadProductSubmissions();
                        setSelectedProduct({...selectedProduct, pvaStatus: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains PVA</SelectItem>
                        <SelectItem value="verified-free">Verified Free (0% PVA)</SelectItem>
                        <SelectItem value="needs-verification">Needs Verification</SelectItem>
                        <SelectItem value="inconclusive">Inconclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pva-percentage" className="text-right">PVA %</Label>
                  <div className="col-span-3">
                    <Input
                      id="pva-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="PVA percentage (if known)"
                      defaultValue={selectedProduct.pvaPercentage || ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                        saveProductDetails(selectedProduct.id, { pvaPercentage: value });
                        loadProductSubmissions();
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Product description"
                    className="col-span-3"
                    value={productDetails.description}
                    onChange={(e) => setProductDetails({...productDetails, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="image-url" className="flex items-center justify-end gap-2">
                      <Image className="h-4 w-4" /> Image URL
                    </Label>
                  </div>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/product-image.jpg"
                    className="col-span-3"
                    value={productDetails.imageUrl}
                    onChange={(e) => setProductDetails({...productDetails, imageUrl: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="video-url" className="flex items-center justify-end gap-2">
                      <Video className="h-4 w-4" /> Video URL
                    </Label>
                  </div>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://youtube.com/embed/video-id"
                    className="col-span-3"
                    value={productDetails.videoUrl}
                    onChange={(e) => setProductDetails({...productDetails, videoUrl: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="website-url" className="flex items-center justify-end gap-2">
                      <Link className="h-4 w-4" /> Website
                    </Label>
                  </div>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com/product"
                    className="col-span-3"
                    value={productDetails.websiteUrl}
                    onChange={(e) => setProductDetails({...productDetails, websiteUrl: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSaveDetails}>
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
