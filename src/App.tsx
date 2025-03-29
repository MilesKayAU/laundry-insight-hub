
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ContributePage from "./pages/ContributePage";
import DatabasePage from "./pages/DatabasePage";
import AdminPage from "./pages/AdminPage";
import AboutPva from "./pages/AboutPva";
import PvaFreePage from "./pages/PvaFreePage";
import AuthPage from "./pages/AuthPage";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                  <Route path="/admin" element={
                    <AdminGuard>
                      <AdminPage />
                    </AdminGuard>
                  } />
                  <Route path="/about" element={<AboutPva />} />
                  <Route path="/pva-free" element={<PvaFreePage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
