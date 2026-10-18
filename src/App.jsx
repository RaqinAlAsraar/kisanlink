import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { NetworkProvider } from './context/NetworkContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import MandiPrices from './pages/MandiPrices';
import CropScanner from './pages/CropScanner';
import Marketplace from './pages/Marketplace';
import SellCrop from './pages/SellCrop';
import ColdStorage from './pages/ColdStorage';
import ExpertConnect from './pages/ExpertConnect';
import ProfileSettings from './pages/ProfileSettings';
import Auth from './pages/Auth';

export default function App() {
  return (
    <LanguageProvider>
      <NetworkProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
            <Routes>
              {/* Standalone Auth Page */}
              <Route path="/auth" element={<Auth />} />

              {/* Master App Shell Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="mandi" element={<MandiPrices />} />
                <Route path="scanner" element={<CropScanner />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="sell" element={<SellCrop />} />
                <Route path="storage" element={<ColdStorage />} />
                <Route path="experts" element={<ExpertConnect />} />
                <Route path="profile" element={<ProfileSettings />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </NetworkProvider>
    </LanguageProvider>
  );
}
