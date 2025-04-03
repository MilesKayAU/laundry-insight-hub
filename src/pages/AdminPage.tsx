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
import { forceProductRefresh, invalidateProductCache } from "@/utils/supabaseUtils";

type ProductStatus = 'pending' | 'approved' | 'rejected';

interface ExtendedProductSubmission extends ProductSubmission {
  status: ProductStatus;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<ExtendedProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ExtendedProductSubmission[]>([]);
  const [localProducts, setLocalProducts] = useState<ExtendedProductSubmission[]>([]);
  const [verifications, setVerifications] = useState<ExtendedProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
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
    handleSaveChanges,
    handleDeleteProduct: hookDeleteProduct 
  } = useProductEditing(() => {
    console.log("Product edit success callback triggered");
    loadProducts();
    window.dispatchEvent(new Event('reload-products'));
  });

  const mockMessages: any[] = [];
  const mockProfiles: any[] = [];

  const updateSupabaseProductStatus = async (productId: string, isApproved: boolean): Promise<boolean> => {
    try {
      console.log(`Updating Supabase product ${productId} approval status to: ${isApproved}`);
      
      const { error } = await supabase
        .from('product_submissions')
        .update({ approved: isApproved })
        .eq('id', productId);
      
      if (error) {
        console.error("Error updating product in Supabase:", error);
        toast({
          title: "Database Error",
          description: "Failed to update product in database, but will continue with local update.",
          variant: "warning"
        });
        return false;
      }
      
      console.log(`Successfully updated product ${productId} in Supabase to ${isApproved ? 'approved' : 'rejected'}`);
      return true;
    } catch (dbError) {
      console.error("Exception updating product in Supabase:", dbError);
      toast({
        title: "Database Connection Error",
        description: "Failed to connect to database, but will continue with local update.",
        variant: "warning"
      });
      return false;
    }
  };

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
      
      const allLocalProducts = getProductSubmissions();
      console.log(`AdminPage: Loaded ${allLocalProducts.length} products from localStorage before deduplication`);
      
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
      
      const supabaseProducts = await fetchSupabaseProducts();
      console.log(`AdminPage: Fetched ${supabaseProducts.length} products from Supabase`);
      
      const allProducts = [
        ...dedupedLocalProducts.map(p => ({ 
          ...p, 
          status: p.approved ? 'approved' as ProductStatus : 'pending' as ProductStatus 
        })),
        ...supabaseProducts
      ];
      
      console.log(`AdminPage: Total combined products before final deduplication: ${allProducts.length}`);
      
      const finalDedupedProducts = removeDuplicateProducts(allProducts);
      console.log(`AdminPage: Final deduped product count: ${finalDedupedProducts.length}`);
      
      const pending = finalDedupedProducts.filter(p => !p.approved);
      const approved = finalDedupedProducts.filter(p => p.approved);
      const brandVerifications = finalDedupedProducts.filter(p => p.brandOwnershipRequested);
      
      setPendingProducts(pending);
      setApprovedProducts(approved);
      setLocalProducts(approved);
      setVerifications(brandVerifications);
      
      console.log(`AdminPage: ${pending.length} pending, ${approved.length} approved products`);
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
    
    const intervalId = setInterval(() => {
      console.log("Periodically refreshing product data...");
      loadProducts();
    }, 30000);
    
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
      
      await updateSupabaseProductStatus(productId, true);
      
      const updatedProduct = {
        ...productToApprove, 
        approved: true,
        status: 'approved' as ProductStatus
      };
      
      setApprovedProducts([...approvedProducts, updatedProduct]);
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      
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

  const handleDeleteProduct = async (productId: string) => {
    if (deletingProductId !== null) {
      console.log("Delete operation already in progress, ignoring request");
      return; // Prevent multiple simultaneous deletions
    }

    try {
      setDeletingProductId(productId);
      console.log("Deleting approved product with ID:", productId);
      
      const previousProducts = [...localProducts];
      
      setLocalProducts(prev => prev.filter(p => p.id !== productId));
      setApprovedProducts(prev => prev.filter(p => p.id !== productId));
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Delete operation timed out")), 10000); // 10 second timeout
      });
      
      const deleteSuccess = await Promise.race([
        hookDeleteProduct(productId),
        timeoutPromise
      ]).catch(error => {
        console.error("Delete operation failed or timed out:", error);
        return false;
      });
      
      if (deleteSuccess) {
        console.log("Product deleted successfully:", productId);
        toast({
          title: "Product Deleted",
          description: "The product has been successfully deleted",
        });
        
        try {
          invalidateProductCache(); 
          await new Promise(resolve => setTimeout(resolve, 300));
          forceProductRefresh();
          await new Promise(resolve => setTimeout(resolve, 300));
          await loadProducts();
        } catch (refreshError) {
          console.error("Error refreshing data after delete:", refreshError);
          toast({
            title: "Warning",
            description: "Product was deleted, but the list may need refreshing",
            variant: "warning"
          });
        }
      } else {
        console.error("Failed to delete product:", productId);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
        
        setLocalProducts(previousProducts);
        setApprovedProducts(prev => 
          prev.filter(p => p.id !== productId).concat(
            previousProducts.filter(p => p.id === productId)
          )
        );
      }
    } catch (error) {
      console.error("Error in handleDeleteProduct:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product",
        variant: "destructive"
      });
      
      loadProducts().catch(e => console.error("Failed to reload products after error:", e));
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeletePendingProduct = async (productId: string) => {
    if (deletingProductId !== null) {
      console.log("Delete operation already in progress, ignoring request");
      return; // Prevent multiple simultaneous deletions
    }
    
    try {
      setDeletingProductId(productId);
      console.log("Deleting pending product with ID:", productId);
      
      const previousProducts = [...pendingProducts];
      
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Delete operation timed out")), 10000); // 10 second timeout
      });
      
      const deleteSuccess = await Promise.race([
        hookDeleteProduct(productId),
        timeoutPromise
      ]).catch(error => {
        console.error("Delete operation failed or timed out:", error);
        return false;
      });
      
      if (deleteSuccess) {
        console.log("Pending product deleted successfully:", productId);
        toast({
          title: "Product Deleted",
          description: "The pending product has been successfully deleted",
        });
        
        try {
          invalidateProductCache();
          await new Promise(resolve => setTimeout(resolve, 300));
          forceProductRefresh();
          await new Promise(resolve => setTimeout(resolve, 300));
          await loadProducts();
        } catch (refreshError) {
          console.error("Error refreshing data after delete:", refreshError);
          toast({
            title: "Warning",
            description: "Product was deleted, but the list may need refreshing",
            variant: "warning"
          });
        }
      } else {
        console.error("Failed to delete pending product:", productId);
        toast({
          title: "Error",
          description: "Failed to delete pending product",
          variant: "destructive"
        });
        
        setPendingProducts(previousProducts);
      }
    } catch (error) {
      console.error("Error in handleDeletePendingProduct:", error);
      toast({
        title: "Error",
        description: "Failed to delete pending product completely",
        variant: "destructive"
      });
      
      loadProducts().catch(e => console.error("Failed to reload products after error:", e));
    } finally {
      setDeletingProductId(null);
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

  const filteredApprovedProducts = localProducts.filter(product => 
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
            onDelete={handleDeletePendingProduct}
            deletingProductId={deletingProductId}
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
            deletingProductId={deletingProductId}
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
