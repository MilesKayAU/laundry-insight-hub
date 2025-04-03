
-- Create a function to force delete a product by ID
CREATE OR REPLACE FUNCTION public.force_delete_product(product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_row RECORD;
BEGIN
  -- Attempt to directly delete the row and return it
  DELETE FROM public.product_submissions
  WHERE id = product_id
  RETURNING * INTO deleted_row;
  
  -- Check if we actually deleted something
  IF deleted_row IS NOT NULL THEN
    RAISE NOTICE 'Successfully deleted product %', product_id;
    RETURN TRUE;
  ELSE
    RAISE WARNING 'Product % not found or could not be deleted', product_id;
    RETURN FALSE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error deleting product %: %', product_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_delete_product TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_delete_product TO service_role;
