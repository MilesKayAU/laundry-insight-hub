
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
        navigate('/auth', { state: { returnUrl: location.pathname } });
      } else if (user?.email && !adminEmails.includes(user.email)) {
        // User is authenticated but not an admin
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, user, adminEmails, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Only render children if user is authenticated and is an admin
  return isAuthenticated && user?.email && adminEmails.includes(user.email) ? (
    <>{children}</>
  ) : null;
};

export default AdminGuard;
