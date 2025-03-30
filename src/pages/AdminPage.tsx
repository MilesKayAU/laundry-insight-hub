
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { PVA_KEYWORDS_CATEGORIES, getProductSubmissions, ProductSubmission, updateProductApproval, deleteProductSubmission } from "@/lib/textExtractor";
import { isDuplicateProduct, approveBrandOwnership, rejectBrandOwnership, cleanDuplicateProducts, resetProductDatabase } from "@/lib/bulkUpload";
import BulkUpload from "@/components/BulkUpload";
import { supabase } from "@/integrations/supabase/client";

import PendingProducts from "@/components/admin/PendingProducts";
import ApprovedProducts from "@/components/admin/ApprovedProducts";
import BrandVerifications from "@/components/admin/BrandVerifications";
import BrandMessages from "@/components/admin/BrandMessages";
import AdminSettings from "@/components/admin/AdminSettings";
import ProductDetailsDialog from "@/components/admin/ProductDetailsDialog";
import UserManagement from "@/components/admin/UserManagement";
import Communications from "@/components/admin/Communications";

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
    websiteUrl: "",
    pvaPercentage: "",
    country: ""
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
      websiteUrl: product.websiteUrl || "",
      pvaPercentage: product.pvaPercentage ? product.pvaPercentage.toString() : "",
      country: product.country || ""
    });
    setIsDialogOpen(true);
  };

  const handleSaveDetails = () => {
    if (!selectedProduct) return;
    
    const updatedDetails = {
      ...productDetails,
      pvaPercentage: productDetails.pvaPercentage ? parseInt(productDetails.pvaPercentage, 10) : undefined
    };
    
    saveProductDetails(selectedProduct.id, updatedDetails);
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

  const handleMessageResponse = async () => {
    if (!selectedMessage) return;
    
    try {
      const { data, error } = await supabase
        .from('brand_messages')
        .update({
          admin_response: messageResponse,
          status: 'approved'
        })
        .eq('id', selectedMessage.id);
      
      if (error) {
        console.error('Error updating message:', error);
        toast({
          title: "Error",
          description: "Failed to send response. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh messages
      loadBrandMessages();
      
      toast({
        title: "Response sent",
        description: "Your response has been recorded and will be sent to the brand contact.",
      });
      
      setMessageDialogOpen(false);
      setMessageResponse("");
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error in handleMessageResponse:', error);
    }
  };

  const openMessageResponse = (message: BrandMessage) => {
    setSelectedMessage(message);
    setMessageResponse(message.admin_response || "");
    setMessageDialogOpen(true);
  };

  const filteredBrandProfiles = brandProfiles.filter(profile =>
    profile.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );

  const handleBulkUploadClick = () => {
    setActiveTab("bulk");
    setBulkUploadMode(true);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage product submissions, users, and communications
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 max-w-5xl mx-auto">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
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
          <PendingProducts 
            products={pendingProducts}
            onViewDetails={openProductDetails}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <ApprovedProducts 
            products={approvedProducts}
            filteredProducts={filteredApprovedProducts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onViewDetails={openProductDetails}
            onDelete={handleDelete}
            onBulkUpload={handleBulkUploadClick}
            showCleanupDialog={showCleanupDialog}
            setShowCleanupDialog={setShowCleanupDialog}
            onCleanDuplicates={handleCleanDuplicates}
          />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="communications" className="mt-6">
          <Communications />
        </TabsContent>
        
        <TabsContent value="verifications" className="mt-6">
          <BrandVerifications 
            verifications={pendingVerifications}
            onApproveVerification={handleApproveBrandOwnership}
            onRejectVerification={handleRejectBrandOwnership}
          />
        </TabsContent>
        
        <TabsContent value="messages" className="mt-6">
          <BrandMessages 
            messages={brandMessages}
            profiles={brandProfiles}
            selectedMessage={selectedMessage}
            messageResponse={messageResponse}
            dialogOpen={messageDialogOpen}
            onDialogOpenChange={setMessageDialogOpen}
            onMessageSelect={openMessageResponse}
            onResponseChange={setMessageResponse}
            onSendResponse={handleMessageResponse}
          />
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-6">
          <BulkUpload onComplete={handleBulkUploadComplete} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <AdminSettings 
            keywordCategories={keywordCategories}
            newKeyword={newKeyword}
            selectedCategory={selectedCategory}
            showResetDialog={showResetDialog}
            setShowResetDialog={setShowResetDialog}
            onNewKeywordChange={setNewKeyword}
            onCategoryChange={setSelectedCategory}
            onAddKeyword={handleAddKeyword}
            onRemoveKeyword={handleRemoveKeyword}
            onResetDatabase={handleResetDatabase}
            getCategoryDisplayName={getCategoryDisplayName}
          />
        </TabsContent>
      </Tabs>

      <ProductDetailsDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        details={productDetails}
        onDetailsChange={setProductDetails}
        onSave={handleSaveDetails}
      />
    </div>
  );
};

export default AdminPage;
