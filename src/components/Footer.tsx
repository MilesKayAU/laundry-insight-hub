import { Link } from "react-router-dom";
import { Mail, Github, Twitter, ShieldCheck } from "lucide-react";

// Custom link component that scrolls to top on click
const ScrollTopLink = ({ to, children, className }) => {
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

// New component for external links with proper SEO attributes
const ExternalLink = ({ href, children, className }) => {
  return (
    <a 
      href={href} 
      className={className}
      target="_blank" 
      rel="nofollow noopener noreferrer"
    >
      {children}
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-science-900 to-tech-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col items-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/81ba1971-9504-4977-a9a9-493f5351c835.png" 
              alt="PVAFree.com Logo" 
              className="h-24" 
            />
          </div>
          <p className="text-gray-300 max-w-md text-center mt-3">
            Advancing scientific transparency in consumer products through data analysis and verification.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-b border-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-4 text-science-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <ScrollTopLink to="/" className="text-gray-300 hover:text-science-300 transition-colors">
                  Home
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/contribute" className="text-gray-300 hover:text-science-300 transition-colors">
                  Contribute
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/database" className="text-gray-300 hover:text-science-300 transition-colors">
                  Product Database
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/about" className="text-gray-300 hover:text-science-300 transition-colors">
                  About PVA
                </ScrollTopLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-science-300">Resources</h3>
            <ul className="space-y-2">
              <li>
                <ScrollTopLink to="/research" className="text-gray-300 hover:text-science-300 transition-colors">
                  Research Papers
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/methodology" className="text-gray-300 hover:text-science-300 transition-colors">
                  Our Methodology
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/faq" className="text-gray-300 hover:text-science-300 transition-colors">
                  FAQ
                </ScrollTopLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-science-300">Certification</h3>
            <ul className="space-y-2">
              <li>
                <ScrollTopLink to="/certification" className="text-gray-300 hover:text-science-300 transition-colors flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  PVA-Free Certification
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/pva-free" className="text-gray-300 hover:text-science-300 transition-colors">
                  Certified Products
                </ScrollTopLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-science-300">Legal</h3>
            <ul className="space-y-2">
              <li>
                <ScrollTopLink to="/terms" className="text-gray-300 hover:text-science-300 transition-colors">
                  Terms & Conditions
                </ScrollTopLink>
              </li>
              <li>
                <ScrollTopLink to="/privacy" className="text-gray-300 hover:text-science-300 transition-colors">
                  Privacy Policy
                </ScrollTopLink>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} PVAFree.com. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <ExternalLink href="#" className="text-gray-400 hover:text-science-300 transition-colors">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </ExternalLink>
            <ExternalLink href="#" className="text-gray-400 hover:text-science-300 transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </ExternalLink>
            <ExternalLink href="#" className="text-gray-400 hover:text-science-300 transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </ExternalLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
