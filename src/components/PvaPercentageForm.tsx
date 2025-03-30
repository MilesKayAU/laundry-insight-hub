
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, FileText, Globe, Percent, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyProductUrl } from "@/lib/urlVerification";

const formSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  productName: z.string().min(1, "Product name is required"),
  pvaPercentage: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, 
    { message: "Percentage must be a number between 1 and 100" }
  ),
  proofType: z.enum(["url", "sds"]),
  proofUrl: z.string().url("Please enter a valid URL").optional(),
  sdsText: z.string().min(1, "Please provide SDS content or upload an SDS file").optional(),
  additionalNotes: z.string().optional(),
});

interface PvaPercentageFormProps {
  onSubmitSuccess?: () => void;
  defaultBrand?: string;
  defaultProduct?: string;
}

const PvaPercentageForm: React.FC<PvaPercentageFormProps> = ({ 
  onSubmitSuccess,
  defaultBrand = "",
  defaultProduct = ""
}) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofTab, setProofTab] = useState<"url" | "sds">("url");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
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
  
  // Handle tab switching
  const handleTabChange = (value: string) => {
    setProofTab(value as "url" | "sds");
    form.setValue("proofType", value as "url" | "sds");
  };
  
  // Verify URL to extract PVA percentage
  const handleVerifyUrl = async () => {
    const url = form.getValues("proofUrl");
    
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL to verify",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const result = await verifyProductUrl(url);
      setVerificationResult(result);
      
      if (result.success && result.extractedPvaPercentage) {
        form.setValue("pvaPercentage", result.extractedPvaPercentage.toString());
        
        toast({
          title: "PVA Percentage Found",
          description: `Detected PVA at ${result.extractedPvaPercentage}%`,
          variant: "default"
        });
      } else if (result.success && result.containsPva) {
        toast({
          title: "PVA Detected",
          description: "PVA was found but no specific percentage. Please enter the percentage manually.",
          variant: "default"
        });
      } else if (result.needsManualVerification) {
        toast({
          title: "Manual Verification Required",
          description: "We couldn't definitively determine if this product contains PVA. An admin will need to manually verify.",
          variant: "warning"
        });
      } else {
        toast({
          title: "Verification Result",
          description: result.message,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("URL verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to analyze the URL. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form values:", values);
    
    try {
      // In a real implementation, this would send the data to the backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Submission Successful",
        description: "Your PVA percentage update request has been submitted for review.",
        variant: "default"
      });
      
      form.reset();
      setVerificationResult(null);
      
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
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit PVA Percentage Update</CardTitle>
        <CardDescription>
          Provide documentation showing the actual PVA percentage in this product
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Brand name" {...field} disabled={!!defaultBrand} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} disabled={!!defaultProduct} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="pvaPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Percent className="h-4 w-4" /> PVA Percentage
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="25" 
                      min="0.1" 
                      max="100" 
                      step="0.1" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the specific PVA percentage found in the product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
            
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information to help verify the PVA percentage..." 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Submit for Review</Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col text-center text-sm text-muted-foreground pt-0">
        <p>
          Submissions are reviewed by our team before being published.
          Thank you for helping improve our database accuracy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PvaPercentageForm;

