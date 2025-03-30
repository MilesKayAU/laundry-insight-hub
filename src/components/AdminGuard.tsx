
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminGuardProps {
  children: React.ReactNode;
  adminEmails?: string[];
}

const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  adminEmails = ['mileskayaustralia@gmail.com'] 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        console.log('AdminGuard: Not authenticated, redirecting to auth page');
        navigate('/auth', { state: { returnUrl: location.pathname } });
      } else if (user?.email) {
        const userEmail = user.email.toLowerCase();
        // Normalize admin emails to lowercase for case-insensitive comparison
        const normalizedAdminEmails = adminEmails.map(email => email.toLowerCase());
        
        // Special check for the primary admin email
        const isPrimaryAdmin = userEmail === 'mileskayaustralia@gmail.com'.toLowerCase();
        
        if (!normalizedAdminEmails.includes(userEmail) && !isPrimaryAdmin) {
          // User is authenticated but not an admin
          console.log('AdminGuard: User is not an admin', {
            userEmail,
            adminEmails: normalizedAdminEmails,
            isPrimaryAdmin
          });
          
          toast({
            title: "Access denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          navigate('/');
        } else {
          console.log('AdminGuard: User is an admin', {
            userEmail,
            isPrimaryAdmin
          });
        }
      } else {
        console.log('AdminGuard: User has no email, redirecting to home');
        toast({
          title: "Access denied",
          description: "You need to sign in with an email to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, user, adminEmails, toast]);

  // Force access for primary admin email even if another check fails
  const forceAccessForPrimaryAdmin = () => {
    if (user?.email?.toLowerCase() === 'mileskayaustralia@gmail.com'.toLowerCase()) {
      console.log('AdminGuard: Forcing access for primary admin');
      return true;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Render children if:
  // 1. User is authenticated AND
  // 2. Either user's email is in adminEmails OR user's email is mileskayaustralia@gmail.com
  const shouldRenderChildren = isAuthenticated && (
    (user?.email && adminEmails.map(email => email.toLowerCase()).includes(user.email.toLowerCase())) ||
    forceAccessForPrimaryAdmin()
  );

  return shouldRenderChildren ? <>{children}</> : null;
};

export default AdminGuard;
