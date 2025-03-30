
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { formSchema, PvaFormValues, PvaPercentageFormProps } from "./types";

export const usePvaForm = ({
  defaultBrand = "",
  defaultProduct = "",
  onSubmitSuccess,
  isAdmin = false
}: PvaPercentageFormProps) => {
  const { toast } = useToast();
  const [proofTab, setProofTab] = useState<"url" | "sds">("url");
  
  const form = useForm<PvaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: defaultBrand,
      productName: defaultProduct,
      pvaPercentage: "",
      proofType: "url",
      proofUrl: "",
      sdsText: "",
      additionalNotes: ""
    },
  });

  const onSubmit = async (values: PvaFormValues) => {
    console.log("Form values:", values);
    
    try {
      // In a real implementation, this would send the data to the backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const message = isAdmin 
        ? "The product PVA percentage has been updated."
        : "Your PVA percentage update request has been submitted for review.";
      
      toast({
        title: "Submission Successful",
        description: message,
        variant: "default"
      });
      
      form.reset();
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your data. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return {
    form,
    proofTab, 
    setProofTab,
    onSubmit
  };
};
