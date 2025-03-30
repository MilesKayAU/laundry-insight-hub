
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Percent } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PvaFormValues } from "./types";

interface FormSectionProps {
  form: UseFormReturn<PvaFormValues>;
  disabled?: boolean;
}

export const ProductInfoSection: React.FC<FormSectionProps> = ({ form, disabled = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="brandName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Name</FormLabel>
            <FormControl>
              <Input placeholder="Brand name" {...field} disabled={disabled} />
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
              <Input placeholder="Product name" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const PvaPercentageSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
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
  );
};

export const AdditionalNotesSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
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
  );
};
