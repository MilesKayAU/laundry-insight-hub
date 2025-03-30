
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PvaPercentageForm from '@/components/PvaPercentageForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, HelpCircle, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PvaPercentageUpdatePage: React.FC = () => {
  const { brandName, productName } = useParams<{ brandName: string; productName: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleSubmitSuccess = () => {
    // Navigate back to the database page after successful submission
    setTimeout(() => {
      navigate('/database');
    }, 1500);
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-4 -ml-4 pl-2" 
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Percent className="h-6 w-6" />
            Update PVA Percentage
          </h1>
          <p className="text-muted-foreground mt-1">
            Help improve our database with accurate PVA percentage information
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PvaPercentageForm 
            onSubmitSuccess={handleSubmitSuccess}
            defaultBrand={decodeURIComponent(brandName || '')}
            defaultProduct={decodeURIComponent(productName || '')}
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Why This Matters
              </CardTitle>
              <CardDescription>
                Accurate PVA percentage data helps everyone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                PVA (Polyvinyl Alcohol) is a water-soluble synthetic polymer that dissolves in water, becoming part of wastewater.
              </p>
              <p className="text-sm">
                Accurate percentage information helps:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Consumers make informed choices</li>
                <li>Researchers track environmental impact</li>
                <li>Manufacturers improve formulations</li>
                <li>Regulators develop appropriate policies</li>
              </ul>
              
              <Alert variant="default" className="mt-4 bg-blue-50 border-blue-100">
                <AlertTitle className="text-blue-800">Documentation Required</AlertTitle>
                <AlertDescription className="text-blue-700 text-sm">
                  All submissions require reliable documentation (product webpage or SDS) showing the PVA percentage. 
                  Our team will verify all submissions before updating the database.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PvaPercentageUpdatePage;
