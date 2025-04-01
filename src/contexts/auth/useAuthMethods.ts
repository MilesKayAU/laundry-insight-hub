
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export const useAuthMethods = (
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

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
            marketing_consent: metadata?.marketingConsent || false,
            ...metadata
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

  const register = async (name: string, email: string, password: string, options?: { marketingConsent?: boolean }) => {
    return signup(email, password, { 
      name, 
      marketingConsent: options?.marketingConsent || false 
    });
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

  const sendPasswordResetEmail = async (email: string) => {
    return resetPassword(email);
  };

  return {
    login,
    signup,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    sendPasswordResetEmail
  };
};
