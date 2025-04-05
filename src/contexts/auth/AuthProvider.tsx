
import React, { createContext, useContext, useState } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthMethods } from './useAuthMethods';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState(false);
  const { user, session, isLoading: authStateLoading, isAdmin } = useAuthState();
  
  const authMethods = useAuthMethods(
    (loading: boolean) => setLoadingState(loading)
  );

  // Combine loading states
  const isLoading = authStateLoading || loadingState;

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    ...authMethods
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
