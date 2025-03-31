import React, {
  useState,
  useEffect,
  useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  // These are needed by the AuthDialog.tsx component:
  register: boolean;
  setRegister: (value: boolean) => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  register: false,
  setRegister: () => {},
  sendPasswordResetEmail: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [register, setRegister] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if the current user has the admin role
  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking user role:", error);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      return false;
    }
  };

  // Initialize the auth state
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Check if the user is an admin
          const isUserAdmin = await checkUserRole(session.user.id);
          setIsAdmin(isUserAdmin);
          
          console.info("Auth state changed: AUTHENTICATED" + (isUserAdmin ? " (ADMIN)" : ""));
        } else {
          setUser(null);
          setIsAdmin(false);
          console.info("Auth state changed: UNAUTHENTICATED");
        }
      } catch (error: any) {
        console.error("Error initializing auth:", error.message);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize authentication. Please try again later.",
          variant: "destructive",
        });
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info("Auth state changed:", event);
      
      if (session?.user) {
        setUser(session.user);
        
        // Check if the user is an admin
        const isUserAdmin = await checkUserRole(session.user.id);
        setIsAdmin(isUserAdmin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Check if the user is an admin
        const isUserAdmin = await checkUserRole(data.user.id);
        setIsAdmin(isUserAdmin);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Redirect based on the returnUrl or default to homepage
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        navigate(returnUrl || '/');
      }
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Created",
        description: "Your account has been successfully created. Please check your email for verification.",
      });

      // For demo purposes, may want to auto-sign in
      if (data?.user) {
        setUser(data.user);
        navigate('/');
      }
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account. Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setIsAdmin(false);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Send password reset email
  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error.message);
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to send password reset email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        user,
        signIn,
        signUp,
        signOut,
        register,
        setRegister,
        sendPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
