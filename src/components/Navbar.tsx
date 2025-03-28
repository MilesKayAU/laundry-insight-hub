
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, Home, UploadCloud, BarChart2, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Contribute", path: "/contribute", icon: <UploadCloud className="h-4 w-4 mr-2" /> },
    { name: "Database", path: "/database", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { name: "Admin", path: "/admin", icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  return (
    <nav className="border-b bg-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-pvablue-500 to-pvagreen-500 bg-clip-text text-transparent">
            PVAFree.com
          </span>
        </Link>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center px-2 py-2 rounded-md hover:bg-muted transition-colors"
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
          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-2 py-2 rounded-md hover:bg-muted transition-colors"
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
