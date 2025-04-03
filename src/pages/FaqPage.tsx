
import React from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-science-800">
          ✅ Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xl text-center mb-12 text-gray-600">
          Everything You Need to Know About PVAFree.com
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="what-is-pvafree" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ What is PVAFree.com?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                PVAFree.com is a free, independent, community-driven database that investigates whether household detergent products contain Polyvinyl Alcohol (PVA) — a synthetic plastic polymer that dissolves in water but may not fully biodegrade.
              </p>
              <p className="mb-4">
                Many brands market their products as "plastic-free", but use PVA-based film in laundry sheets and pods. Our goal is to cut through the confusion by collecting ingredient data, scientific findings, and community contributions to help consumers make better-informed choices.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is-pvafree-free" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Is PVAFree.com completely free?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                Yes — PVAFree.com is a voluntary, public-access project, similar in spirit to Wikipedia.
              </p>
              <p className="mb-4">
                You can:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Browse listings
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> See verified ingredient details
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Submit new products or corrections
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Read research and FAQ content
                </li>
              </ul>
              <p className="mb-4">
                <span className="inline-flex items-center">
                  <span className="text-gray-600 mr-2">🔒</span> The only paid offering is our Certified PVA-Free badge, which eligible brands may license for product packaging and marketing (see below).
                </span>
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="plastic-free-claims" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Why do companies say "Plastic-Free" if their products contain PVA?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                This is one of the most common misconceptions in the space.
              </p>
              <p className="mb-4">
                Many brands promote their product as plastic-free because they have no plastic packaging — but the product itself (e.g., a laundry sheet or pod) may contain PVA (Polyvinyl Alcohol), which is classified as a plastic polymer by:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>US Environmental Protection Agency (EPA)</li>
                <li>European Chemicals Agency (ECHA)</li>
                <li>Organisation for Economic Co-operation and Development (OECD)</li>
              </ul>
              <p className="mb-4">
                Since PVA dissolves in water, some companies argue it's "not plastic" — but:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Dissolving ≠ biodegrading</li>
                <li>Water treatment plants may not break down all PVA</li>
                <li>Residuals can enter waterways and persist in ecosystems</li>
              </ul>
              <p className="mb-4">
                <span className="text-green-500 mr-2">✅</span> So when you see "plastic-free," ask: Are they talking about the packaging — or the formula itself?
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pva-concerns" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Why is PVA a concern?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                PVA is water-soluble, but not fully biodegradable in all real-world settings. Research shows:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>A large percentage of PVA bypasses treatment plants</li>
                <li>It may contribute to sludge accumulation or microplastic-like residues</li>
                <li>It can interfere with aquatic ecosystems and microbial environments</li>
              </ul>
              <p className="mb-4">
                This is especially concerning when 40% or more of a detergent sheet's weight may be PVA.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="certified-pva-free" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ What does "Certified PVA-Free" mean?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                It's a voluntary certification badge issued by PVAFree.com for products that:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Contain no Polyvinyl Alcohol (PVA)</li>
                <li>Contain no water-soluble plastic polymers</li>
              </ul>
              <p className="mb-4">
                This is the only chargeable service on our site. Brands that meet the criteria may license the badge to display on:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Product packaging</li>
                <li>Online stores</li>
                <li>Marketing material</li>
              </ul>
              <p className="mb-4">
                Each certification has a unique ID, public listing, and is community-verifiable.
              </p>
              <p className="mb-4">
                Learn more at <a href="/certification" className="text-science-600 hover:underline">pvafree.com/certification</a>
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="product-types" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ What product types does PVAFree.com currently track?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                We currently include products in the following categories:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Laundry Sheet</li>
                <li>Laundry Pod</li>
                <li>Dishwasher Pod</li>
                <li>Dishwasher Sheet</li>
                <li>Tablet (e.g. cleaner or machine tabs)</li>
                <li>Other (e.g. handwash, surface cleaner, etc.)</li>
              </ul>
              <p className="mb-4">
                These are common areas where PVA film or polymers are used in dissolvable delivery formats.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="verification-method" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ How do you verify if a product contains PVA?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                We follow a 3-step approach:
              </p>
              <p className="font-medium mt-4">1. Ingredient & SDS Review</p>
              <p className="mb-2">We analyze public ingredient disclosures and SDS (Safety Data Sheets) for signs of:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Polyvinyl Alcohol</li>
                <li>PVOH, PVAL, PVA film</li>
                <li>Associated CAS numbers (e.g. 9002-89-5)</li>
              </ul>
              
              <p className="font-medium mt-4">2. Cross-check with known aliases and manufacturers</p>
              <p className="mb-4">We track known water-soluble film variants and industry usage trends.</p>
              
              <p className="font-medium mt-4">3. Community Observations</p>
              <p className="mb-4">Where available, we include reports from users on PVA behavior (e.g. slime formation with borax, drying behavior, residue in machines, etc.)</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="lab-testing" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Are products reviewed in a lab?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                No. PVAFree.com is a community-powered research database, not a testing laboratory.
              </p>
              <p className="mb-4">
                We rely on:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Ingredient and SDS transparency
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Manufacturer disclosures
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Community experiments and feedback
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Third-party research and academic sources
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="company-corrections" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Can companies submit corrections or ingredient info?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                Yes — we welcome collaboration with:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Brand representatives
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Eco retailers
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Chemists or formulators
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span> Concerned consumers
                </li>
              </ul>
              <p className="mb-4">
                If a product is incorrectly listed or needs an update, please contact us with documentation (such as an SDS or official ingredient list), and we'll review and update it promptly.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="database-complete" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Is this database complete?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                Not yet — but we're expanding quickly.
              </p>
              <p className="mb-4">
                Our mission is to be the most accurate public directory of dissolvable detergent products and their plastic content. We rely on:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Brand transparency</li>
                <li>Community submissions</li>
                <li>Ongoing research</li>
              </ul>
              <p className="mb-4">
                You can help! Submit or correct listings at:
              </p>
              <p className="mb-4">
                👉 <a href="/contribute" className="text-science-600 hover:underline">pvafree.com/contribute</a>
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="retailer-use" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ I'm a retailer or eco-brand — can I use this data?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                Yes! We welcome responsible retailers, marketplaces, and certifiers to reference or link to our product data and classifications.
              </p>
              <p className="mb-4">
                Please credit the source and contact us for:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Badge licensing</li>
                <li>Filter integration (e.g. "PVA-Free" filters)</li>
                <li>Cross-promotional collaborations</li>
              </ul>
              <p className="mb-4">
                Email: partner@pvafree.com
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="funding" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ How is this project funded?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                This is a not-for-profit project supported by:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💚</span> Volunteer researchers and contributors
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💚</span> Public donations (coming soon)
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💚</span> Badge certification license fees (optional)
                </li>
              </ul>
              <p className="mb-4">
                We keep the platform free, unbiased, and transparent. We are not affiliated with detergent brands.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="final-thought" className="border rounded-lg p-2">
            <AccordionTrigger className="text-lg font-medium">
              ❓ Final Thought: Why does this matter?
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <p className="mb-4">
                Because small ingredients make a big impact.
              </p>
              <p className="mb-4">
                With up to 400g of synthetic plastic per kilo of laundry sheets in some PVA-based brands — but no disclosure to consumers — we believe it's time for clear labeling and honest claims.
              </p>
              <p className="mb-4">
                When you choose a true plastic-free alternative, you help:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🌊</span> Reduce microplastic pollution
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🐠</span> Protect aquatic life
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🧼</span> Choose transparency over marketing spin
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default FaqPage;
