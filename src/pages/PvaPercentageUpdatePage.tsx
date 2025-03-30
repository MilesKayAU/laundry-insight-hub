
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PvaPercentageForm from '@/components/PvaPercentageForm';

const PvaPercentageUpdatePage: React.FC = () => {
  const { brandName, productName } = useParams<{ brandName: string, productName: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!brandName || !productName) {
      setError("Missing brand or product information. Please try again from the database page.");
    }
  }, [brandName, productName]);
  
  const handleGoBack = () => {
    navigate('/database');
  };
  
  const handleSubmitSuccess = () => {
    // Redirect back to the database page after successful submission
    navigate('/database');
  };
  
  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <Button 
        variant="ghost" 
        onClick={handleGoBack} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Database
      </Button>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Update PVA Percentage</h1>
        <p className="text-muted-foreground mt-2">
          Submit documentation showing the PVA percentage for {brandName} {productName}
        </p>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : (
        <PvaPercentageForm 
          defaultBrand={brandName || ""} 
          defaultProduct={productName || ""} 
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
};

export default PvaPercentageUpdatePage;
