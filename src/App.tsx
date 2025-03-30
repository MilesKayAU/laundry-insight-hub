
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
import AuthPage from "./pages/AuthPage";
import BrandProfilePage from "./pages/BrandProfilePage";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import NotFound from "./pages/NotFound";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import EditBlogPostPage from "./pages/admin/EditBlogPostPage";

// Create a client with more aggressive stale time settings
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Consider data stale immediately
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (renamed from cacheTime)
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnMount: true, // Refetch when component mounts
    },
  },
});

const QueryClientWrapper = ({ children }) => {
  const location = useLocation();
  const [queryClient] = useState(() => createQueryClient());
  
  // Reset query cache when navigating to the database page
  React.useEffect(() => {
    if (location.pathname === '/database') {
      queryClient.resetQueries();
      console.info("Query cache reset for database page");
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
                  <Route path="/database" element={<DatabasePage />} />
                  <Route path="/brand/:brandName" element={<BrandProfilePage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/admin" element={
                    <AdminGuard>
                      <AdminPage />
                    </AdminGuard>
                  } />
                  <Route path="/admin/blog/new" element={
                    <AdminGuard>
                      <EditBlogPostPage />
                    </AdminGuard>
                  } />
                  <Route path="/admin/blog/edit/:id" element={
                    <AdminGuard>
                      <EditBlogPostPage />
                    </AdminGuard>
                  } />
                  <Route path="/about" element={<AboutPva />} />
                  <Route path="/pva-free" element={<PvaFreePage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
