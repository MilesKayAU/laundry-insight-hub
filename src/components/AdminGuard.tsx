
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  // Primary admin email as a fallback
  const PRIMARY_ADMIN_EMAIL = 'mileskayaustralia@gmail.com';

  // Helper function to normalize email for comparison
  const normalizeEmail = (email: string): string => {
    return email ? email.toLowerCase().trim() : '';
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoading && isAuthenticated && user) {
        try {
          // Special case for primary admin
          if (normalizeEmail(user.email || '') === normalizeEmail(PRIMARY_ADMIN_EMAIL)) {
            console.log('AdminGuard: Primary admin access granted');
            setIsAdmin(true);
            setCheckingAdmin(false);
            return;
          }
          
          // Check user_roles table
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('AdminGuard: Error checking admin status', error);
          }
          
          setIsAdmin(!!data);
          console.log('AdminGuard: Admin check result', { data, isAdmin: !!data });
        } catch (error) {
          console.error('AdminGuard: Error checking admin status', error);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (!isLoading && !checkingAdmin) {
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        console.log('AdminGuard: Not authenticated, redirecting to auth page');
        navigate('/auth', { state: { returnUrl: location.pathname } });
      } else if (!isAdmin) {
        // User is authenticated but not an admin
        console.log('AdminGuard: User is not an admin', { userId: user?.id });
        
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      } else {
        console.log('AdminGuard: User is an admin', { userId: user?.id });
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, checkingAdmin, navigate, location.pathname, user, toast]);

  if (isLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Render children if user has admin access
  return isAdmin ? <>{children}</> : null;
};

export default AdminGuard;
