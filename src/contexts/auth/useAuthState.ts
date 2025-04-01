
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AuthState } from './types';
import { checkAdminStatus, handleAuthRedirect } from './authUtils';
import { useToast } from '@/hooks/use-toast';

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Handle auth redirect and set up auth state listener
  useEffect(() => {
    const initAuth = async () => {
      // Handle auth redirect (password reset, etc.)
      await handleAuthRedirect();

      // Set up auth state listener
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

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, [toast]);

  // Check admin status when user changes
  useEffect(() => {
    const updateAdminStatus = async () => {
      const isUserAdmin = await checkAdminStatus(user);
      setIsAdmin(isUserAdmin);
    };
    
    updateAdminStatus();
  }, [user]);

  return {
    user,
    session,
    isLoading,
    isAdmin
  };
};
