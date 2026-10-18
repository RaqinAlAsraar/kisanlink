import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, TrendingUp, Warehouse, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import MandiCard from '../components/mandi/MandiCard';
import DiagnosticCard from '../components/scanner/DiagnosticCard';
import StorageCard from '../components/storage/StorageCard';
import InquiryCard from '../components/market/InquiryCard';
import { COMMODITIES } from '../data/commodities';
import { INITIAL_SCANS } from '../data/mockScans';

import { STORAGE_FACILITIES, BUYER_REQUESTS } from '../data/storageFacilities';
import { dbGetAll, dbPut } from '../services/db';
import { useLanguage } from '../context/LanguageContext';

import WeatherWidget from '../components/weather/WeatherWidget';

export default function Home() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [scans, setScans] = useState(INITIAL_SCANS);
  const [commodities, setCommodities] = useState(COMMODITIES.slice(0, 4)); // Top 4 for dashboard
  const [storages, setStorages] = useState(STORAGE_FACILITIES.slice(0, 2)); // Top 2 for dashboard
  const [inquiry] = useState(BUYER_REQUESTS[0]);

  // Load any newly created scans from IndexedDB
  useEffect(() => {
    async function loadStoredData() {
      try {
        const localScans = await dbGetAll('scans');
        if (localScans && localScans.length > 0) {
          // Merge with initial, avoiding duplicates
          const merged = [...localScans, ...INITIAL_SCANS.filter(init => !localScans.some(l => l.id === init.id))];
          setScans(merged);
        }
      } catch (err) {
        console.warn('Could not load IndexedDB scans', err);
      }
    }
    loadStoredData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Real-Time Agricultural Weather Advisory (Free Open-Meteo API) */}
      <WeatherWidget />

      {/* 1. Live Mandi Prices (Local) Header & Grid */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-extrabold text-[#272c1a] flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-5 h-5 text-[#446158]" />
              {t('liveMandiPrices')}
            </span>
          </div>
          <button
            onClick={() => navigate('/mandi')}
            className="text-xs md:text-sm font-bold text-[#446158] hover:text-[#272c1a] underline transition-colors"
          >
            {t('viewAll')}
          </button>
        </div>

        {/* 4 Commodity Cards Grid (Matching Wireframe) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commodities.map((item) => (
            <MandiCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 2. Main Two-Column Section (Matching Wireframe) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent AI Scans (approx 65% width) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-extrabold text-[#272c1a] tracking-tight">
                🌿 {t('recentScans')}
              </span>
            </div>
            <button
              onClick={() => navigate('/scanner')}
              className="inline-flex items-center gap-2 bg-[#272c1a] hover:bg-[#385049] text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Camera className="w-4 h-4 text-[#9fd700]" />
              <span>+ {t('newScan')}</span>
            </button>
          </div>

          {/* List of Recent Scans */}
          <div className="space-y-4">
            {scans.slice(0, 3).map((scan) => (
              <DiagnosticCard key={scan.id} scan={scan} />
            ))}
          </div>
        </div>

        {/* Right Column: Local Storage & Buyer Requests (approx 35% width) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Local Storage Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg md:text-xl font-extrabold text-[#272c1a] flex items-center gap-2 tracking-tight">
                <Warehouse className="w-5 h-5 text-[#446158]" />
                {t('localStorage')}
              </span>
            </div>

            <div className="space-y-3">
              {storages.map((storage) => (
                <StorageCard key={storage.id} item={storage} />
              ))}
            </div>

            <button
              onClick={() => navigate('/storage')}
              className="w-full py-2.5 border border-[#44615830] bg-white hover:bg-[#fffeef] text-[#272c1a] text-xs md:text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95 text-center block"
            >
              {t('findMoreStorage')}
            </button>
          </div>

          {/* Buyer Requests Section (Wireframe Dark Forest Container) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-extrabold text-[#272c1a] tracking-tight">
                🤝 {t('buyerRequests')}
              </span>
            </div>

            {/* Dark Forest Inquiry Container */}
            <InquiryCard inquiry={inquiry} />
          </div>
        </div>
      </div>
    </div>
  );
}
