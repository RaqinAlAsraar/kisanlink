import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NetworkBanner from './NetworkBanner';
import VoiceAssistantModal from '../voice/VoiceAssistantModal';
import RoutePreloaderBar from '../common/RoutePreloaderBar';
import AppPreloader from '../common/AppPreloader';
import { Home, TrendingUp, Camera, Store, Snowflake, UserCheck, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Layout() {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-[#fffeef]">
      {/* Route Preloader Bar (Top glowing progress on navigation transitions) */}
      <RoutePreloaderBar />

      {/* Initial App Splash Preloader */}
      <AppPreloader />

      {/* Desktop Sidebar (hidden on mobile/tablet) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile / Tablet Slide-over Drawer */}
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-[#272c1a]/60 backdrop-blur-sm flex animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-white h-full shadow-2xl relative animate-in slide-in-from-left duration-250"
          >
            <Sidebar onClose={() => setIsMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        <Header 
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileDrawerOpen(true)}
        />

        {/* Mobile Network Banner (visible only on small screens) */}
        <div className="md:hidden px-3 pt-2">
          <NetworkBanner />
        </div>

        <main className="flex-1 p-2.5 sm:p-5 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for Rural Smartphone Farmers */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#44615820] py-2 px-1 xs:px-2 flex justify-around items-center z-40 shadow-elevated safe-area-bottom">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-[#3d5500]' : 'text-[#446158]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </NavLink>
        <NavLink
          to="/mandi"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-[#3d5500]' : 'text-[#446158]'
            }`
          }
        >
          <TrendingUp className="w-5 h-5" />
          <span>{t('mandiPrices')}</span>
        </NavLink>
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="-mt-5 bg-[#9fd700] p-3 rounded-full shadow-lg border-4 border-[#fffeef] active:scale-95 transition-transform cursor-pointer"
          aria-label="Voice Add"
        >
          <div className="w-6 h-6 flex items-center justify-center font-black text-[#272c1a] text-lg">
            🎤
          </div>
        </button>
        <NavLink
          to="/scanner"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-[#3d5500]' : 'text-[#446158]'
            }`
          }
        >
          <Camera className="w-5 h-5" />
          <span>{t('cropScanner')}</span>
        </NavLink>
        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-[#3d5500]' : 'text-[#446158]'
            }`
          }
        >
          <Store className="w-5 h-5" />
          <span>{t('directMarket')}</span>
        </NavLink>
      </nav>

      {/* Global Voice Assistant "Magic Add" Modal */}
      {isVoiceModalOpen && (
        <VoiceAssistantModal onClose={() => setIsVoiceModalOpen(false)} />
      )}
    </div>
  );
}
