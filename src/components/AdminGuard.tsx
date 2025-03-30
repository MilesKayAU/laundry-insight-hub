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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Special admin emails - keep this as a direct check to avoid RPC failures
  const ADMIN_EMAILS = ['mileskayaustralia@gmail.com'];
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsAdminLoading(false);
        return;
      }

      console.log("AdminGuard: Checking admin status for user:", user.email);
      
      // 1. First check if the user is in our hardcoded admin list
      const isSpecialAdmin = user.email && 
        ADMIN_EMAILS.includes(user.email.toLowerCase());
      
      if (isSpecialAdmin) {
        console.log("AdminGuard: User is special admin, granting access");
        setIsAdmin(true);
        setIsAdminLoading(false);
        return;
      }

      // 2. Then try the RPC method as fallback
      try {
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        
        if (error) {
          console.error("Error checking admin role:", error);
          // If there's an error but we already know it's a special admin, allow access
          if (isSpecialAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          console.log("AdminGuard: Admin RPC result:", data);
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Exception in admin check:", err);
        // If exception but the user is a special admin, still grant access
        if (isSpecialAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setIsAdminLoading(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      checkAdminStatus();
    } else {
      setIsAdminLoading(false);
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (!isLoading && !isAdminLoading) {
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        console.log("AdminGuard: User not authenticated, redirecting to login");
        navigate('/auth', { state: { returnUrl: location.pathname } });
      } else if (!isAdmin) {
        // User is authenticated but not an admin
        console.log("AdminGuard: User not admin, access denied");
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      } else {
        console.log("AdminGuard: Access granted to admin area");
      }
    }
  }, [isAuthenticated, isLoading, isAdminLoading, navigate, location.pathname, isAdmin, toast]);

  // Show loading while checking authentication or admin status
  if (isLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Only render children if user is authenticated and is an admin
  return (isAuthenticated && isAdmin) ? <>{children}</> : null;
};

export default AdminGuard;
