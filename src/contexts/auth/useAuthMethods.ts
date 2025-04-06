
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthMethods } from './types';

export const useAuthMethods = (
  setIsLoading: (loading: boolean) => void
): AuthMethods => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "An error occurred during sign in."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "An error occurred during sign up."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a session before trying to sign out
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If no session exists, we're already signed out, so just clear local state
        console.log('No active session found, clearing local auth state only');
        
        // Show toast to indicate successful sign out (even though we were already signed out)
        toast({
          title: "Logged out",
          description: "You've been successfully logged out.",
        });
        
        return { success: true };
      }
      
      // If we have a session, proceed with normal sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      
      // If we get an AuthSessionMissingError, treat it as a successful logout
      if (error.name === 'AuthSessionMissingError') {
        console.log('Auth session missing, considering user already logged out');
        
        toast({
          title: "Logged out",
          description: "You've been successfully logged out.",
        });
        
        return { success: true };
      }
      
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "An error occurred during sign out."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred during password reset.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "An error occurred during password reset."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      toast({
        title: "Password update failed",
        description: error.message || "An error occurred during password update.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "An error occurred during password update."
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Add alias methods to match what components are expecting
  const login = signIn;
  const logout = signOut;
  const register = signUp;
  const sendPasswordResetEmail = resetPassword;

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    // Additional alias methods
    login,
    logout,
    register,
    sendPasswordResetEmail
  };
};
