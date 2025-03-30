
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingProducts from "@/components/admin/PendingProducts";
import ApprovedProducts from "@/components/admin/ApprovedProducts";
import BrandVerifications from "@/components/admin/BrandVerifications";
import BrandMessages from "@/components/admin/BrandMessages";
import AdminSettings from "@/components/admin/AdminSettings";
import BlogPostsManager from "@/components/admin/BlogPostsManager";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const [defaultTab, setDefaultTab] = useState("pending");
  const { toast } = useToast();
  
  // Mock data for empty components
  const [pendingProducts, setPendingProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [brandVerifications, setBrandVerifications] = useState([]);
  const [brandMessages, setBrandMessages] = useState([]);
  const [brandProfiles, setBrandProfiles] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageResponse, setMessageResponse] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);

  // Check if current user is admin
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-check"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      return data;
    },
  });

  // For this example, we're showing a message if the user is an admin but not in the admins list
  // In a real app, you might want to actually modify the list in the database
  React.useEffect(() => {
    if (isAdmin === false && !isLoading) {
      toast({
        title: "Admin role needed",
        description: "You need to be added to the admins list to manage this application.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isLoading, toast]);

  // Mock handlers for components
  const handleViewDetails = (product) => {
    console.log("View details:", product);
  };

  const handleApprove = (productId) => {
    console.log("Approve product:", productId);
  };

  const handleReject = (productId) => {
    console.log("Reject product:", productId);
  };

  const handleApproveVerification = (productId) => {
    console.log("Approve verification:", productId);
  };

  const handleRejectVerification = (productId) => {
    console.log("Reject verification:", productId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const handleResponseChange = (response) => {
    setMessageResponse(response);
  };

  const handleSendResponse = () => {
    console.log("Send response:", messageResponse);
    setDialogOpen(false);
  };
  
  const handleDelete = (id) => {
    console.log("Delete item:", id);
  };
  
  const handleBulkUpload = () => {
    console.log("Bulk upload triggered");
  };
  
  const handleCleanDuplicates = () => {
    console.log("Clean duplicates triggered");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 md:w-[600px]">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <PendingProducts 
            products={pendingProducts}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <ApprovedProducts 
            products={approvedProducts}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            onBulkUpload={handleBulkUpload}
            showCleanupDialog={showCleanupDialog}
            setShowCleanupDialog={setShowCleanupDialog}
            onCleanDuplicates={handleCleanDuplicates}
            isLoading={false}
          />
        </TabsContent>
        
        <TabsContent value="brands">
          <BrandVerifications 
            verifications={brandVerifications}
            onApproveVerification={handleApproveVerification}
            onRejectVerification={handleRejectVerification}
          />
        </TabsContent>
        
        <TabsContent value="messages">
          <BrandMessages 
            messages={brandMessages}
            profiles={brandProfiles}
            selectedMessage={selectedMessage}
            messageResponse={messageResponse}
            dialogOpen={dialogOpen}
            onDialogOpenChange={setDialogOpen}
            onMessageSelect={handleMessageSelect}
            onResponseChange={handleResponseChange}
            onSendResponse={handleSendResponse}
          />
        </TabsContent>
        
        <TabsContent value="blog">
          <BlogPostsManager />
        </TabsContent>
        
        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
