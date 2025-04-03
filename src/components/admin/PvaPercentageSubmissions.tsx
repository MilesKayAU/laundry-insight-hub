
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";
import { useSubmissions } from "./pva-submissions/useSubmissions";
import { SubmissionsTable } from "./pva-submissions/SubmissionsTable";
import SubmissionDetailsDialog from "./pva-submissions/SubmissionDetailsDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PvaPercentageSubmissions: React.FC = () => {
  const { 
    pendingSubmissions, 
    selectedSubmission, 
    dialogOpen, 
    setDialogOpen,
    handleSelectSubmission, 
    handleApprove, 
    handleReject,
    resetSubmissions,
    isProcessing
  } = useSubmissions();
  
  const [lastAction, setLastAction] = useState<{
    type: 'approve' | 'reject',
    product: string
  } | null>(null);
  
  const onApprove = (submission: any) => {
    handleApprove(submission, submission.proposedPercentage);
    setLastAction({ 
      type: 'approve', 
      product: `${submission.brandName} ${submission.productName}` 
    });
  };
  
  const onReject = (submission: any) => {
    handleReject(submission);
    setLastAction({ 
      type: 'reject', 
      product: `${submission.brandName} ${submission.productName}` 
    });
  };
  
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              PVA Percentage Update Requests
            </CardTitle>
            <CardDescription>
              Review and manage user-submitted PVA percentage update requests
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetSubmissions}
            disabled={isProcessing}
          >
            Reset Submissions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {lastAction && (
          <Alert variant={lastAction.type === 'approve' ? 'default' : 'destructive'} className="mb-4">
            <AlertDescription>
              {lastAction.type === 'approve' 
                ? `Approved PVA percentage update for ${lastAction.product}.` 
                : `Rejected PVA percentage update for ${lastAction.product}.`}
            </AlertDescription>
          </Alert>
        )}

        <SubmissionsTable 
          submissions={pendingSubmissions}
          onReview={handleSelectSubmission}
          onApprove={onApprove}
          onReject={onReject}
        />
      </CardContent>
      
      <SubmissionDetailsDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        submission={selectedSubmission}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Card>
  );
};

export default PvaPercentageSubmissions;
