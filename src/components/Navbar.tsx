import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MobileNavProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  openAuthDialog: () => void;
  handleSignOut: () => void;
}

export function Navbar() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const openAuthDialog = useCallback(() => {
    setOpen(false);
    navigate('/auth');
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <img src="/placeholder.svg" alt="Logo" className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            PVA Insight
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/database"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/database" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Database
            </Link>
            <Link
              to="/about-pva"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/about-pva" ? "text-foreground" : "text-foreground/60"
              )}
            >
              About PVA
            </Link>
            <Link
              to="/research"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/research" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Research
            </Link>
            <Link
              to="/pva-free"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/pva-free" ? "text-foreground" : "text-foreground/60"
              )}
            >
              PVA Free Products
            </Link>
            <Link
              to="/contribute"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/contribute" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Contribute
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/admin" ? "text-foreground" : "text-foreground/60"
                )}
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center">
            {!isAuthenticated ? (
              <Button variant="ghost" onClick={openAuthDialog}>
                Sign In
              </Button>
            ) : (
              <>
                <Link to="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            )}
            
            <MobileNav
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              openAuthDialog={openAuthDialog}
              handleSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ isAuthenticated, isAdmin, openAuthDialog, handleSignOut }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <Link
          to="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <img src="/placeholder.svg" alt="Logo" className="h-6 w-6" />
          <span className="ml-2 font-bold">PVA Insight</span>
        </Link>
        <div className="mt-6 flex flex-col space-y-3">
          <SheetClose asChild>
            <Link
              to="/database"
              className="block px-2 py-1 text-lg hover:underline"
            >
              Database
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to="/about-pva"
              className="block px-2 py-1 text-lg hover:underline"
            >
              About PVA
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to="/research"
              className="block px-2 py-1 text-lg hover:underline"
            >
              Research
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to="/pva-free"
              className="block px-2 py-1 text-lg hover:underline"
            >
              PVA Free Products
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to="/contribute"
              className="block px-2 py-1 text-lg hover:underline"
            >
              Contribute
            </Link>
          </SheetClose>
          {isAdmin && (
            <SheetClose asChild>
              <Link
                to="/admin"
                className="block px-2 py-1 text-lg hover:underline"
              >
                Admin
              </Link>
            </SheetClose>
          )}
          {isAuthenticated ? (
            <>
              <SheetClose asChild>
                <Link
                  to="/profile"
                  className="block px-2 py-1 text-lg hover:underline"
                >
                  Profile
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-start px-2 w-full text-lg"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </SheetClose>
            </>
          ) : (
            <Button
              variant="ghost"
              className="justify-start px-2 w-full text-lg"
              onClick={() => {
                setOpen(false);
                openAuthDialog();
              }}
            >
              Sign In
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
