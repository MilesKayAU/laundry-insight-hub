
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UseFormReturn } from "react-hook-form";
import { PvaFormValues, VerificationResult } from "./types";

interface ProofDocumentationProps {
  form: UseFormReturn<PvaFormValues>;
  proofTab: "url" | "sds";
  setProofTab: (tab: "url" | "sds") => void;
  handleVerifyUrl: () => void;
  isVerifying: boolean;
  verificationResult: VerificationResult | null;
}

const ProofDocumentation: React.FC<ProofDocumentationProps> = ({
  form,
  proofTab,
  setProofTab,
  handleVerifyUrl,
  isVerifying,
  verificationResult
}) => {
  const handleTabChange = (value: string) => {
    setProofTab(value as "url" | "sds");
    form.setValue("proofType", value as "url" | "sds");
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Documentation Type</h3>
      <Tabs 
        defaultValue="url" 
        value={proofTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-1">
            <Globe className="h-4 w-4" /> Product Website URL
          </TabsTrigger>
          <TabsTrigger value="sds" className="flex items-center gap-1">
            <FileText className="h-4 w-4" /> Safety Data Sheet (SDS)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="mt-4">
          <FormField
            control={form.control}
            name="proofUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl className="flex-1">
                    <Input 
                      placeholder="https://example.com/product" 
                      {...field}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleVerifyUrl}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Checking..." : "Verify URL"}
                  </Button>
                </div>
                <FormDescription>
                  Link to the product page that shows the PVA percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {verificationResult && (
            <Alert 
              className="mt-4" 
              variant={verificationResult.containsPva ? "default" : "destructive"}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {verificationResult.containsPva 
                  ? "PVA Detected" 
                  : "PVA Not Found"
                }
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
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="sds" className="mt-4">
          <FormField
            control={form.control}
            name="sdsText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SDS Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Paste the relevant section of the SDS showing PVA percentage..." 
                    className="h-40"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Copy and paste the section that mentions PVA percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProofDocumentation;
