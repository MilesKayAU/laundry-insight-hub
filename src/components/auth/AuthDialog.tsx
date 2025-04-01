
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetPasswordForm from './ResetPasswordForm';
import VerificationMessage from './VerificationMessage';

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

  const handleReturnToLogin = () => {
    setVerificationSent(false);
    setShowResetPassword(false);
    setResetEmailSent(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {showResetPassword ? (
          <ResetPasswordForm
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            resetEmailSent={resetEmailSent}
            isLoading={isLoading}
            handlePasswordReset={handlePasswordReset}
            onCancel={() => setShowResetPassword(false)}
            onReturn={handleReturnToLogin}
          />
        ) : verificationSent ? (
          <VerificationMessage onReturn={handleReturnToLogin} />
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                isLoading={isLoading}
                handleLogin={handleLogin}
                onForgotPassword={() => setShowResetPassword(true)}
              />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm
                registerName={registerName}
                setRegisterName={setRegisterName}
                registerEmail={registerEmail}
                setRegisterEmail={setRegisterEmail}
                registerPassword={registerPassword}
                setRegisterPassword={setRegisterPassword}
                marketingConsent={marketingConsent}
                setMarketingConsent={setMarketingConsent}
                isLoading={isLoading}
                handleRegister={handleRegister}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
