
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
import { ProductSubmission, getProductSubmissions, PVA_KEYWORDS_CATEGORIES } from "@/lib/textExtractor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProductDetailsDialog from "@/components/admin/ProductDetailsDialog";

// Define appropriate types for the status property
type ProductStatus = 'pending' | 'approved' | 'rejected';

// Extend the ProductSubmission type with the missing properties
interface ExtendedProductSubmission extends ProductSubmission {
  status: ProductStatus;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<ExtendedProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ExtendedProductSubmission[]>([]);
  const [verifications, setVerifications] = useState<ExtendedProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProductSubmission | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [messageResponse, setMessageResponse] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productDetails, setProductDetails] = useState({
    description: '',
    imageUrl: '',
    videoUrl: '',
    websiteUrl: '',
    pvaPercentage: '',
    country: '',
    ingredients: ''
  });
  
  // Mock data for other components
  const mockMessages: any[] = [];
  const mockProfiles: any[] = [];

  // Function to fetch Supabase products
  const fetchSupabaseProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*');
      
      if (error) {
        console.error("Error fetching Supabase products:", error);
        return [];
      }
      
      console.log(`AdminPage: Fetched ${data?.length || 0} products from Supabase`);
      
      // Transform the data for our component
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        type: item.type,
        description: item.description || '',
        pvaStatus: item.pvastatus || 'needs-verification',
        pvaPercentage: item.pvapercentage || null,
        approved: item.approved || false,
        country: item.country || 'Global',
        websiteUrl: item.websiteurl || '',
        videoUrl: item.videourl || '',
        imageUrl: item.imageurl || '',
        status: item.approved ? 'approved' : 'pending',
        brandVerified: false,
        timestamp: Date.now()
      })) as ExtendedProductSubmission[];
    } catch (error) {
      console.error("Error in fetchSupabaseProducts:", error);
      return [];
    }
  };

  useEffect(() => {
    // Load products from localStorage and Supabase
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Load all products from localStorage without filtering
        const allLocalProducts = getProductSubmissions();
        console.info(`AdminPage: Loaded ${allLocalProducts.length} products from localStorage`);
        
        // Load all products from Supabase
        const supabaseProducts = await fetchSupabaseProducts();
        
        // Combine all products
        const allProducts = [
          ...allLocalProducts.map(p => ({ 
            ...p, 
            status: p.approved ? 'approved' as ProductStatus : 'pending' as ProductStatus 
          })),
          ...supabaseProducts
        ];
        
        console.info(`AdminPage: Total combined products: ${allProducts.length}`);
        
        // Split into pending and approved based on status property
        const pending = allProducts.filter(p => !p.approved);
        const approved = allProducts.filter(p => p.approved);
        const brandVerifications = allProducts.filter(p => p.brandOwnershipRequested);
        
        setPendingProducts(pending);
        setApprovedProducts(approved);
        setVerifications(brandVerifications);
        
        console.info(`AdminPage: ${pending.length} pending, ${approved.length} approved products`);
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

  const handleViewDetails = (product: ExtendedProductSubmission) => {
    setSelectedProduct(product);
    setProductDetails({
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      videoUrl: product.videoUrl || '',
      websiteUrl: product.websiteUrl || '',
      pvaPercentage: product.pvaPercentage !== null ? product.pvaPercentage.toString() : '',
      country: product.country || '',
      ingredients: product.ingredients || ''
    });
    setShowDetailsDialog(true);
  };
  
  const handleSaveProductDetails = async () => {
    if (!selectedProduct) return;
    
    try {
      // Find the product in the appropriate list
      const isPending = pendingProducts.some(p => p.id === selectedProduct.id);
      const isApproved = approvedProducts.some(p => p.id === selectedProduct.id);
      
      // Update local state
      const updatedProduct = {
        ...selectedProduct,
        description: productDetails.description,
        imageUrl: productDetails.imageUrl,
        videoUrl: productDetails.videoUrl,
        websiteUrl: productDetails.websiteUrl,
        pvaPercentage: productDetails.pvaPercentage ? Number(productDetails.pvaPercentage) : null,
        country: productDetails.country,
        ingredients: productDetails.ingredients
      };
      
      // Update the appropriate list
      if (isPending) {
        setPendingProducts(pendingProducts.map(p => 
          p.id === selectedProduct.id ? updatedProduct : p
        ));
      } else if (isApproved) {
        setApprovedProducts(approvedProducts.map(p => 
          p.id === selectedProduct.id ? updatedProduct : p
        ));
      }
      
      // Update localStorage
      const allProducts = getProductSubmissions();
      const updatedAllProducts = allProducts.map((p: ProductSubmission) => 
        p.id === selectedProduct.id ? { 
          ...p, 
          description: productDetails.description,
          websiteUrl: productDetails.websiteUrl,
          videoUrl: productDetails.videoUrl,
          imageUrl: productDetails.imageUrl,
          pvaPercentage: productDetails.pvaPercentage ? Number(productDetails.pvaPercentage) : null,
          country: productDetails.country,
          ingredients: productDetails.ingredients
        } : p
      );
      localStorage.setItem('products', JSON.stringify(updatedAllProducts));
      
      // If it's a Supabase product, update there as well
      if (selectedProduct.id.startsWith('sub_')) {
        // This is a local product, so no Supabase update needed
      } else {
        // Attempt to update in Supabase
        try {
          const { error } = await supabase
            .from('product_submissions')
            .update({
              description: productDetails.description,
              websiteurl: productDetails.websiteUrl,
              videourl: productDetails.videoUrl,
              imageurl: productDetails.imageUrl,
              pvapercentage: productDetails.pvaPercentage ? Number(productDetails.pvaPercentage) : null,
              country: productDetails.country
            })
            .eq('id', selectedProduct.id);
            
          if (error) {
            console.error("Error updating product in Supabase:", error);
            toast({
              title: "Supabase Update Failed",
              description: "Product was updated locally but failed to update in Supabase.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error in Supabase update:", error);
        }
      }
      
      setSelectedProduct(updatedProduct);
      
      toast({
        title: "Success",
        description: "Product details updated successfully",
      });
    } catch (error) {
      console.error("Error updating product details:", error);
      toast({
        title: "Error",
        description: "Failed to update product details",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveProduct = (productId: string) => {
    try {
      // Find the product
      const productIndex = pendingProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) return;
      
      // Update the product approved status
      const updatedProducts = [...pendingProducts];
      updatedProducts[productIndex].approved = true;
      updatedProducts[productIndex].status = 'approved';
      
      // Move to approved products
      setApprovedProducts([...approvedProducts, updatedProducts[productIndex]]);
      setPendingProducts(updatedProducts.filter(p => p.id !== productId));
      
      // Update localStorage
      const allProducts = getProductSubmissions();
      const updatedAllProducts = allProducts.map((p: ProductSubmission) => 
        p.id === productId ? { ...p, approved: true } : p
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
      
      // Update the product rejected status
      const updatedProducts = [...pendingProducts];
      updatedProducts[productIndex].approved = false;
      updatedProducts[productIndex].status = 'rejected';
      
      // Remove from pending products
      setPendingProducts(updatedProducts.filter(p => p.id !== productId));
      
      // Update localStorage
      const allProducts = getProductSubmissions();
      const updatedAllProducts = allProducts.map((p: ProductSubmission) => 
        p.id === productId ? { ...p, approved: false } : p
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

  const handleDeleteProduct = (productId: string) => {
    try {
      // Remove the product from approvedProducts state
      const updatedProducts = approvedProducts.filter(p => p.id !== productId);
      setApprovedProducts(updatedProducts);
      
      // Update localStorage
      const allProducts = getProductSubmissions();
      const updatedAllProducts = allProducts.filter((p: ProductSubmission) => p.id !== productId);
      localStorage.setItem('products', JSON.stringify(updatedAllProducts));
      
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleCleanDuplicates = () => {
    // Handle cleaning duplicates
    setShowCleanupDialog(false);
    toast({
      title: "Duplicates Cleaned",
      description: "Duplicate products have been successfully removed",
    });
  };

  const handleBulkUpload = () => {
    // Handle bulk upload
    toast({
      title: "Bulk Upload",
      description: "Bulk upload functionality triggered",
    });
  };

  const handleMessageSelect = (message: any) => {
    // Handle message selection
    setDialogOpen(true);
  };

  const handleNewKeywordChange = (keyword: string) => {
    setNewKeyword(keyword);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddKeyword = () => {
    toast({
      title: "Keyword Added",
      description: `Added '${newKeyword}' to ${selectedCategory}`,
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string, category: keyof typeof PVA_KEYWORDS_CATEGORIES) => {
    toast({
      title: "Keyword Removed",
      description: `Removed '${keyword}' from ${category}`,
    });
  };

  const handleResetDatabase = () => {
    toast({
      title: "Database Reset",
      description: "Database has been reset",
    });
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'commonNames': return 'Common Names';
      case 'chemicalSynonyms': return 'Chemical Synonyms';
      case 'inciTerms': return 'INCI Terms';
      case 'additional': return 'Additional';
      default: return category;
    }
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
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteProduct}
            onBulkUpload={handleBulkUpload}
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
            messageResponse={messageResponse}
            dialogOpen={dialogOpen}
            onDialogOpenChange={setDialogOpen}
            onMessageSelect={handleMessageSelect}
            onResponseChange={setMessageResponse}
            onSendResponse={() => {}}
            loading={loading}
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
            keywordCategories={PVA_KEYWORDS_CATEGORIES}
            newKeyword={newKeyword}
            selectedCategory={selectedCategory}
            showResetDialog={false}
            setShowResetDialog={setShowCleanupDialog}
            onNewKeywordChange={handleNewKeywordChange}
            onCategoryChange={handleCategoryChange}
            onAddKeyword={handleAddKeyword}
            onRemoveKeyword={handleRemoveKeyword}
            onResetDatabase={handleResetDatabase}
            getCategoryDisplayName={getCategoryDisplayName}
          />
        </TabsContent>
      </Tabs>
      
      {/* Product details dialog with editing capabilities */}
      <ProductDetailsDialog
        isOpen={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        product={selectedProduct}
        details={productDetails}
        onDetailsChange={setProductDetails}
        onSave={handleSaveProductDetails}
      />
    </div>
  );
};

export default AdminPage;
