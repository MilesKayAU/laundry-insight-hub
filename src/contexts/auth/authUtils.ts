
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const handleAuthRedirect = async () => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');
  
  if (accessToken && refreshToken && type === 'recovery') {
    return await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
  
  return { data: null, error: null };
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const checkAdminStatus = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    const PRIMARY_ADMIN_EMAIL = 'mileskayaustralia@gmail.com';
    
    // Quick check for primary admin email
    if (user.email === PRIMARY_ADMIN_EMAIL) {
      console.log('AuthContext: Primary admin identified');
      return true;
    }
    
    // Use the has_role RPC function to avoid recursion
    const { data, error } = await supabase.rpc('has_role', {
      role: 'admin'
    });
    
    if (error) {
      console.error('AuthContext: Error checking admin status with has_role function', error);
      throw error;
    }
    
    console.log('AuthContext: Admin check result using has_role:', data);
    return !!data;
  } catch (error) {
    console.error('AuthContext: Error checking admin status', error);
    return false;
  }
};
