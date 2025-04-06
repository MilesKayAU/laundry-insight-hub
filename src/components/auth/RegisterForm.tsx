
import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Recaptcha from "@/components/ui/recaptcha";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegisterFormProps {
  registerName: string;
  setRegisterName: (name: string) => void;
  registerEmail: string;
  setRegisterEmail: (email: string) => void;
  registerPassword: string;
  setRegisterPassword: (password: string) => void;
  marketingConsent: boolean;
  setMarketingConsent: (consent: boolean) => void;
  isLoading: boolean;
  handleRegister: (e: React.FormEvent) => Promise<void>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  registerName,
  setRegisterName,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  marketingConsent,
  setMarketingConsent,
  isLoading,
  handleRegister
}) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      setErrorMessage("Please complete the CAPTCHA verification");
      return;
    }
    
    if (!ageVerified) {
      setErrorMessage("You must confirm that you are at least 16 years old");
      return;
    }
    
    setErrorMessage(null);
    await handleRegister(e);
  };
  
  return (
    <form onSubmit={handleFormSubmit}>
      <DialogHeader>
        <DialogTitle>Create an account</DialogTitle>
        <DialogDescription>
          Register to contribute multiple items and access more features.
        </DialogDescription>
      </DialogHeader>
      
      {errorMessage && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
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
            id="age-verification" 
            checked={ageVerified}
            onCheckedChange={(checked) => setAgeVerified(checked === true)}
          />
          <Label 
            htmlFor="age-verification" 
            className="text-sm font-normal cursor-pointer"
          >
            I confirm that I am at least 16 years old
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
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
        
        <div className="mt-2">
          <Recaptcha onChange={setRecaptchaToken} />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="submit" 
          disabled={isLoading || !recaptchaToken || !ageVerified}
        >
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
  );
};

export default RegisterForm;
