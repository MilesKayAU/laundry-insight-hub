
import React from 'react';
import { Shield, Check, FileCheck, Leaf, DollarSign, Send } from 'lucide-react';
import PvaCertificationBadge from '@/components/PvaCertificationBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import MediaUploader from '@/components/MediaUploader';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required" }),
  contactName: z.string().min(2, { message: "Contact name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  productName: z.string().min(2, { message: "Product name is required" }),
  website: z.string().optional(),
  percentagesConsent: z.boolean().refine(val => val === true, {
    message: "You must consent to share ingredient percentages",
  }),
  publicDisclosureConsent: z.boolean().refine(val => val === true, {
    message: "You must consent to public disclosure",
  }),
  message: z.string().optional(),
});

const CertificationPage = () => {
  const { toast } = useToast();
  const [files, setFiles] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      productName: "",
      website: "",
      percentagesConsent: false,
      publicDisclosureConsent: false,
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", values);
      console.log("Files:", files);
      
      toast({
        title: "Application submitted",
        description: "We've received your certification application and will contact you soon.",
      });
      
      form.reset();
      setFiles([]);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  return (
    <div className="container mx-auto py-10 px-4 pb-24">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">PVA-Free Certification Program</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
          Our certification program validates products that are 100% free from polyvinyl alcohol (PVA).
          Display your commitment to environmental health with our trusted verification badge.
        </p>
        
        <div className="flex justify-center mb-10">
          <PvaCertificationBadge size="lg" />
        </div>
      </div>
      
      {/* About The Program */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">About The Certification</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-science-600 mb-2" />
              <CardTitle>Trusted Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our certification process includes rigorous testing and verification of product ingredients to ensure zero PVA content.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <FileCheck className="h-10 w-10 text-science-600 mb-2" />
              <CardTitle>Complete Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We provide full disclosure of verified product ingredients on our website, allowing consumers to make informed choices.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Leaf className="h-10 w-10 text-science-600 mb-2" />
              <CardTitle>Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>By choosing PVA-free products, you're helping reduce microplastic pollution in our waterways and ecosystems.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* How to Apply */}
      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">How to Apply</h2>
        <p className="text-center mb-8 max-w-2xl mx-auto">
          Currently, our certification program is open exclusively to laundry sheet and pod suppliers. 
          To apply for certification, you must provide:
        </p>
        
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-science-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-science-600" />
            </div>
            <div>
              <h3 className="font-semibold">Safety Data Sheets (SDS)</h3>
              <p className="text-muted-foreground">Complete documentation of all ingredients and their safety profiles.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-science-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-science-600" />
            </div>
            <div>
              <h3 className="font-semibold">Ingredient Percentages</h3>
              <p className="text-muted-foreground">Exact percentages of all ingredients contained in your product.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-science-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-science-600" />
            </div>
            <div>
              <h3 className="font-semibold">Permission for Public Disclosure</h3>
              <p className="text-muted-foreground">Consent to list ingredients on our website for public verification.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-science-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-science-600" />
            </div>
            <div>
              <h3 className="font-semibold">Certification Fee</h3>
              <p className="text-muted-foreground">A small annual fee to support our verification process and ongoing monitoring.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Benefits of Certification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Advantage</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Use our certification badge on your website, product packaging, and marketing materials to differentiate your product in the marketplace.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Consumer Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Build customer confidence with third-party verification of your environmental claims.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Featured Placement</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Certified products receive prominent placement on our PVA-Free product listings and special mentions in our content.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Environmental Leadership</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Demonstrate your commitment to reducing microplastic pollution and protecting water ecosystems.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Certification Application Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Apply for Certification</h2>
        <p className="text-center text-muted-foreground mb-8">
          Complete the form below to start your PVA-Free certification process
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll use this email for all certification communications
                    </FormDescription>
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
                      <Input placeholder="Product to be certified" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="text-sm font-medium mb-2">
                Upload Required Documentation
              </div>
              <MediaUploader 
                onChange={handleFileChange}
                acceptedFileTypes="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                label="Safety Data Sheets (SDS) and Ingredient Documentation"
                currentFiles={files}
                maxFiles={5}
              />
              <p className="text-xs text-muted-foreground">
                Upload SDS sheets, ingredient lists, test results, and any other relevant documentation.
                Accepted formats: PDF, Word, Excel, and images.
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please share any additional details about your product that may be relevant to the certification process."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="percentagesConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I consent to share exact ingredient percentages for verification
                      </FormLabel>
                      <FormDescription>
                        This information will be kept confidential and only used for verification.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="publicDisclosureConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I consent to public disclosure of ingredients if certified
                      </FormLabel>
                      <FormDescription>
                        This allows us to list your product ingredients on our website for transparency.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-science-600 hover:bg-science-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Submitting Application...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Certification Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-science-50 to-tech-50 p-10 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Certified?</h2>
        <p className="max-w-xl mx-auto mb-6 text-muted-foreground">
          Join the growing network of environmentally responsible businesses offering PVA-free laundry solutions.
        </p>
        <div className="flex flex-col items-center">
          <div className="mt-4 flex items-center">
            <img 
              src="/lovable-uploads/91001aa0-b74b-47cb-95ba-9aeb3f69c77a.png" 
              alt="Certification Number" 
              className="h-16" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationPage;
