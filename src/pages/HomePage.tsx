import { ArrowRight, Upload, Database, Shield, FlaskConical, Microscope, MoveRight } from "lucide-react";
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
            Using advanced methods to analyze and validate laundry product ingredients, helping you make science-based choices.
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

      {/* About PVA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-science-50 to-tech-50">
        <div className="container mx-auto">
          <div className="glass-effect p-10 rounded-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Microscope className="h-8 w-8 text-science-600 mr-3" />
              <h2 className="text-3xl font-bold text-science-800">The Science of PVA</h2>
            </div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Polyvinyl Alcohol (PVA) is a synthetic polymer widely used in laundry products. Our scientific analysis 
              reveals concerns about its environmental persistence and potential impact on aquatic ecosystems. 
              PVAFree.com employs molecular-level analysis to provide you with accurate data.
            </p>
            <div className="text-center">
              <Button asChild variant="outline" className="bg-white border-science-200 hover:bg-science-50 text-science-700">
                <Link to="/about" className="inline-flex items-center">
                  Explore the Research
                  <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
