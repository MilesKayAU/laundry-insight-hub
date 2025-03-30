
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutPva = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-pvablue-500 to-pvagreen-500 bg-clip-text text-transparent">
        Learn More About PVA (Polyvinyl Alcohol)
      </h1>
      
      <div className="mb-8 text-center">
        <p className="text-lg mb-4">
          It's marketed as "biodegradable" and "plant-based," but the truth is more complex. 
          This page helps you understand what PVA is, how it behaves in the environment, 
          and why there are ongoing discussions about its environmental impact.
        </p>
      </div>

      <div className="space-y-10">
        {/* What is PVA section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🧪</span> What is PVA?
          </h2>
          <p className="mb-4">
            PVA (Polyvinyl Alcohol) is a synthetic polymer made by chemically modifying 
            polyvinyl acetate. It's widely used in:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Laundry sheets</li>
            <li>Dishwasher pods</li>
            <li>Detergent capsules</li>
            <li>Eye drops</li>
            <li>Paper coatings</li>
          </ul>
          <p className="mb-4">
            PVA is water-soluble, which means it dissolves when mixed with water — 
            but there are varying opinions on whether it fully degrades or breaks down into harmless substances in all environments.
          </p>
          <p className="text-sm text-gray-600 flex items-center">
            <span className="mr-1">👉</span> Source: 
            <a 
              href="https://pubchem.ncbi.nlm.nih.gov/compound/162112" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pvablue-500 hover:text-pvablue-700 ml-1 flex items-center"
            >
              PubChem - Polyvinyl Alcohol (CID 162112)
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </p>
        </section>

        {/* Is PVA Biodegradable section */}
        <Card>
          <CardContent className="pt-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">🌱</span> Is PVA Biodegradable?
              </h2>
              <p className="mb-4">
                Some manufacturers claim PVA is biodegradable — and while it can degrade under 
                specific conditions, opinions differ on whether this reliably happens in real-world environments.
              </p>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">📌</span> Key considerations:
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>Some home septic systems and waterways may not provide ideal conditions for breakdown.</li>
                <li>PVA may require specific wastewater treatment processes and enzymes to fully degrade.</li>
                <li>Research suggests that in some regions, PVA might pass through treatment plants without complete degradation.</li>
              </ul>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-1">👉</span> Source: 
                  <a 
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7559886/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pvablue-500 hover:text-pvablue-700 ml-1 flex items-center"
                  >
                    NIH Environmental Research - Biodegradability of PVA in Wastewater
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-1">👉</span> Source: 
                  <a 
                    href="https://pubs.acs.org/doi/10.1021/acs.est.1c06623" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pvablue-500 hover:text-pvablue-700 ml-1 flex items-center"
                  >
                    American Chemical Society – Concerns about PVA in detergent pods
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* PVA and Microplastics section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🌊</span> PVA and Potential Microplastics Concerns
          </h2>
          <p className="mb-4">
            Some studies suggest that dissolved PVA may potentially contribute to microplastic-like pollution, 
            though the scientific consensus is still evolving on this topic.
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>
              One U.S. study found that a significant portion of PVA from laundry pods may pass through 
              certain wastewater treatment systems.
            </li>
            <li>
              While PVA is currently not officially classified as a microplastic due to its soluble nature, 
              some researchers suggest it may one day be considered in a similar category if it persists in the environment.
            </li>
            <li>
              The scientific judgment on whether dissolved PVA should be considered equivalent to microplastics remains mixed, 
              with ongoing research exploring its environmental fate.
            </li>
          </ul>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">👉</span> Source: 
              <a 
                href="https://plasticoceans.org/the-truth-about-pva/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pvablue-500 hover:text-pvablue-700 ml-1 flex items-center"
              >
                Plastic Oceans International – The Truth About PVA
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">👉</span> Source: 
              <a 
                href="https://www.blueland.com/blogs/news/polyvinyl-alcohol-pva-study" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pvablue-500 hover:text-pvablue-700 ml-1 flex items-center"
              >
                Blueland & Plastic Pollution Coalition – Peer-reviewed PVA Study Summary
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
          </div>
        </section>

        {/* Plant-Based PVA section */}
        <Card>
          <CardContent className="pt-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">⚠️</span> What About "Plant-Based" PVA?
              </h2>
              <p className="mb-4">
                Some companies claim PVA is "plant-based" — this may be somewhat misleading.
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>
                  While the feedstocks (e.g. sugarcane or corn glucose) may be plant-derived, 
                  they undergo extensive chemical processing.
                </li>
                <li>
                  The final product is still a synthetic polymer — structurally different from 
                  naturally occurring materials like starch or cellulose.
                </li>
              </ul>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">👉</span> Source: 
                <a 
                  href="https://www.sciencedirect.com/topics/materials-science/polyvinyl-alcohol" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pvablue-500 hover:text-pvablue-700 ml-1 flex items-center"
                >
                  ScienceDirect – Polyvinyl Alcohol Manufacturing & Properties
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPva;

