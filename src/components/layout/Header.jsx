import React from 'react';
import { Mic, Bell, Menu, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import NetworkBanner from './NetworkBanner';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ onOpenVoiceModal, onToggleMobileMenu }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageToggle = () => {
    toggleLanguage();
    showToast({
      title: lang === 'en' ? "भाषा बदली गई (हिन्दी)" : "Language Switched (English)",
      message: lang === 'en' ? "किसानलिंक अब हिन्दी में सक्रिय है।" : "KisanLink is now in English.",
      type: 'info'
    });
  };

  const handleNotificationClick = () => {
    showToast({
      title: lang === 'hi' ? "नई खरीदार मांग प्राप्त! 🔔" : "Fresh Buyer Inquiry! 🔔",
      message: lang === 'hi' ? "पतंजलि एग्रो ने 500 क्विंटल गेहूं का ऑर्डर पोस्ट किया है।" : "Patanjali Agro posted 500 qtl Wheat demand.",
      type: 'chat'
    });
    navigate('/marketplace');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('overview');
      case '/mandi': return t('mandiPrices');
      case '/scanner': return t('cropScanner');
      case '/marketplace': return t('directMarket');
      case '/sell': return t('sellCrop');
      case '/storage': return t('coldStorage');
      case '/experts': return t('expertConnect');
      case '/profile': return t('profileSettings');
      default: return t('overview');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fffeef]/95 backdrop-blur-md border-b border-[#44615815] px-2.5 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
      {/* Left: Mobile Menu Toggle + Page Title + Network Banner */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-[#44615820] bg-white text-[#272c1a] hover:bg-[#fffeef] shrink-0 interactive-tap"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-2xl font-black text-[#272c1a] tracking-tight truncate">
          {getPageTitle()}
        </h1>

        <div className="hidden md:block shrink-0">
          <NetworkBanner />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Voice Add Button with Pulse Glow */}
        <button
          onClick={() => {
            if (onOpenVoiceModal) {
              onOpenVoiceModal();
            } else {
              navigate('/sell');
            }
          }}
          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] font-bold text-xs sm:text-sm p-2 sm:px-4 sm:py-2 rounded-xl shadow-sm transition-all duration-150 active:scale-95 cursor-pointer interactive-tap animate-bounce-subtle"
          title="Voice-first Crop Listing (Magic Add)"
        >
          <Mic className="w-4 h-4 fill-[#272c1a] shrink-0" />
          <span className="font-extrabold hidden xs:inline">{t('voiceAdd')}</span>
        </button>

        {/* Language Switcher Pill with Interactive Tap */}
        <button
          onClick={handleLanguageToggle}
          className="flex items-center border border-[#44615830] bg-white text-[#272c1a] text-xs font-bold rounded-xl px-2 sm:px-2.5 py-2 hover:bg-[#fffeef] shadow-sm transition-all shrink-0 cursor-pointer interactive-tap active:rotate-2"
          title="Switch Language / भाषा बदलें"
        >
          <span className={lang === 'en' ? 'text-[#272c1a] font-black' : 'text-[#44615880]'}>EN</span>
          <span className="mx-0.5 sm:mx-1 text-[#44615840]">|</span>
          <span className={lang === 'hi' ? 'text-[#272c1a] font-black' : 'text-[#44615880]'}>HI</span>
        </button>

        {/* Notification Bell with Red Ping Ring */}
        <div className="relative shrink-0">
          <button
            onClick={handleNotificationClick}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#44615820] bg-white flex items-center justify-center text-[#272c1a] hover:bg-[#fffeef] transition-all shadow-sm cursor-pointer interactive-tap"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#272c1a]" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
        </div>
      </div>
    </header>
  );
}
