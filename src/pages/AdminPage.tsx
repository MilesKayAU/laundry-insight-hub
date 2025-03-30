
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingProducts from "@/components/admin/PendingProducts";
import ApprovedProducts from "@/components/admin/ApprovedProducts";
import BrandVerifications from "@/components/admin/BrandVerifications";
import BrandMessages from "@/components/admin/BrandMessages";
import AdminSettings from "@/components/admin/AdminSettings";
import BlogPostsManager from "@/components/admin/BlogPostsManager";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-blog";

const AdminPage = () => {
  const [defaultTab, setDefaultTab] = useState("pending");
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: isAdminError, refetch: refetchAdmin } = useIsAdmin();
  
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

  useEffect(() => {
    console.log("AdminPage - Current user:", user?.email);
    console.log("AdminPage - Is admin loading:", isAdminLoading);
    console.log("AdminPage - Is admin:", isAdmin);
    console.log("AdminPage - Admin check error:", isAdminError);
  }, [user, isAdmin, isAdminLoading, isAdminError]);

  const handleAdminCheck = () => {
    console.log("Manually rechecking admin status...");
    refetchAdmin();
  };

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

  if (isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 text-science-600 mb-4">
            <RefreshCw />
          </div>
          <p>Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (isAdminError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Admin Check Error</AlertTitle>
          <AlertDescription>
            There was a problem checking your admin status.
            {isAdminError instanceof Error && (
              <pre className="mt-2 text-xs overflow-auto max-h-[200px] p-2 bg-red-50 rounded">
                {isAdminError.message}
              </pre>
            )}
          </AlertDescription>
        </Alert>
        <Button onClick={handleAdminCheck} className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Special admin override based on email
  const isSpecialAdmin = user?.email?.toLowerCase() === 'mileskayaustralia@gmail.com';
  const hasAdminAccess = isAdmin || isSpecialAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have admin privileges to access this page.
            User email: {user?.email}
          </AlertDescription>
        </Alert>
        <Button onClick={handleAdminCheck} className="flex items-center mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Recheck Admin Status
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Button onClick={handleAdminCheck} variant="outline" size="sm" className="mb-8">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Admin Status
        </Button>
      </div>
      
      <Alert className="mb-6">
        <AlertTitle>Admin Access Granted</AlertTitle>
        <AlertDescription>
          You are logged in as {user?.email} with admin privileges.
          {isSpecialAdmin && " (Special admin override active)"}
        </AlertDescription>
      </Alert>
      
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
