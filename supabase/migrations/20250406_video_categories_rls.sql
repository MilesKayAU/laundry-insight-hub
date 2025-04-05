
-- Enable RLS on video_categories
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view video categories
CREATE POLICY "Enable read access for all users" 
ON public.video_categories FOR SELECT 
TO authenticated, anon
USING (true);

-- Fix RLS policies for video_categories to use the non-recursive approach
DROP POLICY IF EXISTS "Enable insert access for admins" ON public.video_categories;
DROP POLICY IF EXISTS "Enable update access for admins" ON public.video_categories;
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.video_categories;

-- Create policies for administering video categories
CREATE POLICY "Enable insert access for admins" 
ON public.video_categories FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ) OR (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) = 'mileskayaustralia@gmail.com'
);

CREATE POLICY "Enable update access for admins" 
ON public.video_categories FOR UPDATE 
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ) OR (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) = 'mileskayaustralia@gmail.com'
);

CREATE POLICY "Enable delete access for admins" 
ON public.video_categories FOR DELETE 
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ) OR (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) = 'mileskayaustralia@gmail.com'
);
