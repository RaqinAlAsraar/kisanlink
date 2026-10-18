import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * AppPreloader
 * Smooth 650ms initial boot splash loader with fade-out
 * ensuring a native-app feel on initial web/mobile load.
 */
export default function AppPreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    // Check if session has already displayed initial boot splash
    const alreadyBooted = sessionStorage.getItem('kisan_booted');
    if (alreadyBooted) {
      setVisible(false);
      return;
    }

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 600);

    const endTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('kisan_booted', 'true');
    }, 950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-[#fffeef] flex flex-col items-center justify-center p-6 text-center transition-opacity duration-350 pointer-events-none ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-[#272c1a] border-2 border-[#9fd700] flex items-center justify-center shadow-2xl animate-pop-in">
          <span className="text-5xl">🌾</span>
        </div>
        <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#9fd700] text-[#272c1a] shadow-md animate-bounce">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-3xl font-black text-[#272c1a] tracking-tight">KisanLink</h1>
        <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#9fd70030] text-[#3d5500] border border-[#9fd70060]">
          किसानलिंक
        </span>
      </div>

      <p className="text-xs font-bold text-[#446158] max-w-xs mb-6">
        {lang === 'hi' 
          ? "किसानों की डिजिटल मंडी और कृषि साथी" 
          : "Connecting Farmers to Fair Trade & APMC Markets"}
      </p>

      {/* Shimmering Loading bar */}
      <div className="w-48 h-1.5 bg-[#44615820] rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-[#84cc16] via-[#9fd700] to-[#4ade80] rounded-full animate-route-bar" />
      </div>
    </div>
  );
}
