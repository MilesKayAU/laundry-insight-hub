
-- Create or replace the has_role function to properly check user roles
CREATE OR REPLACE FUNCTION public.has_role(role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = $1
  );
END;
$$;

-- Grant usage on the has_role function to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;

-- Add PRIMARY_ADMIN special case function
CREATE OR REPLACE FUNCTION public.is_primary_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if the email matches the primary admin email
  RETURN LOWER(user_email) = LOWER('mileskayaustralia@gmail.com');
END;
$$;

-- Grant usage on the is_primary_admin function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_primary_admin() TO authenticated;

-- Update RLS policies to use either has_role or is_primary_admin
DROP POLICY IF EXISTS "Enable insert access for admins" ON public.video_categories;
DROP POLICY IF EXISTS "Enable update access for admins" ON public.video_categories;
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.video_categories;

-- Create policies that check for either admin role or primary admin
CREATE POLICY "Enable insert access for admins" 
ON public.video_categories FOR INSERT 
TO authenticated
WITH CHECK (
  public.has_role('admin') OR public.is_primary_admin()
);

CREATE POLICY "Enable update access for admins" 
ON public.video_categories FOR UPDATE 
TO authenticated
USING (
  public.has_role('admin') OR public.is_primary_admin()
);

CREATE POLICY "Enable delete access for admins" 
ON public.video_categories FOR DELETE 
TO authenticated
USING (
  public.has_role('admin') OR public.is_primary_admin()
);
