
import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface LoginFormProps {
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  isLoading: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  isLoading,
  handleLogin,
  onForgotPassword
}) => {
  return (
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
            onClick={onForgotPassword}
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
  );
};

export default LoginForm;
