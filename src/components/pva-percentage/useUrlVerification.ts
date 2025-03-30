
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { verifyProductUrl } from "@/lib/urlVerification";
import { UseFormReturn } from "react-hook-form";
import { PvaFormValues, VerificationResult } from "./types";

export const useUrlVerification = (form: UseFormReturn<PvaFormValues>) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerifyUrl = async () => {
    const url = form.getValues("proofUrl");
    
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL to verify",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const result = await verifyProductUrl(url);
      setVerificationResult(result);
      
      if (result.success && result.extractedPvaPercentage) {
        form.setValue("pvaPercentage", result.extractedPvaPercentage.toString());
        
        toast({
          title: "PVA Percentage Found",
          description: `Detected PVA at ${result.extractedPvaPercentage}%`,
          variant: "default"
        });
      } else if (result.success && result.containsPva) {
        toast({
          title: "PVA Detected",
          description: "PVA was found but no specific percentage. Please enter the percentage manually.",
          variant: "default"
        });
      } else if (result.needsManualVerification) {
        toast({
          title: "Manual Verification Required",
          description: "We couldn't definitively determine if this product contains PVA. An admin will need to manually verify.",
          variant: "warning"
        });
      } else {
        toast({
          title: "Verification Result",
          description: result.message,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("URL verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to analyze the URL. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verificationResult,
    handleVerifyUrl
  };
};
