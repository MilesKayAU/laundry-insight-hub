
import React from 'react';
import { Shield, Check, FileCheck, Leaf, DollarSign, Send } from 'lucide-react';
import PvaCertificationBadge from '@/components/PvaCertificationBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const CertificationPage = () => {
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
      
      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-science-50 to-tech-50 p-10 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Certified?</h2>
        <p className="max-w-xl mx-auto mb-6 text-muted-foreground">
          Join the growing network of environmentally responsible businesses offering PVA-free laundry solutions.
        </p>
        <div className="flex flex-col items-center">
          <Button size="lg" className="bg-science-600 hover:bg-science-700 mb-6">
            <Send className="mr-2 h-4 w-4" /> Contact Us for Certification
          </Button>
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
