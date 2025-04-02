
import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>PVA-Free Laundry Sheet Checker | Expose Hidden Plastic in Detergents</title>
        <meta name="description" content="Discover if your laundry sheets or pods contain liquid plastic (PVA). Search ingredients, view certified PVA-Free products, and protect our waterways." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-tech-50 to-science-100">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-science-800">
            Are Your Laundry Sheets Truly PVA-Free?
          </h1>
          <p className="text-xl mb-8 text-gray-700">
            Uncovering the truth about PVA in laundry products. Join our community to analyze ingredients, 
            decode greenwashing, and empower others to choose truly plastic-free solutions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-science-600 hover:bg-science-700">
              <Link to="/contribute">Contribute Data</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-science-400">
              <Link to="/database">View Database</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-science-400">
              <Link to="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
