
import { useState } from 'react';
import { ProductDetails, EditingState } from './types';
import { mapProductToDetails } from './utils';
import { useToast } from '@/hooks/use-toast';

export function useProductEditingState(): EditingState & {
  setSelectedProduct: (product: any) => void;
  setProductDetails: (details: ProductDetails) => void;
  setIsSaving: (saving: boolean) => void;
} {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    brand: '',
    name: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    websiteUrl: '',
    pvaPercentage: '',
    country: '',
    ingredients: '',
    pvaStatus: 'needs-verification',
    type: ''
  });

  return {
    // State
    isDialogOpen,
    selectedProduct,
    isSaving,
    productDetails,
    // Setters
    setIsDialogOpen,
    setSelectedProduct,
    setProductDetails,
    setIsSaving
  };
}
