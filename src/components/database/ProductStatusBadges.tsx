
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { ProductSubmission } from "@/lib/textExtractor";

// Type guard to check if a product is a ProductSubmission
export const isProductSubmission = (product: any): product is ProductSubmission => {
  return 'pvaStatus' in product;
};

interface PvaStatusBadgeProps {
  product: any;
}

export const PvaStatusBadge: React.FC<PvaStatusBadgeProps> = ({ product }) => {
  if (isProductSubmission(product)) {
    if (product.pvaStatus === 'contains') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Contains PVA
        </Badge>
      );
    } else if (product.pvaStatus === 'verified-free') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          PVA-Free
        </Badge>
      );
    } else if (product.pvaStatus === 'needs-verification') {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          Needs Verification
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          Inconclusive
        </Badge>
      );
    }
  } else if (product.pvaPercentage === 0) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        PVA-Free
      </Badge>
    );
  } else if (product.pvaPercentage && product.pvaPercentage > 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Contains PVA
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
        <HelpCircle className="h-3 w-3" />
        Unknown
      </Badge>
    );
  }
};

export const PvaPercentageDisplay: React.FC<PvaStatusBadgeProps> = ({ product }) => {
  if (isProductSubmission(product)) {
    return product.pvaPercentage ? `${product.pvaPercentage}%` : 'Unknown';
  } else if (product.pvaPercentage !== null && product.pvaPercentage !== undefined) {
    return `${product.pvaPercentage}%`;
  } else {
    return (
      <span className="flex items-center gap-1">
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Unknown
        </Badge>
      </span>
    );
  }
};

export const BrandVerificationBadge: React.FC<PvaStatusBadgeProps> = ({ product }) => {
  if (!isProductSubmission(product)) return null;
  
  if (product.brandVerified) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  } else if (product.brandOwnershipRequested) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 ml-2">
        Verification Pending
      </Badge>
    );
  }
  return null;
};
