
import { User, Session } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string | null;
}

export interface AuthMethods {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
}

export interface AuthState {
  user: User | null;
  session?: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface AuthContextType extends AuthState, AuthMethods {
  isAuthenticated: boolean;
}
