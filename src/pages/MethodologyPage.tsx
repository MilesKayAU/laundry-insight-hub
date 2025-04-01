
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const MethodologyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-science-800 mb-8">Our Methodology</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-science-700 mb-6">
          How We Identify PVA in "Plastic-Free" Products
        </h2>
        
        <div className="prose prose-science max-w-none mb-12">
          <p className="text-lg mb-6">
            At PVAFree.com, we are committed to uncovering the truth behind laundry and cleaning products 
            marketed as plastic-free. While many brands promote eco-friendly messaging, they often rely 
            on PVA (Polyvinyl Alcohol) — a synthetic, water-dissolvable plastic that may not fully 
            degrade in real-world conditions. Our process uses ingredient analysis, scientific methods, 
            and public documentation to accurately classify products.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-l-4 border-l-science-600">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <span className="text-science-600 text-2xl">🔍</span> Step 1: Ingredient Verification
              </h3>
              <p className="mb-4">
                We examine Safety Data Sheets (SDS), ingredient disclosures, and public product 
                listings to identify PVA or any of its chemical variants.
              </p>
              <p className="mb-2">We search for:</p>
              <ul className="list-disc ml-6 space-y-1 mb-4">
                <li>Polyvinyl Alcohol, PVA, PVOH, PVAL, Water-Soluble Film</li>
                <li>Common chemical names or additives linked to synthetic films</li>
              </ul>
              <p>If no ingredients are listed, the product is flagged as "Unknown".</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-science-600">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <span className="text-science-600 text-2xl">🧪</span> Step 2: PVA Alias & Compound Detection
              </h3>
              <p className="mb-4">
                We reference scientific databases, chemical registries, and industry literature to 
                catch disguised or alternative forms of PVA, including:
              </p>
              <ul className="list-disc ml-6 space-y-1 mb-4">
                <li>Trade names or polymers used in detergent films</li>
                <li>CAS numbers like 9002-89-5 linked to PVA</li>
                <li>Ingredients that signal synthetic plastic films, even when not labeled as PVA</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-science-600">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <span className="text-science-600 text-2xl">🧫</span> Step 3: Real-World Testing & Observations
              </h3>
              <p className="mb-4">
                We conduct independent, in-house testing of products when possible to assess behavior 
                in real use conditions:
              </p>
              <ul className="list-disc ml-6 space-y-1 mb-4">
                <li>Dissolution in water vs. sludge formation</li>
                <li>Reactions with Borax (which cross-links PVA into gels)</li>
                <li>Effects of drying, microwaving, or peroxide exposure</li>
              </ul>
              <p>
                These observations help us identify slime-like residues, film formation, and insoluble 
                behaviors, even when products claim to be "dissolvable".
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-science-600">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <span className="text-science-600 text-2xl">✅</span> How We Classify Products
              </h3>
              <p className="mb-4">
                Each product in our database is categorized based on the best available evidence:
              </p>
              <ul className="list-disc ml-6 space-y-1 mb-4">
                <li><span className="font-semibold">PVA-Free →</span> No detectable PVA or synthetic film ingredients</li>
                <li><span className="font-semibold">Contains PVA →</span> Confirmed use of PVA or known variants</li>
                <li><span className="font-semibold">Needs Verification →</span> Ingredients partially listed or unclear</li>
                <li><span className="font-semibold">Unknown →</span> No ingredient data or documentation available</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-l-4 border-l-science-600 mb-12">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span className="text-science-600 text-2xl">💧</span> Why This Matters
            </h3>
            <p className="mb-4">
              PVA can make up to 40% of the weight of some "eco" laundry sheets. While it vanishes 
              in water, it may not fully biodegrade in wastewater systems — and scientific modeling 
              shows a portion may enter marine environments.
            </p>
            <p className="font-medium">
              At PVAFree.com, we're helping consumers and businesses make better choices through data, 
              science, and transparency — not greenwashing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MethodologyPage;
