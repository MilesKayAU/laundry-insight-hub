
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ContributePage from "./pages/ContributePage";
import DatabasePage from "./pages/DatabasePage";
import AdminPage from "./pages/AdminPage";
import AboutPva from "./pages/AboutPva";
import PvaFreePage from "./pages/PvaFreePage";
import CertificationPage from "./pages/CertificationPage";
import AuthPage from "./pages/AuthPage";
import BrandProfilePage from "./pages/BrandProfilePage";
import ProfilePage from "./pages/ProfilePage";
import ResearchPage from "./pages/ResearchPage";
import MethodologyPage from "./pages/MethodologyPage";
import PvaJargonPage from "./pages/PvaJargonPage";
import PvaPercentageUpdatePage from "./pages/PvaPercentageUpdatePage";
import FaqPage from "./pages/FaqPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import NotFound from "./pages/NotFound";

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
});

const QueryClientWrapper = ({ children }) => {
  const location = useLocation();
  const [queryClient] = useState(() => createQueryClient());
  
  React.useEffect(() => {
    // Reset queries for product-related pages
    const productPages = ['/database', '/pva-free', '/brand', '/']; 
    const shouldResetQueries = productPages.some(page => location.pathname.startsWith(page));
    
    if (shouldResetQueries) {
      queryClient.resetQueries();
      console.info(`Query cache reset for path: ${location.pathname}`);
    }
  }, [location.pathname, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientWrapper>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/contribute" element={
                    <AuthGuard>
                      <ContributePage />
                    </AuthGuard>
                  } />
                  <Route path="/profile" element={
                    <AuthGuard>
                      <ProfilePage />
                    </AuthGuard>
                  } />
                  <Route path="/database" element={<DatabasePage />} />
                  <Route path="/research" element={<ResearchPage />} />
                  <Route path="/methodology" element={<MethodologyPage />} />
                  <Route path="/pva-jargon" element={<PvaJargonPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/brand/:brandName" element={<BrandProfilePage />} />
                  <Route path="/update-pva/:brandName/:productName" element={<PvaPercentageUpdatePage />} />
                  <Route path="/admin" element={
                    <AdminGuard>
                      <AdminPage />
                    </AdminGuard>
                  } />
                  <Route path="/about" element={<AboutPva />} />
                  <Route path="/pva-free" element={<PvaFreePage />} />
                  <Route path="/certification" element={<CertificationPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientWrapper>
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default App;
