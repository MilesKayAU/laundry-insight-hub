
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MediaUploader from "@/components/MediaUploader";
import { useToast } from "@/components/ui/use-toast";
import { submitProduct } from "@/lib/textExtractor";
import { Shield, Camera, Check, AlertCircle } from "lucide-react";
import BulkUpload from "@/components/BulkUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommentsSection from "@/components/CommentsSection";

const productSchema = z.object({
  productName: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  brandName: z.string().min(2, {
    message: "Brand name must be at least 2 characters.",
  }),
  productType: z.string().min(1, {
    message: "Please select a product type.",
  }),
  country: z.string().optional(),
  websiteUrl: z.string().url({
    message: "Please enter a valid URL (e.g. https://example.com)",
  }).or(z.string().length(0)),
  ingredients: z.string().optional(),
  comments: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ContributePage: React.FC = () => {
  const [media, setMedia] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      brandName: "",
      productType: "",
      country: "",
      websiteUrl: "",
      ingredients: "",
      comments: "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true);
    
    try {
      const success = await submitProduct({
        name: data.productName,
        brand: data.brandName,
        type: data.productType,
        country: data.country || undefined,
        websiteUrl: data.websiteUrl || undefined,
        ingredients: data.ingredients || undefined,
        comments: data.comments || undefined,
        media: media,
      });

      if (success) {
        toast({
          title: "Product submitted successfully",
          description: "Thank you for your contribution to our database.",
        });
        
        // Reset form
        form.reset();
        setMedia([]);
      } else {
        toast({
          title: "Submission failed",
          description: "There was an error submitting your product. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast({
        title: "Submission error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Contribute to Our Database</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Help us build a comprehensive database of laundry products and their PVA content. 
          Submit products by filling out the form below or uploading product images.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Product</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Product</CardTitle>
              <CardDescription>
                Enter information about a laundry product to add it to our database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Ultra Clean Detergent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="brandName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CleanWash" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Laundry Detergent">Laundry Detergent</SelectItem>
                              <SelectItem value="Dishwasher Detergent">Dishwasher Detergent</SelectItem>
                              <SelectItem value="Fabric Softener">Fabric Softener</SelectItem>
                              <SelectItem value="Laundry Pod">Laundry Pod</SelectItem>
                              <SelectItem value="Dishwasher Pod">Dishwasher Pod</SelectItem>
                              <SelectItem value="Stain Remover">Stain Remover</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country/Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="New Zealand">New Zealand</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Japan">Japan</SelectItem>
                              <SelectItem value="China">China</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="Brazil">Brazil</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Where this product is primarily sold
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/product" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link to the product on the manufacturer's website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredients List</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the ingredients list exactly as it appears on the product packaging..."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Copy the full ingredients list from the product packaging or website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <FormLabel>Product Images</FormLabel>
                    <MediaUploader
                      onChange={setMedia}
                      maxFiles={5}
                      acceptedFileTypes="image/*"
                      label="Upload Product Images"
                      currentFiles={media}
                    />
                    <FormDescription>
                      Upload clear images of the product, packaging, and the ingredients list
                    </FormDescription>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share any additional information about the product..."
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>Submitting...</>
                    ) : (
                      <>Submit Product</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-start space-x-2 text-sm text-gray-500">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <p>
                  Your submissions help create a transparent database for eco-conscious consumers. 
                  All submissions are reviewed for accuracy before being added to the database.
                </p>
              </div>
              
              <div className="flex items-start space-x-2 text-sm text-gray-500">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                <p>
                  Clear images of product packaging and ingredients lists help our system 
                  accurately extract PVA content information.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkUpload />
        </TabsContent>
      </Tabs>
      
      <div className="mt-16 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Community Discussion</CardTitle>
            <CardDescription>
              Share your thoughts, ask questions, or provide feedback about laundry products and PVA content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommentsSection topicId="product-submissions" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContributePage;
