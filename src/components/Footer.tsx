
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">PVAFree.com</h3>
            <p className="text-muted-foreground">
              Making laundry product ingredients transparent and helping consumers make informed choices.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/contribute" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contribute
                </Link>
              </li>
              <li>
                <Link to="/database" className="text-muted-foreground hover:text-foreground transition-colors">
                  Product Database
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PVAFree.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
