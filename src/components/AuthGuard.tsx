
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page with return URL
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "default",
      });
      navigate('/auth', { state: { returnUrl: location.pathname } });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  // Render children if user is authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
