
import React from "react";
import { AlertTriangle, Info, ArrowRight, Check, Recycle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const PvaJargonPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-science-800 mb-4">PVA Jargon</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-science-700 mb-8">
          What Companies Say vs What It Really Means
        </h2>
        
        <div className="prose prose-science max-w-none mb-12">
          <p className="text-lg mb-6">
            At pvafree.com, we believe in transparency. Many laundry brands market themselves as eco-friendly or 
            plastic-free, yet use polyvinyl alcohol (PVA) — a synthetic, water-soluble plastic — in their 
            detergent sheets and pods. Here's how clever wording and selective facts can hide the real environmental impact.
          </p>
        </div>
        
        {/* Jargon Items */}
        <div className="space-y-8 mb-12">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <span>1. "Biodegradable" – Only in Perfect Conditions</span>
              </h3>
              <p className="font-medium text-gray-700 italic mb-3">"PVA is biodegradable."</p>
              <p className="mb-4">
                PVA can biodegrade — but only in specific industrial wastewater environments with the right microbes, 
                temperature, and time. In oceans, rivers, septic tanks, or greywater systems, it may persist or partially 
                degrade, raising long-term environmental concerns.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center gap-1 mb-2">
                  <Info className="h-4 w-4 text-science-600" /> Sources:
                </h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li><a href="#" className="text-science-600 hover:underline">Arizona State University Study</a></li>
                  <li><a href="#" className="text-science-600 hover:underline">Washington Post</a></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <span>2. "Dissolves in Water" ≠ Harmless</span>
              </h3>
              <p className="font-medium text-gray-700 italic mb-3">"PVA fully dissolves and disappears."</p>
              <p className="mb-4">
                Dissolving isn't the same as breaking down. PVA becomes invisible in water — but the chemical structure 
                remains unless it's fully metabolized by specific bacteria. This means millions of homes may unknowingly 
                flush synthetic polymers into waterways.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <span>3. "Plant-Derived" – But Still a Plastic</span>
              </h3>
              <p className="font-medium text-gray-700 italic mb-3">"PVA is plant-based."</p>
              <p className="mb-4">
                This is misleading. While some precursors like ethylene may come from plants or natural gas, 
                PVA is a synthetic polymer — a plastic — that undergoes heavy industrial processing. The end 
                product is man-made and classified as a plastic by science.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <span>4. "Used in Eye Drops and Contact Lenses"</span>
              </h3>
              <p className="font-medium text-gray-700 italic mb-3">"PVA is medical-grade and used in contact lens solutions."</p>
              <p className="mb-4">
                True — but context matters. Medical-grade PVA is used in tiny, controlled doses and disposed of properly. 
                Your laundry sheet may contain 20–40% PVA, sent directly into drains daily, with no certainty of safe breakdown.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <span>5. "Safe for Marine Life" – Based on Limited Testing</span>
              </h3>
              <p className="font-medium text-gray-700 italic mb-3">"PVA is safe and non-toxic to aquatic organisms."</p>
              <p className="mb-4">
                There is no long-term data on the cumulative effects of high-volume daily disposal of PVA in marine ecosystems. 
                Some studies suggest reproductive and digestive impacts on aquatic species from dissolved polymers and cross-linked residues.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <span>6. "Plastic-Free" – But Includes Water-Soluble Plastics</span>
              </h3>
              <p className="font-medium text-gray-700 italic mb-3">"This detergent is 100% plastic-free."</p>
              <p className="mb-4">
                This is one of the most misleading claims. Companies often refer only to visible plastic packaging. 
                In reality, polyvinyl alcohol is a plastic — it just dissolves. It's invisible, not absent.
              </p>
              <Alert variant="default" className="bg-science-50 border-science-200 text-science-800">
                <AlertTitle className="font-medium flex items-center gap-1">
                  <Check className="h-4 w-4 text-science-600" /> The truth:
                </AlertTitle>
                <AlertDescription className="mt-1">
                  Saying plastic-free while using PVA is like saying sugar-free while using high-fructose corn syrup. 
                  It's a technical loophole — not transparency.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        {/* Comparison Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <Recycle className="h-6 w-6 text-science-600" />
            <span>What About Recyclable Plastic Bottles?</span>
          </h3>
          <p className="mb-4">
            Many brands ditch bottles and claim superiority. But here's the reality:
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-science-50">
                  <th className="border border-gray-200 p-3 text-left">Plastic Bottle (e.g. Liquid Detergent)</th>
                  <th className="border border-gray-200 p-3 text-left">Laundry Sheet with PVA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-3">Recyclable in most regions</td>
                  <td className="border border-gray-200 p-3">Not recyclable</td>
                </tr>
                <tr className="bg-science-50">
                  <td className="border border-gray-200 p-3">Can be responsibly disposed</td>
                  <td className="border border-gray-200 p-3">Must go down the drain</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3">Empties may be reused or repurposed</td>
                  <td className="border border-gray-200 p-3">Not recoverable</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="space-y-2">
            <p className="flex items-center text-science-700">
              <ArrowRight className="h-4 w-4 mr-2 text-science-500" />
              With a recyclable bottle, you have a choice.
            </p>
            <p className="flex items-center text-science-700">
              <ArrowRight className="h-4 w-4 mr-2 text-science-500" />
              With PVA-based sheets, there's no choice — PVA enters the water system.
            </p>
          </div>
        </div>
        
        {/* Greenwashing Section */}
        <Card className="border-l-4 border-l-science-600 mb-12">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Info className="h-6 w-6 text-science-600" />
              <span>The Bigger Problem: Greenwashing by Comparison</span>
            </h3>
            <p className="mb-4">
              Some companies defend PVA by saying:
            </p>
            <blockquote className="border-l-4 border-gray-300 pl-4 mb-4 italic">
              "Plastic packaging is a much bigger issue."
            </blockquote>
            <p className="mb-6">
              That's true in volume — but scale isn't the only problem. PVA may be creating a long-term, 
              invisible pollutant, much like how microplastics were ignored a decade ago.
            </p>
            
            <h4 className="text-lg font-medium text-science-700 mb-3">Imagine 10 years from now:</h4>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Billions of loads of laundry</li>
              <li>Millions of kilograms of PVA poured down drains</li>
              <li>No filtration or recovery</li>
              <li>A possible new class of microplastic pollution we can't trace or remove.</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Conclusion */}
        <Card className="border-t-4 border-t-science-600 bg-science-50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-science-600" />
              <span>We're Not Anti-Innovation — We're Pro-Transparency</span>
            </h3>
            <p className="text-lg">
              Your choices matter. That's why pvafree.com was created:
              To uncover the truth, validate brands with proof, and protect our waterways.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PvaJargonPage;
