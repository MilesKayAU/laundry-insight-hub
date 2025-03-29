
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ContributePageHeader from "@/components/contribute/ContributePageHeader";
import ProductForm from "@/components/contribute/ProductForm";
import BulkUpload from "@/components/BulkUpload";
import DiscussionSection from "@/components/contribute/DiscussionSection";

const ContributePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const { toast } = useToast();

  const handleFormComplete = () => {
    // Can be used for any post-submission actions if needed
  };

  const handleBulkUploadComplete = () => {
    toast({
      title: "Bulk upload complete",
      description: "Your products have been submitted for review."
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <ContributePageHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Product</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <ProductForm onComplete={handleFormComplete} />
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkUpload onComplete={handleBulkUploadComplete} />
        </TabsContent>
      </Tabs>
      
      <DiscussionSection />
    </div>
  );
};

export default ContributePage;
