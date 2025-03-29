
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
          and why it may not be as harmless as it seems.
        </p>
      </div>

      <div className="space-y-10">
        {/* What is PVA section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🧪</span> What is PVA?
          </h2>
          <p className="mb-4">
            PVA (Polyvinyl Alcohol) is a synthetic plastic polymer made by chemically modifying 
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
            PVA is water-soluble, which means it disappears visibly when mixed with water — 
            but that doesn't mean it fully degrades or breaks down into harmless substances.
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
                specific conditions, this doesn't always happen in the real world.
              </p>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">📌</span> Key findings:
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>Most home septic systems and waterways can't break it down.</li>
                <li>PVA requires industrial wastewater treatment and specific enzymes to degrade.</li>
                <li>In many regions, PVA passes through treatment plants and enters the environment unchanged.</li>
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
            <span className="mr-2">🌊</span> PVA and Microplastics
          </h2>
          <p className="mb-4">
            Recent studies suggest that dissolved PVA may contribute to microplastic pollution, 
            even though it's not visible to the naked eye.
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>
              One U.S. study found that 75% of PVA from laundry pods passes through 
              wastewater treatment and ends up in the environment.
            </li>
            <li>
              While it doesn't form "beads" like traditional microplastics, it still behaves 
              like a soluble plastic — persistent and synthetic.
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
                Some companies claim PVA is "plant-based" — this is misleading.
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>
                  The feedstocks (e.g. sugarcane or corn glucose) may be plant-derived, 
                  but they are heavily chemically altered.
                </li>
                <li>
                  The final product is still a synthetic plastic polymer — not a natural 
                  or bio-based material like starch or cellulose.
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
