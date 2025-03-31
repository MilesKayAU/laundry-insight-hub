
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  ChevronDown, 
  Home, 
  UploadCloud, 
  Database, 
  Settings, 
  Beaker, 
  Microscope, 
  FlaskConical,
  LogOut,
  User,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Database", path: "/database" },
  { label: "Research", path: "/research" },
  { label: "About PVA", path: "/about" },
  { label: "PVA Free", path: "/pva-free" },
  { label: "Certification", path: "/certification" },
];

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const menuItems = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "About PVA", path: "/about", icon: <FlaskConical className="h-4 w-4 mr-2" /> },
    { name: "Database", path: "/database", icon: <Database className="h-4 w-4 mr-2" /> },
    { name: "Contribute", path: "/contribute", icon: <UploadCloud className="h-4 w-4 mr-2" /> },
    // Only include Admin link if user is admin
    ...(isAdmin ? [{ name: "Admin", path: "/admin", icon: <Settings className="h-4 w-4 mr-2" /> }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/0fdd04f0-7cdc-4a8e-94a4-1e07f79dafe1.png" 
            alt="PVAFree.com Logo" 
            className="h-20" 
          />
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
                <div className="mt-4 border-t pt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-science-100 text-science-700">
                            {getInitials(user?.user_metadata?.full_name || user?.email || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 rounded-md hover:bg-science-50 transition-colors text-science-800 mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-science-50 transition-colors text-science-800"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login / Register
                    </Link>
                  )}
                </div>
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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-science-100 text-science-700">
                        {getInitials(user?.user_metadata?.full_name || user?.email || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm" className="ml-2">
                <Link to="/auth">Login / Register</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
