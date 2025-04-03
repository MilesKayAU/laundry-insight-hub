
-- Create a function to force delete a product by ID
CREATE OR REPLACE FUNCTION public.force_delete_product(product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.product_submissions
  WHERE id = product_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting product %: %', product_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_delete_product TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_delete_product TO service_role;
