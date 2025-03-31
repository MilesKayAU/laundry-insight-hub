
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "../communications/utils";

export interface PvaSubmission {
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

export const useSubmissions = () => {
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

  const resetSubmissions = () => {
    localStorage.removeItem('pvaSubmissions');
    setSubmissions(generateSampleSubmissions());
    toast({
      title: "Submissions Reset",
      description: "PVA percentage submissions have been reset to default.",
    });
  };
  
  // Only show pending submissions
  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
  
  return {
    submissions,
    pendingSubmissions,
    selectedSubmission,
    dialogOpen,
    setDialogOpen,
    handleSelectSubmission,
    handleApprove,
    handleReject,
    resetSubmissions,
    formatDate
  };
};
