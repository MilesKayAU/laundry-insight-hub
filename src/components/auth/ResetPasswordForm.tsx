
import React from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ResetPasswordFormProps {
  resetEmail: string;
  setResetEmail: (email: string) => void;
  resetEmailSent: boolean;
  isLoading: boolean;
  handlePasswordReset: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onReturn: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetEmail,
  setResetEmail,
  resetEmailSent,
  isLoading,
  handlePasswordReset,
  onCancel,
  onReturn
}) => {
  if (resetEmailSent) {
    return (
      <div className="space-y-4 py-4">
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
          <Button onClick={onReturn}>
            Return to Login
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <form onSubmit={handlePasswordReset}>
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>
          Enter your email address and we'll send you a link to reset your password.
        </DialogDescription>
      </DialogHeader>
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
          onClick={onCancel}
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
  );
};

export default ResetPasswordForm;
