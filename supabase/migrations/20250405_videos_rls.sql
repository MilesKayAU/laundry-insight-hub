
-- First, enable Row Level Security on videos table if not already enabled
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on the table to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.videos;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.videos;

-- Create a policy that allows all users to read videos
CREATE POLICY "Enable read access for all users" 
ON public.videos FOR SELECT 
TO authenticated, anon
USING (true);

-- Create a policy that allows authenticated users with admin role to insert videos
CREATE POLICY "Enable insert access for admins" 
ON public.videos FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create a policy that allows authenticated users with admin role to update videos
CREATE POLICY "Enable update access for admins" 
ON public.videos FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create a policy that allows authenticated users with admin role to delete videos
CREATE POLICY "Enable delete access for admins" 
ON public.videos FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
