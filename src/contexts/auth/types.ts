
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, metadata?: any) => Promise<any>;
  register: (name: string, email: string, password: string, options?: { marketingConsent?: boolean }) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<any>;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}
