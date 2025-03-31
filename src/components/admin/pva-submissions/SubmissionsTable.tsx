
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Globe, FileText } from "lucide-react";
import { PvaSubmission } from './useSubmissions';
import { formatDate } from "../communications/utils";

interface SubmissionsTableProps {
  submissions: PvaSubmission[];
  onReview: (submission: PvaSubmission) => void;
  onApprove: (submission: PvaSubmission) => void;
  onReject: (submission: PvaSubmission) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  onReview,
  onApprove,
  onReject
}) => {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No pending PVA percentage update requests
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Current %</TableHead>
            <TableHead>Proposed %</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">
                {submission.brandName}
              </TableCell>
              <TableCell>{submission.productName}</TableCell>
              <TableCell>
                {submission.currentPercentage ? `${submission.currentPercentage}%` : 'N/A'}
              </TableCell>
              <TableCell className="font-medium text-blue-600">
                {submission.proposedPercentage}%
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {submission.proofType === 'url' ? (
                    <Globe className="h-3 w-3 mr-1 inline" />
                  ) : (
                    <FileText className="h-3 w-3 mr-1 inline" />
                  )}
                  {submission.proofType === 'url' ? 'URL' : 'SDS'}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(submission.submittedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onReview(submission)}
                    className="h-8 px-2"
                  >
                    Review
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onApprove(submission)}
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onReject(submission)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
