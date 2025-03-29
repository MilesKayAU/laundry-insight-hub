
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  ChevronDown, 
  Home, 
  UploadCloud, 
  Database, 
  Settings, 
  Flask, 
  Microscope, 
  Beaker
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Contribute", path: "/contribute", icon: <UploadCloud className="h-4 w-4 mr-2" /> },
    { name: "Database", path: "/database", icon: <Database className="h-4 w-4 mr-2" /> },
    { name: "Admin", path: "/admin", icon: <Settings className="h-4 w-4 mr-2" /> },
    { name: "About PVA", path: "/about", icon: <Flask className="h-4 w-4 mr-2" /> },
    { name: "PVA Free", path: "/pva-free", icon: <Beaker className="h-4 w-4 mr-2" /> },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-science-500 to-tech-500 animate-pulse-glow">
            <Microscope className="h-5 w-5 text-white absolute" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-science-700 to-tech-600 bg-clip-text text-transparent">
            PVAFree
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-science-100 text-science-800 font-medium">
            .com
          </span>
        </Link>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-science-700">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] border-l border-science-100">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center px-3 py-2 rounded-md hover:bg-science-50 transition-colors text-science-800"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-2 rounded-md hover:bg-science-50 transition-colors text-science-800"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
