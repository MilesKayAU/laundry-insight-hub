
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProductInfoSection, PvaPercentageSection, AdditionalNotesSection } from './pva-percentage/FormSections';
import ProofDocumentation from './pva-percentage/ProofDocumentation';
import { usePvaForm } from './pva-percentage/usePvaForm';
import { useUrlVerification } from './pva-percentage/useUrlVerification';
import { PvaPercentageFormProps } from './pva-percentage/types';

const PvaPercentageForm: React.FC<PvaPercentageFormProps> = ({ 
  onSubmitSuccess,
  defaultBrand = "",
  defaultProduct = "",
  isAdmin = false
}) => {
  const { form, proofTab, setProofTab, onSubmit } = usePvaForm({
    defaultBrand,
    defaultProduct,
    onSubmitSuccess,
    isAdmin
  });
  
  const { isVerifying, verificationResult, handleVerifyUrl } = useUrlVerification(form);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isAdmin ? "Update PVA Percentage" : "Submit PVA Percentage Update"}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Update the PVA percentage information for this product"
            : "Provide documentation showing the actual PVA percentage in this product"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ProductInfoSection form={form} disabled={!!defaultBrand || !!defaultProduct} />
            <PvaPercentageSection form={form} />
            
            <ProofDocumentation
              form={form}
              proofTab={proofTab}
              setProofTab={setProofTab}
              handleVerifyUrl={handleVerifyUrl}
              isVerifying={isVerifying}
              verificationResult={verificationResult}
            />
            
            <AdditionalNotesSection form={form} />
            
            <Button type="submit" className="w-full">
              {isAdmin ? "Update PVA Percentage" : "Submit for Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col text-center text-sm text-muted-foreground pt-0">
        {!isAdmin && (
          <p>
            Submissions are reviewed by our team before being published.
            Thank you for helping improve our database accuracy.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PvaPercentageForm;
