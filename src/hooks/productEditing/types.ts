
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
  pvaStatus: 'contains' | 'verified-free' | 'needs-verification' | 'inconclusive';
  type: string;
}

export interface EditingState {
  isDialogOpen: boolean;
  selectedProduct: any | null;
  isSaving: boolean;
  productDetails: ProductDetails;
}

export interface ProductEditingActions {
  setIsDialogOpen: (open: boolean) => void;
  handleViewDetails: (product: any) => void;
  handleDetailsChange: (details: Partial<ProductDetails>) => void;
  handleSaveChanges: () => Promise<void>;
  handleDeleteProduct: (productId: string) => Promise<boolean>;
}

export type ProductEditingHookReturn = EditingState & ProductEditingActions;
