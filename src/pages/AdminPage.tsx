
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

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  
  // Mock data for components to prevent undefined errors
  const emptyProducts = [];
  const emptyVerifications = [];

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
            products={emptyProducts}
            onViewDetails={() => {}}
            onApprove={() => {}}
            onReject={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <ApprovedProducts 
            products={emptyProducts}
            filteredProducts={emptyProducts}
            searchTerm=""
            onSearchChange={() => {}}
            onView={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onPvaEdit={() => {}}
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
            messages={[]}
            profiles={[]}
            selectedMessage={null}
            messageResponse=""
            onSelectMessage={() => {}}
            onResponseChange={() => {}}
            onSendResponse={() => {}}
            onMarkResolved={() => {}}
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
            keywordCategories={[]}
            newKeyword=""
            selectedCategory=""
            showResetDialog={false}
            onNewKeywordChange={() => {}}
            onCategoryChange={() => {}}
            onAddKeyword={() => {}}
            onDeleteKeyword={() => {}}
            onOpenResetDialog={() => {}}
            onCloseResetDialog={() => {}}
            onResetData={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
