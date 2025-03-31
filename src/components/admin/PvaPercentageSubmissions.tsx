
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";
import { useSubmissions } from "./pva-submissions/useSubmissions";
import { SubmissionsTable } from "./pva-submissions/SubmissionsTable";
import SubmissionDetailsDialog from "./pva-submissions/SubmissionDetailsDialog";

const PvaPercentageSubmissions: React.FC = () => {
  const { 
    pendingSubmissions, 
    selectedSubmission, 
    dialogOpen, 
    setDialogOpen,
    handleSelectSubmission, 
    handleApprove, 
    handleReject,
    resetSubmissions
  } = useSubmissions();
  
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
          
          {/* Add a button to reset submissions for testing purposes */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetSubmissions}
          >
            Reset Submissions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SubmissionsTable 
          submissions={pendingSubmissions}
          onReview={handleSelectSubmission}
          onApprove={(submission) => handleApprove(submission, submission.proposedPercentage)}
          onReject={handleReject}
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
