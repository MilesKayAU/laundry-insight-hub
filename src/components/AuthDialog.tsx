
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

type AuthDialogProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
};

const AuthDialog: React.FC<AuthDialogProps> = ({ children, onSuccess }) => {
  const { login, register, isLoading, sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  // Verification state
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Reset password state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handled in the AuthContext
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerName, registerEmail, registerPassword, { marketingConsent });
      setVerificationSent(true);
    } catch (error) {
      // Error handled in the AuthContext
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(resetEmail);
      setResetEmailSent(true);
    } catch (error) {
      // Error handled in the AuthContext
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {showResetPassword ? (
          <div className="space-y-4 py-4">
            {resetEmailSent ? (
              <>
                <DialogHeader>
                  <DialogTitle>Check Your Email</DialogTitle>
                  <DialogDescription>
                    We've sent a password reset link to your email address.
                  </DialogDescription>
                </DialogHeader>
                <Alert>
                  <AlertDescription>
                    Please check your inbox and click the link to reset your password.
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmailSent(false);
                    }}
                  >
                    Return to Login
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordReset}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowResetPassword(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )}
          </div>
        ) : verificationSent ? (
          <div className="space-y-4 py-4">
            <DialogHeader>
              <DialogTitle>Check Your Email</DialogTitle>
              <DialogDescription>
                We've sent a verification link to your email address.
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <AlertDescription>
                Please check your inbox and click the link to verify your account. 
                After verification, you can return here to log in.
              </AlertDescription>
            </Alert>
            <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertDescription>
                <strong>Development Note:</strong> If you're not receiving emails, you may need to configure your Supabase email settings or temporarily disable email confirmation in AuthContext.tsx.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={() => setVerificationSent(false)}>
                Return to Login
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <DialogHeader>
                  <DialogTitle>Login to your account</DialogTitle>
                  <DialogDescription>
                    Login to access advanced contribution features.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
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
                  <div className="text-right">
                    <Button 
                      variant="link" 
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="p-0 h-auto"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <DialogHeader>
                  <DialogTitle>Create an account</DialogTitle>
                  <DialogDescription>
                    Register to contribute multiple items and access more features.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
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
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="marketing-consent" 
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                    />
                    <Label 
                      htmlFor="marketing-consent" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      I consent to receiving occasional emails about PVAFree updates and news
                    </Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
