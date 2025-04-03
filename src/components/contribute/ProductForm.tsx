import React, { useState, useEffect } from "react";
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
  MultiSelect,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MediaUploader from "@/components/MediaUploader";
import { useToast } from "@/hooks/use-toast";
import { submitProduct } from "@/lib/textExtractor";
import { Shield, Camera, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  checkUserSubmissionLimits, 
  updatePendingSubmissionCount, 
  UserTrustLevel 
} from "@/utils/supabaseUtils";
import { useAuth } from "@/contexts/AuthContext";

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
  countries: z.array(z.string()).optional(),
  websiteUrl: z.string().url({
    message: "Please enter a valid URL (e.g. https://example.com)",
  }).or(z.string().length(0)),
  ingredients: z.string().optional(),
  comments: z.string().optional(),
  pvaPercentage: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "PVA percentage must be a number",
    })
    .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 100), {
      message: "PVA percentage must be between 0 and 100",
    })
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onComplete: () => void;
}

const countryOptions = [
  { value: "Australia", label: "Australia" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Japan", label: "Japan" },
  { value: "China", label: "China" },
  { value: "India", label: "India" },
  { value: "Brazil", label: "Brazil" },
  { value: "Other", label: "Other" },
];

const ProductForm: React.FC<ProductFormProps> = ({ onComplete }) => {
  const [media, setMedia] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [submissionLimits, setSubmissionLimits] = useState<{
    allowed: boolean;
    remainingAllowed: number;
    maxAllowed: number;
    trustLevel: UserTrustLevel;
  }>({
    allowed: true,
    remainingAllowed: 3,
    maxAllowed: 3,
    trustLevel: UserTrustLevel.NEW
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      brandName: "",
      productType: "",
      countries: [],
      websiteUrl: "",
      ingredients: "",
      comments: "",
      pvaPercentage: "",
    },
  });

  useEffect(() => {
    const checkLimits = async () => {
      const limits = await checkUserSubmissionLimits(
        user?.id,
        isAdmin,
        false,
        1
      );
      setSubmissionLimits(limits);
    };
    
    checkLimits();
  }, [user?.id, isAdmin]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!submissionLimits.allowed) {
      toast({
        title: "Submission limit reached",
        description: `You can submit up to ${submissionLimits.maxAllowed} products until existing submissions are approved. Please wait for admin review.`,
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const success = await submitProduct({
        name: data.productName,
        brand: data.brandName,
        type: data.productType,
        countries: selectedCountries,
        websiteUrl: data.websiteUrl || undefined,
        ingredients: data.ingredients || undefined,
        comments: data.comments || undefined,
        pvaPercentage: data.pvaPercentage ? Number(data.pvaPercentage) : undefined,
        media: media,
      });

      if (success) {
        if (user?.id) {
          updatePendingSubmissionCount(user.id, 1);
          
          const newLimits = await checkUserSubmissionLimits(
            user.id,
            isAdmin,
            false,
            1
          );
          setSubmissionLimits(newLimits);
        }
        
        toast({
          title: "Product submitted successfully",
          description: "Thank you for your contribution to our database.",
        });
        
        form.reset();
        setMedia([]);
        setSelectedCountries([]);
        onComplete();
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

  const getTrustLevelMessage = () => {
    switch (submissionLimits.trustLevel) {
      case UserTrustLevel.VERIFIED:
        return "You're a verified contributor and can submit multiple products.";
      case UserTrustLevel.TRUSTED:
        return "You're a trusted contributor and can submit up to 10 products at a time.";
      case UserTrustLevel.NEW:
      default:
        return `As a new contributor, you can submit up to ${submissionLimits.maxAllowed} products until they're approved.`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Product</CardTitle>
        <CardDescription>
          Enter information about a laundry product to add it to our database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!submissionLimits.allowed && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Submission Limit Reached</AlertTitle>
            <AlertDescription>
              You've reached your submission limit of {submissionLimits.maxAllowed} products. 
              Please wait for admin approval of your existing submissions before adding more products.
            </AlertDescription>
          </Alert>
        )}
        
        {submissionLimits.allowed && submissionLimits.remainingAllowed < submissionLimits.maxAllowed && (
          <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Submission Limit</AlertTitle>
            <AlertDescription className="text-amber-700">
              You can submit {submissionLimits.remainingAllowed} more product(s) before reaching your current limit.
              {getTrustLevelMessage()}
            </AlertDescription>
          </Alert>
        )}
        
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
                        <SelectItem value="Laundry Sheet">Laundry Sheet</SelectItem>
                        <SelectItem value="Laundry Pod">Laundry Pod</SelectItem>
                        <SelectItem value="Dishwasher Pod">Dishwasher Pod</SelectItem>
                        <SelectItem value="Dishwasher Sheet">Dishwasher Sheet</SelectItem>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                        <SelectItem value="Other">Other (handwash etc)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="countries"
                render={() => (
                  <FormItem>
                    <FormLabel>Countries/Regions</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={countryOptions}
                        selected={selectedCountries}
                        onChange={(selected) => {
                          setSelectedCountries(selected);
                          form.setValue('countries', selected);
                        }}
                        placeholder="Select countries"
                      />
                    </FormControl>
                    <FormDescription>
                      Select all regions where this product is sold
                    </FormDescription>
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
                  <FormLabel>PVA Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter PVA percentage (e.g. 25)"
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    If known, enter the PVA percentage from the product packaging or documentation.
                    If unknown, leave blank and we'll estimate based on product type.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Products containing PVA without a specified percentage will be estimated at 25% by default.
                This is only an estimate as many manufacturers do not disclose exact PVA content.
              </AlertDescription>
            </Alert>
            
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
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={submitting || !submissionLimits.allowed}
            >
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
  );
};

export default ProductForm;
