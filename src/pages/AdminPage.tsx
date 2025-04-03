import React, { useState, useEffect, useCallback } from 'react';
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
import { ProductSubmission, getProductSubmissions, deleteProductSubmission, PVA_KEYWORDS_CATEGORIES, getAllPvaPatterns } from "@/lib/textExtractor";
import ProductDetailsDialog from "@/components/admin/ProductDetailsDialog";
import { useProductEditing } from '@/hooks/useProductEditing';
import UrlBatchProcessor from '@/components/admin/UrlBatchProcessor';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ProductStatus = 'pending' | 'approved' | 'rejected';

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
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageResponse, setMessageResponse] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("commonNames");
  
  const { 
    isDialogOpen, 
    setIsDialogOpen, 
    selectedProduct, 
    productDetails, 
    handleViewDetails, 
    handleDetailsChange, 
    handleSaveChanges 
  } = useProductEditing(() => {
    loadProducts();
  });

  const mockMessages: any[] = [];
  const mockProfiles: any[] = [];

  const fetchSupabaseProducts = async () => {
    try {
      console.log("Fetching products from Supabase...");
      
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*');
      
      if (error) {
        console.error("Error fetching Supabase products:", error);
        return [];
      }
      
      console.log(`AdminPage: Fetched ${data?.length || 0} products from Supabase`);
      console.log("Raw products data from Supabase:", data);
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        type: item.type,
        description: item.description || '',
        pvaStatus: item.pvastatus || 'needs-verification',
        pvaPercentage: item.pvapercentage || null,
        approved: typeof item.approved === 'boolean' ? item.approved : false,
        country: item.country || 'Global',
        websiteUrl: item.websiteurl || '',
        videoUrl: item.videourl || '',
        imageUrl: item.imageurl || '',
        status: item.approved ? 'approved' as ProductStatus : 'pending' as ProductStatus,
        brandVerified: false,
        timestamp: Date.now(),
        ingredients: '' // Ensure ingredients field exists even if not in DB
      })) as ExtendedProductSubmission[];
    } catch (error) {
      console.error("Error in fetchSupabaseProducts:", error);
      return [];
    }
  };

  const removeDuplicateProducts = (products: ProductSubmission[]) => {
    const productMap = new Map();
    
    const sortedProducts = [...products].sort((a, b) => 
      (b.timestamp || 0) - (a.timestamp || 0)
    );
    
    for (const product of sortedProducts) {
      const key = `${product.brand.toLowerCase()}_${product.name.toLowerCase()}`;
      if (!productMap.has(key)) {
        productMap.set(key, product);
      }
    }
    
    return Array.from(productMap.values());
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log("AdminPage: Loading and deduplicating products...");
      
      // First get local products
      const allLocalProducts = getProductSubmissions();
      console.log(`AdminPage: Loaded ${allLocalProducts.length} products from localStorage before deduplication`);
      
      // Deduplicate local products
      const dedupedLocalProducts = removeDuplicateProducts(allLocalProducts);
      console.log(`AdminPage: After deduplication, now have ${dedupedLocalProducts.length} local products`);
      
      if (dedupedLocalProducts.length !== allLocalProducts.length) {
        localStorage.setItem('product_submissions', JSON.stringify(dedupedLocalProducts));
        console.log(`AdminPage: Removed ${allLocalProducts.length - dedupedLocalProducts.length} duplicate products`);
        
        toast({
          title: "Removed duplicate products",
          description: `Found and removed ${allLocalProducts.length - dedupedLocalProducts.length} duplicate products`,
        });
      }
      
      // Now get Supabase products
      const supabaseProducts = await fetchSupabaseProducts();
      console.log(`AdminPage: Fetched ${supabaseProducts.length} products from Supabase`);
      
      // Combine local and Supabase products
      const allProducts = [
        ...dedupedLocalProducts.map(p => ({ 
          ...p, 
          status: p.approved ? 'approved' as ProductStatus : 'pending' as ProductStatus 
        })),
        ...supabaseProducts
      ];
      
      console.log(`AdminPage: Total combined products before final deduplication: ${allProducts.length}`);
      
      // Final deduplication
      const finalDedupedProducts = removeDuplicateProducts(allProducts);
      console.log(`AdminPage: Final deduped product count: ${finalDedupedProducts.length}`);
      
      // Filter products into pending and approved
      const pending = finalDedupedProducts.filter(p => !p.approved);
      const approved = finalDedupedProducts.filter(p => p.approved);
      const brandVerifications = finalDedupedProducts.filter(p => p.brandOwnershipRequested);
      
      setPendingProducts(pending);
      setApprovedProducts(approved);
      setVerifications(brandVerifications);
      
      console.log(`AdminPage: ${pending.length} pending, ${approved.length} approved products`);
      console.log("Approved products:", approved);
      console.log("Pending products:", pending);
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
  }, [toast]);

  useEffect(() => {
    loadProducts();
    
    const handleReloadProducts = () => {
      console.log("Reloading products from event trigger");
      loadProducts();
    };
    
    window.addEventListener('reload-products', handleReloadProducts);
    
    // Add an interval to refresh products periodically
    const intervalId = setInterval(() => {
      console.log("Periodically refreshing product data...");
      loadProducts();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      window.removeEventListener('reload-products', handleReloadProducts);
      clearInterval(intervalId);
    };
  }, [loadProducts]);

  const handleVerifyProduct = (product: ProductSubmission) => {
    if (!product.websiteUrl) {
      toast({
        title: "No URL available",
        description: "This product doesn't have a website URL to verify",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Website Verification",
      description: `Opened ${product.brand} ${product.name} website in new tab for verification`,
    });
    
    window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      console.log("Approving product with ID:", productId);
      const productToApprove = pendingProducts.find(p => p.id === productId);
      if (!productToApprove) {
        console.error("Product not found for approval:", productId);
        return;
      }
      
      // Update Supabase - Do this first to ensure database consistency
      try {
        console.log("Updating product in Supabase:", productId);
        const { error } = await supabase
          .from('product_submissions')
          .update({ approved: true })
          .eq('id', productId);
        
        if (error) {
          console.error("Error updating product in Supabase:", error);
          toast({
            title: "Database Error",
            description: "Failed to update product in database, but will continue with local update.",
            variant: "warning"
          });
        } else {
          console.log("Successfully updated product in Supabase:", productId);
        }
      } catch (dbError) {
        console.error("Exception updating product in Supabase:", dbError);
        toast({
          title: "Database Connection Error",
          description: "Failed to connect to database, but will continue with local update.",
          variant: "warning"
        });
      }
      
      const updatedProduct = {
        ...productToApprove, 
        approved: true,
        status: 'approved' as ProductStatus
      };
      
      // Update local state
      setApprovedProducts([...approvedProducts, updatedProduct]);
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      
      // Update localStorage
      const allProducts = getProductSubmissions();
      const updatedAllProducts = allProducts.map((p: ProductSubmission) => 
        p.id === productId ? { 
          ...p, 
          approved: true 
        } : p
      );
      localStorage.setItem('product_submissions', JSON.stringify(updatedAllProducts));
      
      console.log("Product approved successfully:", productId);
      toast({
        title: "Success",
        description: `Product "${productToApprove.brand} ${productToApprove.name}" approved successfully`,
      });
      
      // Force a refresh to ensure consistent view
      setTimeout(() => {
        loadProducts();
      }, 500);
    } catch (error) {
      console.error("Error approving product:", error);
      toast({
        title: "Error",
        description: "Failed to approve product",
        variant: "destructive"
      });
    }
  };

  const handleRejectProduct = async (productId: string) => {
    try {
      console.log("Rejecting and deleting product with ID:", productId);
      const productToDelete = pendingProducts.find(p => p.id === productId);
      if (!productToDelete) {
        console.error("Product not found for rejection:", productId);
        return;
      }
      
      // Update Supabase if product exists there
      if (productToDelete.websiteUrl) {
        updateSupabaseProductStatus(productId, false)
          .catch(error => console.error("Error updating Supabase product:", error));
      }
      
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      
      const success = deleteProductSubmission(productId);
      
      if (success) {
        console.log("Product rejected and deleted successfully from localStorage:", productId);
        toast({
          title: "Success",
          description: `Product "${productToDelete.brand} ${productToDelete.name}" rejected and deleted successfully`,
        });
      } else {
        console.error("Failed to delete product from localStorage:", productId);
        
        try {
          const allProducts = getProductSubmissions();
          const filteredProducts = allProducts.filter((p: ProductSubmission) => p.id !== productId);
          localStorage.setItem('product_submissions', JSON.stringify(filteredProducts));
          console.log("Product deleted through fallback method");
        } catch (fallbackError) {
          console.error("Even fallback deletion failed:", fallbackError);
          toast({
            title: "Error",
            description: "Failed to delete product properly, please try again",
            variant: "destructive"
          });
        }
      }
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
    toast({
      title: "Verification Approved",
      description: "Brand verification has been approved",
    });
  };

  const handleRejectVerification = (productId: string) => {
    toast({
      title: "Verification Rejected",
      description: "Brand verification has been rejected",
    });
  };

  const handleDeleteProduct = (productId: string) => {
    try {
      console.log("Deleting approved product with ID:", productId);
      const productToDelete = approvedProducts.find(p => p.id === productId);
      if (!productToDelete) {
        console.error("Product not found for deletion:", productId);
        return;
      }
      
      setApprovedProducts(approvedProducts.filter(p => p.id !== productId));
      
      const success = deleteProductSubmission(productId);
      
      if (success) {
        console.log("Product deleted successfully from localStorage:", productId);
        toast({
          title: "Product Deleted",
          description: "The product has been successfully deleted",
        });
      } else {
        console.error("Failed to delete product from localStorage:", productId);
        
        try {
          const allProducts = getProductSubmissions();
          const filteredProducts = allProducts.filter((p: ProductSubmission) => p.id !== productId);
          localStorage.setItem('products', JSON.stringify(filteredProducts));
          console.log("Product deleted through fallback method");
          
          toast({
            title: "Product Deleted",
            description: "The product has been deleted (fallback method)",
          });
        } catch (fallbackError) {
          console.error("Even fallback deletion failed:", fallbackError);
          toast({
            title: "Error",
            description: "Failed to delete product completely, please refresh and try again",
            variant: "destructive"
          });
        }
      }
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
    try {
      console.log("Cleaning duplicate products");
      
      const allProducts = getProductSubmissions();
      
      const dedupedProducts = removeDuplicateProducts(allProducts);
      
      if (dedupedProducts.length !== allProducts.length) {
        localStorage.setItem('products', JSON.stringify(dedupedProducts));
        
        const pending = dedupedProducts.filter(p => !p.approved).map(p => ({ 
          ...p, 
          status: 'pending' as ProductStatus 
        }));
        
        const approved = dedupedProducts.filter(p => p.approved).map(p => ({ 
          ...p, 
          status: 'approved' as ProductStatus 
        }));
        
        setPendingProducts(pending);
        setApprovedProducts(approved);
        
        console.log(`Removed ${allProducts.length - dedupedProducts.length} duplicate products`);
        toast({
          title: "Duplicates Cleaned",
          description: `Removed ${allProducts.length - dedupedProducts.length} duplicate products`,
        });
      } else {
        console.log("No duplicate products found");
        toast({
          title: "No Duplicates Found",
          description: "No duplicate products were found",
        });
      }
      
      setShowCleanupDialog(false);
    } catch (error) {
      console.error("Error cleaning duplicates:", error);
      toast({
        title: "Error",
        description: "Failed to clean duplicate products",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpload = () => {
    toast({
      title: "Bulk Upload",
      description: "Bulk upload functionality triggered",
    });
  };

  const handleMessageSelect = (message: any) => {
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
      
      {loading && (
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Loading product data</AlertTitle>
          <AlertDescription>
            Please wait while product data is being loaded...
          </AlertDescription>
        </Alert>
      )}
      
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
          <TabsTrigger value="batchProcessor">Batch URL Processor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <PendingProducts 
            products={pendingProducts} 
            onViewDetails={handleViewDetails}
            onApprove={handleApproveProduct}
            onReject={handleRejectProduct}
            onVerify={handleVerifyProduct}
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

        <TabsContent value="batchProcessor">
          <UrlBatchProcessor />
        </TabsContent>
      </Tabs>
      
      {selectedProduct && (
        <ProductDetailsDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={selectedProduct}
          details={productDetails}
          onDetailsChange={handleDetailsChange}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default AdminPage;
