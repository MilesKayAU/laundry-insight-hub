
import React, { useState } from 'react';
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
import { ProductSubmission } from "@/lib/textExtractor";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageResponse, setMessageResponse] = useState("");
  
  // Mock data for products with realistic values
  const mockProducts: ProductSubmission[] = [
    {
      id: "1",
      brand: "EcoBeauty",
      name: "Hydrating Facial Cleanser",
      type: "Cleanser",
      pvaStatus: "contains" as const,
      pvaPercentage: 2.5,
      ingredients: "Water, Glycerin, Polyvinyl Alcohol, Aloe Vera Extract, Chamomile Oil",
      websiteUrl: "https://www.ecobeauty.com/products/facial-cleanser",
      submittedBy: "user123",
      timestamp: new Date().toISOString(),
      approved: true,
      brandVerified: false
    },
    {
      id: "2",
      brand: "NatureCare",
      name: "Moisturizing Face Cream",
      type: "Moisturizer",
      pvaStatus: "verified-free" as const,
      pvaPercentage: 0,
      ingredients: "Aqua, Cetyl Alcohol, Glycerin, Shea Butter, Jojoba Oil",
      websiteUrl: "https://www.naturecare.com/face-cream",
      submittedBy: "user456",
      timestamp: new Date().toISOString(),
      approved: true,
      brandVerified: true
    },
    {
      id: "3",
      brand: "PureSkin",
      name: "Exfoliating Scrub",
      type: "Exfoliant",
      pvaStatus: "needs-verification" as const,
      pvaPercentage: null,
      ingredients: "Water, Walnut Shell Powder, Glycerin, Vitamin E, Tea Tree Oil",
      websiteUrl: "https://www.pureskin.com/scrub",
      submittedBy: "user789",
      timestamp: new Date().toISOString(),
      approved: false,
      brandVerified: false
    },
    {
      id: "4",
      brand: "GlowUp",
      name: "Vitamin C Serum",
      type: "Serum",
      pvaStatus: "inconclusive" as const,
      pvaPercentage: null,
      ingredients: "Water, Ascorbic Acid, Ferulic Acid, Vitamin E, Hyaluronic Acid",
      websiteUrl: "https://www.glowup.com/vitamin-c-serum",
      submittedBy: "user321",
      timestamp: new Date().toISOString(),
      approved: false,
      brandVerified: false
    }
  ];
  
  // Filter products by approved status
  const pendingProducts = mockProducts.filter(product => !product.approved);
  const approvedProducts = mockProducts.filter(product => product.approved);
  
  // Filter approved products by search term
  const filteredApprovedProducts = searchTerm 
    ? approvedProducts.filter(p => 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : approvedProducts;
  
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
            onApprove={() => {}}
            onReject={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <ApprovedProducts 
            products={approvedProducts}
            filteredProducts={filteredApprovedProducts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onViewDetails={() => {}}
            onDelete={() => {}}
            onBulkUpload={() => {}}
            showCleanupDialog={showCleanupDialog}
            setShowCleanupDialog={setShowCleanupDialog}
            onCleanDuplicates={() => {}}
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
