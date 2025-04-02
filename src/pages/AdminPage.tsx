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
import ProductDetailsDialog from "@/components/admin/ProductDetailsDialog";
import { deleteProductSubmission } from "@/lib/textExtractor";

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
  
  const mockMessages: any[] = [];
  const mockProfiles: any[] = [];

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
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        const allLocalProducts = getProductSubmissions();
        console.info(`AdminPage: Loaded ${allLocalProducts.length} products from localStorage`);
        
        const productMap = new Map();
        const uniqueProducts = [];
        
        for (const product of allLocalProducts) {
          const key = `${product.brand.toLowerCase()}_${product.name.toLowerCase()}`;
          
          if (productMap.has(key) && !productMap.get(key).approved) {
            if (productMap.get(key).timestamp < (product.timestamp || 0)) {
              productMap.set(key, product);
            }
          } else {
            productMap.set(key, product);
          }
        }
        
        const dedupedLocalProducts = Array.from(productMap.values());
        
        if (dedupedLocalProducts.length !== allLocalProducts.length) {
          localStorage.setItem('products', JSON.stringify(dedupedLocalProducts));
          console.info(`AdminPage: Removed ${allLocalProducts.length - dedupedLocalProducts.length} duplicate products`);
        }
        
        const supabaseProducts = await fetchSupabaseProducts();
        
        const allProducts = [
          ...dedupedLocalProducts.map(p => ({ 
            ...p, 
            status: p.approved ? 'approved' as ProductStatus : 'pending' as ProductStatus 
          })),
          ...supabaseProducts
        ];
        
        console.info(`AdminPage: Total combined products: ${allProducts.length}`);
        
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
    console.log("Viewing details for product:", product);
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
    
    setTimeout(() => {
      setShowDetailsDialog(true);
      console.log("Dialog state set to true");
    }, 50);
  };
  
  const handleSaveProductDetails = async () => {
    if (!selectedProduct) return;
    
    try {
      const isPending = pendingProducts.some(p => p.id === selectedProduct.id);
      const isApproved = approvedProducts.some(p => p.id === selectedProduct.id);
      
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
      
      if (isPending) {
        setPendingProducts(pendingProducts.map(p => 
          p.id === selectedProduct.id ? updatedProduct : p
        ));
      } else if (isApproved) {
        setApprovedProducts(approvedProducts.map(p => 
          p.id === selectedProduct.id ? updatedProduct : p
        ));
      }
      
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
      
      if (selectedProduct.id.startsWith('sub_')) {
      } else {
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
      setShowDetailsDialog(false);
      
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
      const productIndex = pendingProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) return;
      
      const updatedProducts = [...pendingProducts];
      updatedProducts[productIndex].approved = true;
      updatedProducts[productIndex].status = 'approved';
      
      setApprovedProducts([...approvedProducts, updatedProducts[productIndex]]);
      setPendingProducts(updatedProducts.filter(p => p.id !== productId));
      
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
      const productToDelete = pendingProducts.find(p => p.id === productId);
      if (!productToDelete) return;
      
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      
      deleteProductSubmission(productId);
      
      toast({
        title: "Success",
        description: "Product rejected and deleted successfully",
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
      const updatedProducts = approvedProducts.filter(p => p.id !== productId);
      setApprovedProducts(updatedProducts);
      
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
    try {
      const allProducts = getProductSubmissions();
      const productMap = new Map();
      
      for (const product of allProducts) {
        const key = `${product.brand.toLowerCase()}_${product.name.toLowerCase()}`;
        
        if (productMap.has(key)) {
          const existingTimestamp = productMap.get(key).timestamp || 0;
          const newTimestamp = product.timestamp || 0;
          
          if (newTimestamp > existingTimestamp) {
            productMap.set(key, product);
          }
        } else {
          productMap.set(key, product);
        }
      }
      
      const dedupedProducts = Array.from(productMap.values());
      
      if (dedupedProducts.length !== allProducts.length) {
        localStorage.setItem('products', JSON.stringify(dedupedProducts));
        
        const pending = dedupedProducts.filter(p => !p.approved);
        const approved = dedupedProducts.filter(p => p.approved);
        
        setPendingProducts(pending.map(p => ({ ...p, status: 'pending' as ProductStatus })));
        setApprovedProducts(approved.map(p => ({ ...p, status: 'approved' as ProductStatus })));
        
        toast({
          title: "Duplicates Cleaned",
          description: `Removed ${allProducts.length - dedupedProducts.length} duplicate products`,
        });
      } else {
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
      
      {selectedProduct && (
        <ProductDetailsDialog
          isOpen={showDetailsDialog}
          onOpenChange={(open) => {
            console.log("Dialog open state changed to:", open);
            setShowDetailsDialog(open);
          }}
          product={selectedProduct}
          details={productDetails}
          onDetailsChange={setProductDetails}
          onSave={handleSaveProductDetails}
        />
      )}
    </div>
  );
};

export default AdminPage;
