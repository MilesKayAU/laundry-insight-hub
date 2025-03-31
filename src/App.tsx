
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"

import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import DatabasePage from '@/pages/DatabasePage';
import AuthPage from '@/pages/AuthPage';
import ContributePage from '@/pages/ContributePage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import BrandProfilePage from '@/pages/BrandProfilePage';
import AboutPva from '@/pages/AboutPva';
import PvaFreePage from '@/pages/PvaFreePage';
import CertificationPage from '@/pages/CertificationPage';
import PvaPercentageUpdatePage from '@/pages/PvaPercentageUpdatePage';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import ResearchPage from '@/pages/ResearchPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/database" element={<DatabasePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/contribute" element={<ContributePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/brands/:brandName" element={<BrandProfilePage />} />
              <Route path="/about-pva" element={<AboutPva />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/pva-free" element={<PvaFreePage />} />
              <Route path="/certification" element={<CertificationPage />} />
              <Route path="/pva-percentage/:brandName/:productName" element={<PvaPercentageUpdatePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
