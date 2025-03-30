
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsAdmin } from '@/hooks/use-blog';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Manual admin override for specific email
  const isAdminOverride = user?.email?.toLowerCase() === 'mileskayaustralia@gmail.com';

  // Force admin for our special user
  const isForcedAdmin = isAdminOverride;

  useEffect(() => {
    // Log admin status information for debugging
    if (user) {
      console.log("AdminGuard: User email:", user.email);
      console.log("AdminGuard: isAdmin from hook:", isAdmin);
      console.log("AdminGuard: isAdminOverride:", isAdminOverride);
      console.log("AdminGuard: isForcedAdmin:", isForcedAdmin);
    }
    
    if (!isLoading && !isAdminLoading) {
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        console.log("AdminGuard: User not authenticated, redirecting to login");
        navigate('/auth', { state: { returnUrl: location.pathname } });
      } else if (!isAdmin && !isForcedAdmin) {
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
  }, [isAuthenticated, isLoading, isAdminLoading, navigate, location.pathname, isAdmin, toast, user, isAdminOverride, isForcedAdmin]);

  // Show loading while checking authentication or admin status
  if (isLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Special case: if the user is our known admin, always allow access
  if (isForcedAdmin) {
    console.log("AdminGuard: Using forced admin access for special user");
    return <>{children}</>;
  }

  // If there was an error checking admin status but email is the admin email, allow access
  if (adminError && isAdminOverride) {
    console.log("AdminGuard: Using admin override due to error:", adminError);
    return <>{children}</>;
  }

  // Only render children if user is authenticated and is an admin (or has admin override)
  return (isAuthenticated && (isAdmin || isAdminOverride)) ? <>{children}</> : null;
};

export default AdminGuard;
