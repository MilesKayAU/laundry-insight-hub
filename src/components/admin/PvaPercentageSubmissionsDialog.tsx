
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, FileText, Globe, Loader2, ExternalLink, Check, X } from "lucide-react";
import { verifyProductUrl } from "@/lib/urlVerification";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface PvaSubmission {
  id: string;
  productId: string;
  brandName: string;
  productName: string;
  currentPercentage: number | null;
  proposedPercentage: number;
  proofType: 'url' | 'sds';
  proofUrl?: string;
  sdsContent?: string;
  additionalNotes?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PvaPercentageSubmissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: PvaSubmission | null;
  onApprove: (submission: PvaSubmission, percentage: number) => void;
  onReject: (submission: PvaSubmission) => void;
}

const PvaPercentageSubmissionsDialog: React.FC<PvaPercentageSubmissionsDialogProps> = ({
  isOpen,
  onOpenChange,
  submission,
  onApprove,
  onReject
}) => {
  const { toast } = useToast();
  const [percentage, setPercentage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [manualVerificationOpen, setManualVerificationOpen] = useState(false);
  
  React.useEffect(() => {
    if (submission) {
      setPercentage(submission.proposedPercentage.toString());
    }
  }, [submission]);
  
  if (!submission) return null;
  
  const handleVerifyUrl = async () => {
    if (!submission.proofUrl) {
      toast({
        title: "No URL provided",
        description: "This submission doesn't have a URL to verify",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const result = await verifyProductUrl(submission.proofUrl);
      setVerificationResult(result);
      
      if (result.success && result.extractedPvaPercentage) {
        setPercentage(result.extractedPvaPercentage.toString());
        
        toast({
          title: "PVA Percentage Verified",
          description: `Found PVA at ${result.extractedPvaPercentage}%`,
          variant: "default"
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
        description: "Failed to analyze the URL",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const openUrlInNewTab = () => {
    if (submission.proofUrl) {
      window.open(submission.proofUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleApprove = () => {
    const numPercentage = parseFloat(percentage);
    if (isNaN(numPercentage) || numPercentage <= 0 || numPercentage > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Please enter a valid percentage between 0 and 100",
        variant: "destructive"
      });
      return;
    }
    
    onApprove(submission, numPercentage);
    onOpenChange(false);
  };
  
  const handleReject = () => {
    onReject(submission);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>PVA Percentage Update Request</DialogTitle>
          <DialogDescription>
            Review the submission and verify the PVA percentage
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand
            </Label>
            <div className="col-span-3 font-medium">
              {submission.brandName}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            <div className="col-span-3">
              {submission.productName}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentPva" className="text-right">
              Current PVA %
            </Label>
            <div className="col-span-3">
              {submission.currentPercentage !== null ? `${submission.currentPercentage}%` : 'Not specified'}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proposedPva" className="text-right">
              Proposed PVA %
            </Label>
            <div className="col-span-3 font-medium text-blue-600">
              {submission.proposedPercentage}%
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="approvedPva" className="text-right">
              Approved PVA %
            </Label>
            <div className="col-span-3">
              <Input
                id="approvedPva"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                className="w-32"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Documentation
            </Label>
            <div className="col-span-3">
              <Badge variant="outline" className="mb-2">
                {submission.proofType === 'url' ? 'Website URL' : 'SDS Document'}
              </Badge>
              
              {submission.proofType === 'url' && submission.proofUrl && (
                <Card className="mb-4">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm flex justify-between items-center">
                      <span>Product URL</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-blue-600"
                          onClick={openUrlInNewTab}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-green-600"
                          onClick={handleVerifyUrl}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Globe className="h-4 w-4 mr-1" />
                          )}
                          Verify
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-orange-600"
                          onClick={() => setManualVerificationOpen(true)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Manual Check
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-sm break-all bg-slate-50 p-2 rounded">
                      {submission.proofUrl}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {submission.proofType === 'sds' && submission.sdsContent && (
                <Card className="mb-4">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      SDS Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-sm bg-slate-50 p-3 rounded max-h-48 overflow-y-auto">
                      {submission.sdsContent}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {submission.additionalNotes && (
                <div className="mt-2">
                  <Label className="text-sm">Additional Notes:</Label>
                  <div className="text-sm mt-1 bg-slate-50 p-3 rounded">
                    {submission.additionalNotes}
                  </div>
                </div>
              )}
              
              {verificationResult && (
                <Alert 
                  className="mt-4" 
                  variant={verificationResult.containsPva ? "default" : "destructive"}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    Verification Result
                  </AlertTitle>
                  <AlertDescription>
                    {verificationResult.message}
                    
                    {verificationResult.extractedIngredients && (
                      <div className="mt-2">
                        <p className="font-semibold text-sm">Extracted Ingredients:</p>
                        <p className="text-xs mt-1 bg-background/50 p-2 rounded">
                          {verificationResult.extractedIngredients}
                        </p>
                      </div>
                    )}
                    
                    {verificationResult.extractedPvaPercentage && (
                      <div className="mt-2">
                        <p className="font-semibold text-sm">Detected PVA Percentage:</p>
                        <p className="text-xs mt-1 bg-background/50 p-2 rounded">
                          {verificationResult.extractedPvaPercentage}%
                        </p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleApprove}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Manual Verification Dialog */}
      <AlertDialog open={manualVerificationOpen} onOpenChange={setManualVerificationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manual PVA Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Please visit the product page to manually verify the PVA percentage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-sm">
              <span className="font-semibold">Product:</span> {submission.brandName} - {submission.productName}
            </p>
            <p className="text-sm">
              <span className="font-semibold">URL:</span> {submission.proofUrl}
            </p>
            
            <Button
              onClick={openUrlInNewTab}
              className="w-full flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open URL in New Tab
            </Button>
            
            <div className="pt-4">
              <Label htmlFor="manualPvaPercentage">Confirmed PVA Percentage:</Label>
              <Input
                id="manualPvaPercentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                className="mt-2"
              />
            </div>
            
            <div className="border-t pt-4 text-sm text-muted-foreground">
              Please confirm the PVA percentage you found in the product:
            </div>
          </div>
          
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setManualVerificationOpen(false);
                handleReject();
              }}
            >
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                Reject
              </div>
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                setManualVerificationOpen(false);
                handleApprove();
              }}
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Confirm & Approve
              </div>
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default PvaPercentageSubmissionsDialog;
