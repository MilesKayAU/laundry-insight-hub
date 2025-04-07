
import { useProductEditingState } from './useProductEditingState';
import { useProductOperations } from './useProductOperations';
import { ProductEditingHookReturn } from './types';

export * from './types';
export * from './utils';

export function useProductEditing(onSuccess?: () => void): ProductEditingHookReturn {
  const {
    isDialogOpen,
    selectedProduct,
    isSaving,
    productDetails,
    setIsDialogOpen,
    setSelectedProduct,
    setProductDetails,
    setIsSaving
  } = useProductEditingState();

  const operations = useProductOperations({
    selectedProduct,
    productDetails,
    setIsDialogOpen,
    setSelectedProduct,
    setProductDetails,
    setIsSaving,
    onSuccess
  });

  return {
    // State
    isDialogOpen,
    selectedProduct,
    isSaving,
    productDetails,
    // Actions
    ...operations
  };
}
