
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, metadata?: any) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('Error setting session from redirect:', error);
          toast({
            title: "Authentication error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication successful",
            description: "You've been successfully authenticated.",
          });
        }
      }
    };

    handleAuthRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "You've successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Logged out",
            description: "You've been successfully logged out.",
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const PRIMARY_ADMIN_EMAIL = 'mileskayaustralia@gmail.com';
          
          // Quick check for primary admin email
          if (user.email === PRIMARY_ADMIN_EMAIL) {
            console.log('AuthContext: Primary admin identified');
            setIsAdmin(true);
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
            console.error('AuthContext: Error checking admin status', error);
          }
          
          const hasAdminRole = !!data;
          console.log('AuthContext: Admin check result', { data, isAdmin: hasAdminRole });
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error('AuthContext: Error checking admin status', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    try {
      const domain = window.location.origin;
      
      const skipEmailConfirmation = false;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.name,
            username: email.split('@')[0],
          },
          emailRedirectTo: `${domain}/auth`,
        }
      });

      if (error) {
        throw error;
      }
      
      if (!skipEmailConfirmation) {
        toast({
          title: "Account created!",
          description: "Your account has been successfully created. Please check your email for verification.",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Your account has been successfully created and you can log in now.",
        });
      }
      
      console.log("Registration response:", data);
      
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "Email already exists",
          description: "This email is already registered. Please try logging in instead.",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast({
        title: "Google login failed",
        description: error.message || "There was an error signing in with Google.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "There was an error sending the password reset email.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider 
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
