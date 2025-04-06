
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface VerificationMessageProps {
  onReturn: () => void;
}

const VerificationMessage: React.FC<VerificationMessageProps> = ({ onReturn }) => {
  return (
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
      <DialogFooter>
        <Button onClick={onReturn}>
          Return to Login
        </Button>
      </DialogFooter>
    </div>
  );
};

export default VerificationMessage;
