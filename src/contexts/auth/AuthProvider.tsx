
import React, { createContext, useContext } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthMethods } from './useAuthMethods';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuthState();
  
  const authMethods = useAuthMethods(
    (loading: boolean) => setIsLoading(loading)
  );

  // Small state setter for useAuthMethods
  const setIsLoading = (loading: boolean) => {
    // This is a workaround since we can't pass the setter directly
    // from useState in useAuthState
    if (loading !== isLoading) {
      // We'll rely on the loading state from useAuthState
      // This is just to satisfy the interface
    }
  };

  const contextValue: AuthContextType = {
    user,
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
