
// Let's check what types currently exist in this file
export interface ProductDetails {
  brand: string;
  name: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  websiteUrl: string;
  pvaPercentage: string;
  country: string;
  ingredients: string;
  pvaStatus: string;
  type: string;
}

export interface EditingState {
  isDialogOpen: boolean;
  selectedProduct: any | null;
  isSaving: boolean;
  productDetails: ProductDetails;
  setIsDialogOpen: (open: boolean) => void;
  setSelectedProduct: (product: any) => void;
  setProductDetails: (details: ProductDetails | ((prev: ProductDetails) => ProductDetails)) => void;
  setIsSaving: (saving: boolean) => void;
}

export interface ProductEditingActions {
  handleViewDetails: (product: any) => void;
  handleDetailsChange: (details: Partial<ProductDetails>) => void;
  handleSaveChanges: () => Promise<void>;
  handleDeleteProduct: (productId: string) => Promise<boolean>;
  handleAddProduct: (details: ProductDetails) => Promise<boolean>;
}

export interface ProductEditingHookReturn extends EditingState, ProductEditingActions {}
