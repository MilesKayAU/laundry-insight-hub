
import { ArrowRight, Upload, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-pvablue-100 to-pvagreen-100">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pvablue-500 to-pvagreen-500 bg-clip-text text-transparent">
              PVAFree.com
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-700">
            Discover the true ingredients in your laundry products and make informed choices for your health and the environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-pvablue-500 hover:bg-pvablue-600">
              <Link to="/contribute">
                Contribute Data <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-pvagreen-500 text-pvagreen-600 hover:bg-pvagreen-50">
              <Link to="/database">
                View Database <Database className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How PVAFree Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pvablue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-pvablue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Upload & Contribute</h3>
              <p className="text-gray-600">
                Upload images of laundry product packaging or SDS reports. Our system scans for PVA ingredients.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pvagreen-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-pvagreen-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Verification</h3>
              <p className="text-gray-600">
                Our administrators verify each submission for accuracy before adding to the database.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pvablue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-pvablue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Database</h3>
              <p className="text-gray-600">
                Access visualized data showing PVA percentages across different laundry products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About PVA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Monitor PVA?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Polyvinyl Alcohol (PVA) is a common ingredient in laundry sheets and pods. While convenient, there are 
              growing environmental concerns about its biodegradability and impact on aquatic ecosystems. 
              PVAFree.com helps consumers make informed choices about the products they use.
            </p>
            <Button asChild variant="outline">
              <Link to="/about">
                Learn More About PVA
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pvablue-500 to-pvagreen-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Help Build Our Database</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of contributors and help make laundry product ingredients transparent for everyone.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/contribute">
              Contribute Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
