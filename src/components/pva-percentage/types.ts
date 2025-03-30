
import { z } from "zod";

export const formSchema = z.object({
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

export type PvaFormValues = z.infer<typeof formSchema>;

export interface VerificationResult {
  success: boolean;
  containsPva: boolean;
  detectedTerms: string[];
  extractedIngredients: string | null;
  extractedPvaPercentage: number | null;
  message: string;
  url?: string;
  needsManualVerification?: boolean;
}

export interface PvaPercentageFormProps {
  onSubmitSuccess?: () => void;
  defaultBrand?: string;
  defaultProduct?: string;
  isAdmin?: boolean;
}
