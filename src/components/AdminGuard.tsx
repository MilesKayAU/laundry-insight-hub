
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

  const PRIMARY_ADMIN_EMAIL = 'mileskayaustralia@gmail.com';

  // Helper function to normalize email for comparison
  const normalizeEmail = (email: string): string => {
    return email ? email.toLowerCase().trim() : '';
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        console.log('AdminGuard: Not authenticated, redirecting to auth page');
        navigate('/auth', { state: { returnUrl: location.pathname } });
      } else if (user?.email) {
        const userEmail = normalizeEmail(user.email);
        // Normalize admin emails to lowercase for case-insensitive comparison
        const normalizedAdminEmails = adminEmails.map(email => normalizeEmail(email));
        
        // Special check for the primary admin email
        const isPrimaryAdmin = userEmail === normalizeEmail(PRIMARY_ADMIN_EMAIL);
        
        console.log('AdminGuard: Admin check', {
          userEmail,
          isPrimaryAdmin,
          normalizedAdminEmails,
          isEmailInList: normalizedAdminEmails.includes(userEmail)
        });
        
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

  // Determine if user should have access based on email
  const hasAdminAccess = (): boolean => {
    if (!isAuthenticated || !user?.email) return false;
    
    const userEmail = normalizeEmail(user.email);
    
    // Always allow primary admin access
    if (userEmail === normalizeEmail(PRIMARY_ADMIN_EMAIL)) {
      console.log('AdminGuard: Primary admin access granted');
      return true;
    }
    
    // Check against admin email list
    const normalizedAdminEmails = adminEmails.map(email => normalizeEmail(email));
    const hasAccess = normalizedAdminEmails.includes(userEmail);
    
    console.log('AdminGuard: Admin access check', { 
      userEmail, 
      hasAccess,
      normalizedAdminEmails
    });
    
    return hasAccess;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Render children if user has admin access
  return hasAdminAccess() ? <>{children}</> : null;
};

export default AdminGuard;
