
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ContributePage from "./pages/ContributePage";
import DatabasePage from "./pages/DatabasePage";
import AdminPage from "./pages/AdminPage";
import AboutPva from "./pages/AboutPva";
import PvaFreePage from "./pages/PvaFreePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/about" element={<AboutPva />} />
            <Route path="/pva-free" element={<PvaFreePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
