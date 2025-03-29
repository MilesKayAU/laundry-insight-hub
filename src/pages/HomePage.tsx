import { ArrowRight, Upload, Database, Shield, FlaskConical, Microscope, MoveRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-tech-50 to-science-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-science-300 filter blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-tech-300 filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center mb-8 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-science-100 shadow-sm">
            <FlaskConical className="h-4 w-4 text-science-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Collaborative Product Database</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-science-700 to-tech-600 bg-clip-text text-transparent">
              PVAFree.com
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-700">
            Exposing the Plastic-Free Myth — Uncovering the Truth About PVA in Laundry Products.
            We analyze ingredients, decode greenwashing, and empower you to choose truly plastic-free solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-science-600 hover:bg-science-700 shadow-lg">
              <Link to="/contribute">
                Contribute Data <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-science-400 text-science-600 hover:bg-science-50">
              <Link to="/database">
                View Database <Database className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-science-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-science-800">How PVAFree Works</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-science-400 to-tech-400 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="science-card p-8 flex flex-col items-center">
              <div className="bg-science-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Upload className="h-6 w-6 text-science-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-science-800">Upload & Contribute</h3>
              <p className="text-gray-600 text-center">
                Our algorithm scans product images for PVA ingredients using advanced optical character recognition.
              </p>
            </div>
            
            <div className="science-card p-8 flex flex-col items-center">
              <div className="bg-tech-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-6 w-6 text-tech-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-science-800">Verification Process</h3>
              <p className="text-gray-600 text-center">
                Our lab-grade verification system ensures complete accuracy before database inclusion.
              </p>
            </div>
            
            <div className="science-card p-8 flex flex-col items-center">
              <div className="bg-science-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Database className="h-6 w-6 text-science-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-science-800">Data Visualization</h3>
              <p className="text-gray-600 text-center">
                Advanced analytics show precise PVA measurements across different laundry products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PVA Illustration Section */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                <Info className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Understanding PVA</span>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-science-800">Understanding Polyvinyl Alcohol (PVA) in Your Laundry Products</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Polyvinyl Alcohol, or PVA, is a synthetic polymer commonly found in many laundry sheets and pods. 
                It's primarily used as a dissolvable film that conveniently disappears in water. While marketed as 
                fully biodegradable, recent research suggests concerns that PVA may not break down as effectively as 
                manufacturers claim.
              </p>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-science-700">What's the Potential Issue with PVA?</h3>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  Once dissolved, PVA often remains invisible in wastewater and may persist as potential microplastics. 
                  These small particles have been detected in various aquatic environments, raising concerns about their 
                  contribution to pollution in rivers, lakes, and oceans. Some popular laundry products contain up to 
                  40% PVA, meaning a single kilogram of laundry sheets or pods could potentially introduce roughly 400ml 
                  of invisible PVA into waterways.
                </p>
              </div>
              <Button asChild variant="outline" className="bg-white border-amber-300 hover:bg-amber-50 text-amber-800">
                <Link to="/about">
                  Learn More About PVA Impact
                  <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2 relative">
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/lovable-uploads/92933f9c-0e6a-46ef-8059-9b5c4cb8d2db.png" 
                  alt="PVA dripping from laundry sheets" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-md text-sm font-medium">
                PVA residue doesn't fully dissolve
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About PVA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-science-50 to-tech-50">
        <div className="container mx-auto">
          <div className="glass-effect p-10 rounded-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Microscope className="h-8 w-8 text-science-600 mr-3" />
              <h2 className="text-3xl font-bold text-science-800">Why Should We Be Concerned?</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-science-700">Environmental Persistence</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  PVA may not fully degrade in typical wastewater treatment plants or in private septic systems. 
                  Wastewater treatment facilities and septic tanks often lack the specific conditions or enzymes 
                  required to break down this synthetic polymer effectively, potentially allowing it to accumulate 
                  and eventually contaminate local ecosystems.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-science-700">Potential Microplastic Pollution</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  If PVA breaks down into microplastics, these particles could harm aquatic life and enter the food 
                  chain, potentially impacting wildlife and human health. Traces of PVA have reportedly been detected 
                  in human breast milk, raising further concerns about environmental exposure.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-science-700">Impact on Plants and Ecosystems</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  As PVA slowly breaks down, it may release compounds such as ethylene. While ethylene is naturally 
                  consumed by plants, excessive amounts released from synthetic sources could disrupt plant growth 
                  cycles and alter the balance of natural ecosystems.
                </p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-xl text-science-700 font-medium mb-6">
                Making truly eco-friendly choices involves more than convenience—it means understanding the hidden 
                impacts of the products we use every day. By being aware of substances like PVA and their broader 
                implications, we can make informed decisions to protect our health, waterways, and planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-tech-600 to-science-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Research Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Help us expand our molecular database and bring scientific transparency to household products.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-science-700 hover:bg-gray-100">
            <Link to="/contribute">
              Contribute Research Data
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
