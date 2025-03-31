
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
import { ProductSubmission } from '@/lib/textExtractor';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/AuthGuard';

// Placeholder sample data and functions to satisfy component props
const samplePendingProducts: ProductSubmission[] = [];
const sampleApprovedProducts: ProductSubmission[] = [];
const sampleVerifications: ProductSubmission[] = [];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  
  // Mock handlers for now - these would be connected to real APIs in production
  const handleViewDetails = (product: ProductSubmission) => {
    console.log("View details for:", product);
  };
  
  const handleApprove = (productId: string) => {
    toast({
      title: "Product Approved",
      description: `Product ${productId} has been approved.`,
    });
  };
  
  const handleReject = (productId: string) => {
    toast({
      title: "Product Rejected",
      description: `Product ${productId} has been rejected.`,
    });
  };
  
  const handleVerify = (product: ProductSubmission) => {
    console.log("Verify product:", product);
  };

  // Define keyword categories
  const keywordCategories = {
    commonNames: [],
    chemicalSynonyms: [],
    inciTerms: [],
    additional: []
  };

  return (
    <AuthGuard>
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
              products={samplePendingProducts} 
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
              onVerify={handleVerify}
            />
          </TabsContent>
          
          <TabsContent value="approved">
            <ApprovedProducts 
              products={sampleApprovedProducts}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
          
          <TabsContent value="pvaSubmissions">
            <PvaPercentageSubmissions />
          </TabsContent>
          
          <TabsContent value="brandVerifications">
            <BrandVerifications 
              verifications={sampleVerifications}
              onApproveVerification={() => {}}
              onRejectVerification={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="brandMessages">
            <BrandMessages 
              messages={[]}
              profiles={[]}
              selectedMessage={null}
              messageResponse=""
              onChangeResponse={() => {}}
              onSendResponse={() => {}}
              onDeleteMessage={() => {}}
              onCloseMessageDetails={() => {}}
              onMessageSelect={() => {}}
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
              keywordCategories={keywordCategories}
              newKeyword=""
              selectedCategory=""
              showResetDialog={false}
              onAddKeyword={() => {}}
              onDeleteKeyword={() => {}}
              onChangeNewKeyword={() => {}}
              onChangeSelectedCategory={() => {}}
              onResetData={() => {}}
              onToggleResetDialog={() => {}}
              onCreateCategory={() => {}}
              onDeleteCategory={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
};

export default AdminPage;
