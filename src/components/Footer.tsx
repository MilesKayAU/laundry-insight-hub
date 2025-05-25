
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PVA Free</h3>
            <p className="text-gray-300">
              Community-driven transparency for plastic-free laundry solutions.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-3">Learn</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about-pva" className="text-gray-300 hover:text-white transition-colors">
                  About PVA
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-gray-300 hover:text-white transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link to="/research" className="text-gray-300 hover:text-white transition-colors">
                  Research
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-3">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contribute" className="text-gray-300 hover:text-white transition-colors">
                  Contribute
                </Link>
              </li>
              <li>
                <Link to="/database" className="text-gray-300 hover:text-white transition-colors">
                  Database
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-gray-300 hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400">
            © 2024 PVA Free. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
