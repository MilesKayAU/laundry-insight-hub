
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductSubmission } from "@/lib/textExtractor";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<ProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ProductSubmission[]>([]);
  const [verifications, setVerifications] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Mock data for other components
  const mockMessages = [];
  const mockProfiles = [];

  useEffect(() => {
    // Load products from localStorage or database
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // For testing, load from localStorage
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          const products = JSON.parse(storedProducts) as ProductSubmission[];
          
          // Split into pending and approved
          const pending = products.filter(p => p.status === 'pending' || !p.status);
          const approved = products.filter(p => p.status === 'approved');
          const brandVerifications = products.filter(p => p.brandOwnershipRequested);
          
          setPendingProducts(pending);
          setApprovedProducts(approved);
          setVerifications(brandVerifications);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Error",
          description: "Failed to load product submissions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [toast]);

  const handleViewDetails = (product: ProductSubmission) => {
    setSelectedProduct(product);
    setShowDetailsDialog(true);
  };
  
  const handleApproveProduct = (productId: string) => {
    try {
      // Find the product
      const productIndex = pendingProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) return;
      
      // Update the product status
      const updatedProducts = [...pendingProducts];
      updatedProducts[productIndex].status = 'approved';
      
      // Move to approved products
      setApprovedProducts([...approvedProducts, updatedProducts[productIndex]]);
      setPendingProducts(updatedProducts.filter(p => p.id !== productId));
      
      // Update localStorage
      const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedAllProducts = allProducts.map((p: ProductSubmission) => 
        p.id === productId ? { ...p, status: 'approved' } : p
      );
      localStorage.setItem('products', JSON.stringify(updatedAllProducts));
      
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
    } catch (error) {
      console.error("Error approving product:", error);
      toast({
        title: "Error",
        description: "Failed to approve product",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectProduct = (productId: string) => {
    try {
      // Find the product
      const productIndex = pendingProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) return;
      
      // Update the product status
      const updatedProducts = [...pendingProducts];
      updatedProducts[productIndex].status = 'rejected';
      
      // Remove from pending products
      setPendingProducts(updatedProducts.filter(p => p.id !== productId));
      
      // Update localStorage
      const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedAllProducts = allProducts.map((p: ProductSubmission) => 
        p.id === productId ? { ...p, status: 'rejected' } : p
      );
      localStorage.setItem('products', JSON.stringify(updatedAllProducts));
      
      toast({
        title: "Success",
        description: "Product rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast({
        title: "Error",
        description: "Failed to reject product",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveVerification = (productId: string) => {
    // Handle brand verification approval
    toast({
      title: "Verification Approved",
      description: "Brand verification has been approved",
    });
  };
  
  const handleRejectVerification = (productId: string) => {
    // Handle brand verification rejection
    toast({
      title: "Verification Rejected",
      description: "Brand verification has been rejected",
    });
  };

  const filteredApprovedProducts = approvedProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onViewDetails={handleViewDetails}
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
            onView={handleViewDetails}
            onEdit={() => {}}
            onDelete={() => {}}
            loading={loading}
            onExport={() => {}}
            onImport={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="pvaSubmissions">
          <PvaPercentageSubmissions />
        </TabsContent>
        
        <TabsContent value="brandVerifications">
          <BrandVerifications 
            verifications={verifications}
            onApproveVerification={handleApproveVerification}
            onRejectVerification={handleRejectVerification}
          />
        </TabsContent>
        
        <TabsContent value="brandMessages">
          <BrandMessages 
            messages={mockMessages}
            profiles={mockProfiles}
            selectedMessage={null}
            messageResponse=""
            onSelectMessage={() => {}}
            onResponseChange={() => {}}
            onSendResponse={() => {}}
            onCloseMessage={() => {}}
            loading={false}
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
            onSelectedCategoryChange={() => {}}
            onAddKeyword={() => {}}
            onDeleteKeyword={() => {}}
            onShowResetDialog={() => {}}
            onHideResetDialog={() => {}}
            onResetDatabase={() => {}}
            onGenerateTestData={() => {}}
          />
        </TabsContent>
      </Tabs>
      
      {/* Product details dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          {selectedProduct && (
            <div>
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                  <p><strong>Type:</strong> {selectedProduct.type}</p>
                  <p><strong>PVA Status:</strong> {selectedProduct.pvaStatus}</p>
                  <p><strong>PVA %:</strong> {selectedProduct.pvaPercentage ?? 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Submitted By:</strong> {selectedProduct.submittedBy ?? 'Anonymous'}</p>
                  <p><strong>Submitted At:</strong> {selectedProduct.submittedAt ? new Date(selectedProduct.submittedAt).toLocaleString() : 'Unknown'}</p>
                  <p><strong>Status:</strong> {selectedProduct.status ?? 'Pending'}</p>
                </div>
              </div>
              
              {selectedProduct.ingredients && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Ingredients</h3>
                  <p>{selectedProduct.ingredients}</p>
                </div>
              )}
              
              {selectedProduct.description && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p>{selectedProduct.description}</p>
                </div>
              )}
              
              {selectedProduct.websiteUrl && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Website</h3>
                  <a href={selectedProduct.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {selectedProduct.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
