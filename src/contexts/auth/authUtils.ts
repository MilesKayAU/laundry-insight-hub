
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const PRIMARY_ADMIN_EMAIL = 'mileskayaustralia@gmail.com';

export const checkAdminStatus = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  // Special case for the primary admin
  if (user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase().trim()) {
    console.log('AuthContext: Primary admin identified');
    return true;
  }
  
  try {
    // Use the has_role function to check if user has admin role
    const { data, error } = await supabase.rpc('has_role', {
      role: 'admin'
    });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
};

export const handleAuthRedirect = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  // Handle auth redirects (e.g., after password reset)
  const hash = window.location.hash;
  
  if (hash && (hash.includes('access_token') || hash.includes('error'))) {
    // Using the new method to handle URL auth
    const { data, error } = await supabase.auth.getSession();
    console.log('Auth redirect processed', { data, error });
  }
};
