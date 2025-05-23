
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ContributePageHeader from "@/components/contribute/ContributePageHeader";
import ProductForm from "@/components/contribute/ProductForm";
import BulkUpload from "@/components/BulkUpload";
import DiscussionSection from "@/components/contribute/DiscussionSection";
import PvaPercentageForm from "@/components/PvaPercentageForm";
import TrustLevelInfoDialog from "@/components/contribute/TrustLevelInfoDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, Shield, AlertTriangle } from "lucide-react";
import { UserTrustLevel, getUserTrustLevel } from "@/utils/supabaseUtils";
import { useAuth } from "@/contexts/AuthContext";

const ContributePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const [showTrustInfo, setShowTrustInfo] = useState(false);
  const [trustLevel, setTrustLevel] = useState<UserTrustLevel>(UserTrustLevel.NEW);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [submissionTimestamps, setSubmissionTimestamps] = useState<number[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Get user's trust level on component mount
  React.useEffect(() => {
    const fetchTrustLevel = async () => {
      if (user?.id) {
        const level = await getUserTrustLevel(user.id);
        setTrustLevel(level);
      }
    };
    
    fetchTrustLevel();
  }, [user?.id]);

  // Anti-spam rate limiting
  useEffect(() => {
    const storedData = localStorage.getItem('submission_timestamps');
    if (storedData) {
      const timestamps = JSON.parse(storedData);
      // Filter out timestamps older than 1 hour
      const recentTimestamps = timestamps.filter(
        (t: number) => Date.now() - t < 60 * 60 * 1000
      );
      setSubmissionTimestamps(recentTimestamps);
      setSubmissionCount(recentTimestamps.length);
      
      // Check if user is rate limited (more than 10 submissions in the last hour)
      setIsRateLimited(recentTimestamps.length >= 10 && !isAdmin);
    }
  }, [isAdmin]);

  const recordSubmission = () => {
    const now = Date.now();
    const updatedTimestamps = [...submissionTimestamps, now];
    localStorage.setItem('submission_timestamps', JSON.stringify(updatedTimestamps));
    setSubmissionTimestamps(updatedTimestamps);
    setSubmissionCount(updatedTimestamps.length);
    
    // Check if user is now rate limited
    if (updatedTimestamps.length >= 10 && !isAdmin) {
      setIsRateLimited(true);
    }
  };

  const handleFormComplete = () => {
    // Record submission for rate limiting
    recordSubmission();
    console.log("Form submission complete!");
  };

  const handleBulkUploadComplete = () => {
    // Record submission for rate limiting
    recordSubmission();
    console.log("Bulk upload complete - products added to pending submissions");
    
    toast({
      title: "Bulk upload complete",
      description: "Your products have been submitted for review and are now in the pending queue.",
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <ContributePageHeader />
      
      {isRateLimited && (
        <div className="max-w-4xl mx-auto mb-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Submission Rate Limit Reached</AlertTitle>
            <AlertDescription>
              You've submitted too many items in a short period. For security reasons, 
              please wait before making additional submissions. Try again in an hour.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {isAuthenticated && !isAdmin && (
        <div className="max-w-4xl mx-auto mb-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-800 flex items-center gap-2">
              Contributor Trust System
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs bg-white ml-2"
                onClick={() => setShowTrustInfo(true)}
              >
                <InfoIcon className="h-3 w-3 mr-1" /> Learn More
              </Button>
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              {trustLevel === UserTrustLevel.NEW && 
                "As a new contributor, you can submit up to 3 products until they're approved. Build trust by contributing high-quality data."}
              {trustLevel === UserTrustLevel.TRUSTED && 
                "As a trusted contributor, you can submit up to 10 products at a time. Thank you for your quality contributions!"}
              {trustLevel === UserTrustLevel.VERIFIED && 
                "As a verified contributor, you have increased submission limits. Thank you for your continued support!"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">Individual Product</TabsTrigger>
          <TabsTrigger value="pva-update">PVA Percentage Update</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <ProductForm onComplete={handleFormComplete} />
        </TabsContent>
        
        <TabsContent value="pva-update">
          <PvaPercentageForm onSubmitSuccess={handleFormComplete} />
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkUpload onComplete={handleBulkUploadComplete} />
        </TabsContent>
      </Tabs>
      
      <TrustLevelInfoDialog 
        open={showTrustInfo}
        onOpenChange={setShowTrustInfo}
        userTrustLevel={trustLevel}
      />
      
      <DiscussionSection />
    </div>
  );
};

export default ContributePage;
