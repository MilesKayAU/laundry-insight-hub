
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Check, X, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PvaPercentageSubmissionsDialog from "./PvaPercentageSubmissionsDialog";

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

// Sample data for demonstration
const generateSampleSubmissions = (): PvaSubmission[] => {
  // Get stored submissions from localStorage or generate new ones if none exist
  const storedSubmissions = localStorage.getItem('pvaSubmissions');
  if (storedSubmissions) {
    return JSON.parse(storedSubmissions);
  }
  
  // Generate default submissions if none are stored
  const defaultSubmissions: PvaSubmission[] = [
    {
      id: "1",
      productId: "prod-001",
      brandName: "EcoClean",
      productName: "Laundry Detergent Sheets",
      currentPercentage: 25,
      proposedPercentage: 18.5,
      proofType: 'url',
      proofUrl: 'https://ecoclean.com/products/laundry-sheets',
      additionalNotes: 'The website lists the PVA content as 18.5% in the ingredients section.',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: "2",
      productId: "prod-002",
      brandName: "BioWash",
      productName: "Dishwasher Pods",
      currentPercentage: 25,
      proposedPercentage: 22,
      proofType: 'sds',
      sdsContent: 'SECTION 3: COMPOSITION/INFORMATION ON INGREDIENTS\nPolyvinyl Alcohol (PVA) CAS# 9002-89-5....... 22%\nSodium Carbonate CAS# 497-19-8................. 33%\nSodium Percarbonate CAS# 15630-89-4.......... 15%\nOther ingredients................................. 30%',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: "3",
      productId: "prod-003",
      brandName: "GreenSpark",
      productName: "All-Purpose Cleaner Sheets",
      currentPercentage: null,
      proposedPercentage: 28,
      proofType: 'url',
      proofUrl: 'https://greenspark.com/all-purpose-cleaner',
      additionalNotes: 'Website states "Contains 28% PVA" in product specifications.',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    }
  ];
  
  // Store the default submissions
  localStorage.setItem('pvaSubmissions', JSON.stringify(defaultSubmissions));
  return defaultSubmissions;
};

const PvaPercentageSubmissions: React.FC = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<PvaSubmission[]>(generateSampleSubmissions());
  const [selectedSubmission, setSelectedSubmission] = useState<PvaSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Save submissions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pvaSubmissions', JSON.stringify(submissions));
  }, [submissions]);
  
  const handleSelectSubmission = (submission: PvaSubmission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };
  
  const handleApprove = (submission: PvaSubmission, percentage: number) => {
    // Update the submission status
    const updatedSubmissions = submissions.map(sub => 
      sub.id === submission.id 
        ? { ...sub, status: 'approved' as const, proposedPercentage: percentage } 
        : sub
    );
    
    // Save updated submissions
    setSubmissions(updatedSubmissions);
    
    toast({
      title: "Update Approved",
      description: `Updated PVA percentage for ${submission.brandName} ${submission.productName} to ${percentage}%.`,
      variant: "default"
    });
  };
  
  const handleReject = (submission: PvaSubmission) => {
    // Update the submission status
    const updatedSubmissions = submissions.map(sub => 
      sub.id === submission.id 
        ? { ...sub, status: 'rejected' as const } 
        : sub
    );
    
    // Save updated submissions
    setSubmissions(updatedSubmissions);
    
    toast({
      title: "Update Rejected",
      description: `Rejected PVA percentage update for ${submission.brandName} ${submission.productName}.`,
      variant: "destructive"
    });
  };
  
  // Only show pending submissions
  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
  
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
            onClick={() => {
              localStorage.removeItem('pvaSubmissions');
              setSubmissions(generateSampleSubmissions());
              toast({
                title: "Submissions Reset",
                description: "PVA percentage submissions have been reset to default.",
              });
            }}
          >
            Reset Submissions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingSubmissions.length > 0 ? (
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
                {pendingSubmissions.map((submission) => (
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
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSelectSubmission(submission)}
                          className="h-8 px-2"
                        >
                          Review
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleApprove(submission, submission.proposedPercentage)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleReject(submission)}
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
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No pending PVA percentage update requests
          </div>
        )}
      </CardContent>
      
      <PvaPercentageSubmissionsDialog
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
