
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
          Community-Powered PVA Transparency
        </h1>
        <p className="text-xl mb-8 text-gray-700">
          Uncovering the truth about PVA in laundry products. Join our community to analyze ingredients, 
          decode greenwashing, and empower others to choose truly plastic-free solutions.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/contribute">Contribute Data</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-blue-400">
            <Link to="/database">View Database</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-blue-400">
            <Link to="/videos">Educational Videos</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-blue-400">
            <Link to="/admin">Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
