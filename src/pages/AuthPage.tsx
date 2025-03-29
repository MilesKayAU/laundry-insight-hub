
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Microscope } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthPage = () => {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Verification state
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Get the return URL from location state
  const returnUrl = location.state?.returnUrl || '/';
  
  // Check if we have a hash in the URL (for auth redirects)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('error')) {
      // This is an auth redirect, let AuthContext handle it
      console.log('Auth redirect detected in AuthPage');
    }
  }, []);
  
  useEffect(() => {
    // If user is already authenticated, redirect to the return URL
    if (isAuthenticated) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginEmail, loginPassword);
      // Navigation happens in useEffect when isAuthenticated changes
    } catch (error: any) {
      // Error is handled in the AuthContext
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(registerName, registerEmail, registerPassword);
      setVerificationSent(true);
      // Navigation happens in useEffect when isAuthenticated changes
    } catch (error: any) {
      // Error is handled in the AuthContext
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-science-500 to-tech-500">
              <Microscope className="h-6 w-6 text-white absolute" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-science-700 to-tech-600 bg-clip-text text-transparent">
              PVAFree
            </span>
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          {verificationSent ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Check Your Email</h2>
              <Alert>
                <AlertDescription>
                  We've sent a verification link to your email. Please check your inbox and click the link to verify your account.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-500 text-center">
                After verification, you can return here to log in.
              </p>
              <Button 
                onClick={() => setVerificationSent(false)} 
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Name</Label>
                      <Input 
                        id="register-name" 
                        placeholder="Your name" 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
