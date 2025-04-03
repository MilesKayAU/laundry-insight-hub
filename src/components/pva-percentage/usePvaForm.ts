
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { formSchema, PvaFormValues, PvaPercentageFormProps } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const usePvaForm = ({
  defaultBrand = "",
  defaultProduct = "",
  onSubmitSuccess,
  isAdmin = false
}: PvaPercentageFormProps) => {
  const { toast } = useToast();
  const [proofTab, setProofTab] = useState<"url" | "sds">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    setIsSubmitting(true);
    
    try {
      // For admin updates, attempt to update directly in Supabase first
      if (isAdmin && defaultBrand && defaultProduct) {
        console.log("Admin updating PVA percentage for:", defaultBrand, defaultProduct);
        
        // Try to find the product in Supabase
        const { data: products, error: findError } = await supabase
          .from('product_submissions')
          .select('id')
          .eq('brand', defaultBrand)
          .eq('name', defaultProduct)
          .limit(1);
          
        if (findError) {
          console.error("Error finding product in database:", findError);
          toast({
            title: "Database Query Error",
            description: `Error finding product: ${findError.message}`,
            variant: "destructive"
          });
        } else if (products && products.length > 0) {
          const productId = products[0].id;
          console.log("Found product to update:", productId);
          
          // Update the product's PVA percentage
          const { data, error: updateError } = await supabase
            .from('product_submissions')
            .update({
              pvapercentage: parseFloat(values.pvaPercentage),
              updatedat: new Date().toISOString(),
              pvastatus: 'verified' // Mark as verified since an admin is setting it
            })
            .eq('id', productId);
            
          if (updateError) {
            console.error("Error updating product PVA percentage:", updateError);
            toast({
              title: "Database Update Error",
              description: `Failed to update in database: ${updateError.message}`,
              variant: "destructive"
            });
            throw updateError;
          }
          
          console.log("Successfully updated PVA percentage in database, response:", data);
          
          // Trigger a global refresh event
          window.dispatchEvent(new Event('reload-products'));
        } else {
          console.warn("No matching product found in database for update");
          toast({
            title: "Product Not Found",
            description: "Could not find the product in the database to update.",
            variant: "warning"
          });
        }
      }
      
      // In a real implementation, this would send the data to the backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    proofTab, 
    setProofTab,
    onSubmit,
    isSubmitting
  };
};
