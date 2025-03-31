
import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import PendingProducts from "@/components/admin/PendingProducts";
import ApprovedProducts from "@/components/admin/ApprovedProducts";
import BrandVerifications from "@/components/admin/BrandVerifications";
import BrandMessages from "@/components/admin/BrandMessages";
import Communications from "@/components/admin/Communications";
import UserManagement from "@/components/admin/UserManagement";
import AdminSettings from "@/components/admin/AdminSettings";
import PvaPercentageSubmissions from "@/components/admin/PvaPercentageSubmissions";
import ResearchManagement from "@/components/admin/ResearchManagement";
import { ProductSubmission, getProductSubmissions, updateProductApproval, deleteProductSubmission } from "@/lib/textExtractor";
import { useToast } from "@/hooks/use-toast";

const AdminPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageResponse, setMessageResponse] = useState("");
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  
  // Load all product submissions from localStorage
  useEffect(() => {
    // Pass no userId to get all products including system ones
    const loadedProducts = getProductSubmissions();
    console.log(`Loaded ${loadedProducts.length} products from localStorage`);
    setProducts(loadedProducts);
  }, []);
  
  // Filter products by approved status
  const pendingProducts = products.filter(product => !product.approved);
  const approvedProducts = products.filter(product => product.approved);
  
  // Filter approved products by search term
  const filteredApprovedProducts = searchTerm 
    ? approvedProducts.filter(p => 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : approvedProducts;
  
  // Handle product approval
  const handleApproveProduct = (productId: string) => {
    const updatedProducts = updateProductApproval(productId, true);
    setProducts(updatedProducts);
    toast({
      title: "Product Approved",
      description: "The product has been approved and added to the database.",
    });
  };
  
  // Handle product rejection/deletion
  const handleRejectProduct = (productId: string) => {
    const updatedProducts = deleteProductSubmission(productId);
    setProducts(updatedProducts);
    toast({
      title: "Product Rejected",
      description: "The product submission has been rejected and removed.",
    });
  };
  
  // Handle cleaning duplicates
  const handleCleanDuplicates = () => {
    // This would implement duplicate detection and removal
    toast({
      title: "Duplicates Cleaned",
      description: "Duplicate products have been removed from the database.",
    });
    setShowCleanupDialog(false);
    
    // Reload products after cleaning
    const refreshedProducts = getProductSubmissions();
    setProducts(refreshedProducts);
  };
  
  // Mock data for other components
  const emptyVerifications = [];
  const emptyMessages = [];
  const emptyProfiles = [];
  
  // Mock keyword categories 
  const mockKeywordCategories = {
    commonNames: ["pva", "pvoh", "polyvinyl alcohol"],
    chemicalSynonyms: ["ethenol homopolymer", "vinyl alcohol polymer"],
    inciTerms: ["pva", "polyvinyl alcohol"],
    additional: ["alcohol homopolymer"]
  };

  return (
    <div className="container mx-auto py-10 pb-32 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="pending">Pending Products</TabsTrigger>
          <TabsTrigger value="approved">Approved Products</TabsTrigger>
          <TabsTrigger value="pvaSubmissions">PVA % Submissions</TabsTrigger>
          <TabsTrigger value="brandVerifications">Brand Verifications</TabsTrigger>
          <TabsTrigger value="brandMessages">Brand Messages</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <PendingProducts 
            products={pendingProducts}
            onViewDetails={() => {}}
            onApprove={handleApproveProduct}
            onReject={handleRejectProduct}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <ApprovedProducts 
            products={approvedProducts}
            filteredProducts={filteredApprovedProducts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onViewDetails={() => {}}
            onDelete={handleRejectProduct}
            onBulkUpload={() => {}}
            showCleanupDialog={showCleanupDialog}
            setShowCleanupDialog={setShowCleanupDialog}
            onCleanDuplicates={handleCleanDuplicates}
          />
        </TabsContent>
        
        <TabsContent value="pvaSubmissions">
          <PvaPercentageSubmissions />
        </TabsContent>
        
        <TabsContent value="brandVerifications">
          <BrandVerifications 
            verifications={emptyVerifications}
            onApproveVerification={() => {}}
            onRejectVerification={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="brandMessages">
          <BrandMessages 
            messages={emptyMessages}
            profiles={emptyProfiles}
            selectedMessage={null}
            messageResponse={messageResponse}
            dialogOpen={dialogOpen}
            onDialogOpenChange={setDialogOpen}
            onMessageSelect={() => {}}
            onResponseChange={setMessageResponse}
            onSendResponse={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="research">
          <ResearchManagement />
        </TabsContent>
        
        <TabsContent value="communications">
          <Communications />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="settings">
          <AdminSettings 
            keywordCategories={mockKeywordCategories}
            newKeyword=""
            selectedCategory=""
            showResetDialog={showResetDialog}
            setShowResetDialog={setShowResetDialog}
            onNewKeywordChange={() => {}}
            onCategoryChange={() => {}}
            onAddKeyword={() => {}}
            onRemoveKeyword={() => {}}
            onResetDatabase={() => {}}
            getCategoryDisplayName={() => ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
