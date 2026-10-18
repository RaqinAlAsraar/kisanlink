import React, { useState, useEffect } from 'react';
import { Settings, Globe, Cloud, RefreshCw, Key, ShieldCheck, UserCircle, Database, Trash2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { getPendingSyncQueue, dbClear, dbGetAll } from '../services/db';
import { getOrCreateCryptoKeyPair, signRecord } from '../services/cryptoService';

export default function ProfileSettings() {
  const { lang, setLang, toggleLanguage, t } = useLanguage();
  const { isOnline, setIsOnline, pendingCount, isSyncing, triggerSync, refreshQueueCount } = useNetwork();
  const { user, logout } = useAuth();

  const [pendingQueue, setPendingQueue] = useState([]);
  const [cachedScansCount, setCachedScansCount] = useState(0);
  const [cachedListingsCount, setCachedListingsCount] = useState(0);
  const [testSigResult, setTestSigResult] = useState(null);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const queue = await getPendingSyncQueue();
        setPendingQueue(queue);
        const scans = await dbGetAll('scans');
        setCachedScansCount(scans.length);
        const listings = await dbGetAll('listings');
        setCachedListingsCount(listings.length);
      } catch (err) {}
    }
    loadStats();
  }, [pendingCount]);

  const handleTestCryptoSign = async () => {
    const testData = { message: "KisanLink Cryptographic Audit Test", timestamp: new Date().toISOString() };
    const res = await signRecord(testData);
    setTestSigResult(res);
  };

  const handleSaveGeminiKey = () => {
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleClearCache = async () => {
    if (confirm(lang === 'hi' ? 'क्या आप स्थानीय ऑफ़लाइन डेटा साफ़ करना चाहते हैं?' : 'Clear local offline IndexedDB cache?')) {
      await dbClear('scans');
      await dbClear('sync_queue');
      setCachedScansCount(0);
      setPendingQueue([]);
      refreshQueueCount();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-pop-in">
      {/* Header */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            {lang === 'hi' ? "किसान प्रोफ़ाइल और ऑफ़लाइन सेटिंग्स" : "Farmer Profile & Offline Sync Manager"}
          </h2>
          <p className="text-xs md:text-sm text-[#446158] mt-1">
            {lang === 'hi'
              ? "ग्रामीण ऑफ़लाइन डेटा कैशिंग, क्रिप्टोग्राफिक सुरक्षा कुंजी और क्षेत्रीय भाषा प्राथमिकताएं प्रबंधित करें।"
              : "Manage rural offline data caching, cryptographic trust keys, and regional dialect preferences."}
          </p>
        </div>
      </div>

      {/* 1. Farmer Profile Card */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#272c1a] text-[#9fd700] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
          <UserCircle className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h3 className="text-lg sm:text-xl font-black text-[#272c1a]">{user?.name || (lang === 'hi' ? "राम सिंह" : "Ram Singh")}</h3>
            <span className="bg-[#9fd70025] text-[#3d5500] text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {lang === 'hi' ? "सत्यापित किसान" : "Verified Farmer"}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#446158]">{lang === 'hi' ? "मोबाइल: " : "Phone: "}{user?.phone || "+91 98765 43321"}</p>
          <p className="text-xs text-[#446158]">{lang === 'hi' ? "स्थान: मेरठ मंडी, उत्तर प्रदेश" : `Location: ${user?.location || "Meerut Mandi, Uttar Pradesh"}`}</p>
          <p className="text-xs text-[#446158]">{lang === 'hi' ? "कृषि जोत: 4.5 एकड़ (गेहूं, टमाटर, आलू)" : "Farm Holding: 4.5 Acres (Wheat, Tomato, Potato)"}</p>
        </div>
      </div>

      {/* 2. Language Preference */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-[#272c1a]">
          <Globe className="w-5 h-5 text-[#446158]" />
          <span>{lang === 'hi' ? "भाषा प्राथमिकताएं" : "Language Preference / भाषा चुनें"}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => setLang('en')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer interactive-tap ${
              lang === 'en'
                ? 'bg-[#ecfccb] border-[#9fd700] ring-2 ring-[#9fd700] text-[#272c1a] font-black'
                : 'bg-[#fffeef] border-[#44615820] text-[#446158]'
            }`}
          >
            <div>
              <p className="text-sm font-bold">English</p>
              <p className="text-xs text-[#446158]">Standard dialect & readouts</p>
            </div>
            {lang === 'en' && <Check className="w-5 h-5 text-[#3d5500]" />}
          </button>

          <button
            onClick={() => setLang('hi')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer interactive-tap ${
              lang === 'hi'
                ? 'bg-[#ecfccb] border-[#9fd700] ring-2 ring-[#9fd700] text-[#272c1a] font-black'
                : 'bg-[#fffeef] border-[#44615820] text-[#446158]'
            }`}
          >
            <div>
              <p className="text-sm font-bold">हिन्दी (Hindi)</p>
              <p className="text-xs text-[#446158]">सरल ग्रामीण संवाद और वॉइस इनपुट</p>
            </div>
            {lang === 'hi' && <Check className="w-5 h-5 text-[#3d5500]" />}
          </button>
        </div>
      </div>

      {/* 3. Offline Engine & Sync Manager */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-base font-extrabold text-[#272c1a]">
            <Cloud className="w-5 h-5 text-[#446158]" />
            <span>{lang === 'hi' ? "ऑफ़लाइन स्टोरेज एवं सिंक इंजन (IndexedDB + Service Worker)" : "Offline-First Storage & Sync Engine (IndexedDB + Service Worker)"}</span>
          </div>

          {/* Dev Simulation Toggle: Simulate Offline/Online */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`text-xs font-black px-3.5 py-1.5 rounded-full border transition-all cursor-pointer interactive-tap ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Toggle to simulate rural network drop"
          >
            {isOnline 
              ? (lang === 'hi' ? "🟢 नेटवर्क: ऑनलाइन (ऑफ़लाइन का परीक्षण करें)" : "🟢 Network: ONLINE (Click to simulate offline)")
              : (lang === 'hi' ? "🟠 नेटवर्क: ऑफ़लाइन (पुनः कनेक्ट का परीक्षण करें)" : "🟠 Network: OFFLINE (Click to simulate reconnect)")}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#fffeef] p-4 rounded-2xl border border-[#44615815] text-center">
            <span className="text-xs text-[#446158] font-bold block">{lang === 'hi' ? "सहेजे गए एआई स्कैन" : "Cached AI Scans"}</span>
            <span className="text-2xl font-black text-[#272c1a]">{cachedScansCount}</span>
          </div>
          <div className="bg-[#fffeef] p-4 rounded-2xl border border-[#44615815] text-center">
            <span className="text-xs text-[#446158] font-bold block">{lang === 'hi' ? "बाजार फसल लिस्टिंग" : "Marketplace Listings"}</span>
            <span className="text-2xl font-black text-[#272c1a]">{cachedListingsCount}</span>
          </div>
          <div className="bg-[#fffeef] p-4 rounded-2xl border border-[#44615815] text-center">
            <span className="text-xs text-[#446158] font-bold block">{lang === 'hi' ? "सिंक होने वाले कार्य" : "Pending Sync Actions"}</span>
            <span className={`text-2xl font-black ${pendingCount > 0 ? 'text-amber-600' : 'text-[#3d5500]'}`}>
              {pendingCount}
            </span>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            onClick={triggerSync}
            disabled={isSyncing || !isOnline}
            className="btn-lime text-xs font-black py-2.5 px-5 flex items-center justify-center gap-2 shadow-sm cursor-pointer interactive-tap w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing 
                ? (lang === 'hi' ? "सर्वर से सिंक हो रहा है..." : "Syncing with Server...") 
                : (lang === 'hi' ? "अभी तुरंत सिंक करें" : "Force Sync Queue Now")}
            </span>
          </button>

          <button
            onClick={handleClearCache}
            className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer interactive-tap py-1 sm:py-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "ऑफ़लाइन कैश खाली करें" : "Clear Offline Cache"}</span>
          </button>
        </div>
      </div>

      {/* 4. Cryptographic Keypair & SubtleCrypto Audit Inspector */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-[#272c1a]">
          <ShieldCheck className="w-5 h-5 text-[#3d5500]" />
          <span>{lang === 'hi' ? "वेब क्रिप्टो सुरक्षा इंजन (SubtleCrypto ECDSA P-256)" : "Web Crypto API (SubtleCrypto ECDSA P-256)"}</span>
        </div>
        <p className="text-xs text-[#446158]">
          {lang === 'hi'
            ? "हर कार्रवाई को किसान के ब्राउज़र पर गणितीय सुरक्षा कोड से साइन किया जाता है, जो फर्जी जांच रिपोर्ट या बदले हुए भाव से सुरक्षा प्रदान करता है।"
            : "Actions are mathematically signed on the client before being queued or sent, protecting farmers from forged diagnostic reports or altered commodity bids."}
        </p>

        <button
          onClick={handleTestCryptoSign}
          className="btn-slate text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer interactive-tap w-full sm:w-auto"
        >
          <Key className="w-3.5 h-3.5 text-[#9fd700]" />
          <span>{lang === 'hi' ? "परीक्षण क्रिप्टोग्राफिक हस्ताक्षर बनाएं" : "Generate Test Cryptographic Signature"}</span>
        </button>

        {testSigResult && (
          <div className="bg-[#272c1a] text-white p-4 rounded-2xl font-mono text-xs space-y-1.5 animate-pop-in">
            <span className="text-[10px] text-[#9fd700] uppercase font-bold block">
              {lang === 'hi' ? "लाइव उत्पन्न क्रिप्टोग्राफिक हस्ताक्षर:" : "Live Signature Generated:"}
            </span>
            <p className="break-all text-[11px]"><strong className="text-gray-400">SHA-256:</strong> {testSigResult.hash}</p>
            <p className="break-all text-[11px]"><strong className="text-gray-400">ECDSA:</strong> {testSigResult.signature}</p>
            <p className="text-[10px] text-gray-400">Algorithm: {testSigResult.algorithm} • Timestamp: {testSigResult.signedAt}</p>
          </div>
        )}
      </div>

      {/* 5. Optional Gemini 1.5 API Key Configuration */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 text-base font-extrabold text-[#272c1a]">
          <Key className="w-5 h-5 text-[#446158]" />
          <span>{lang === 'hi' ? "गूगल जेमिनी विज़न एपीआई कुंजी (वैकल्पिक)" : "Google Gemini Vision API Key (Optional)"}</span>
        </div>
        <p className="text-xs text-[#446158]">
          {lang === 'hi'
            ? "खाली रहने पर किसानलिंक अपने एकीकृत कृषि रोग मॉडल का उपयोग करता है। क्लाउड विज़न जांच को सक्रिय करने के लिए अपनी कुंजी दर्ज करें।"
            : "If empty, KisanLink uses its integrated agronomist diagnostic engine with offline pathogen matching. Enter your key here to activate live Gemini 1.5 Flash cloud vision inference."}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="flex-1 p-3 bg-[#fffeef] border border-[#44615830] rounded-xl sm:rounded-2xl text-xs font-mono text-[#272c1a] outline-none focus:ring-2 focus:ring-[#9fd700]"
          />
          <button
            onClick={handleSaveGeminiKey}
            className="btn-lime text-xs font-bold px-5 py-3 sm:py-0 flex items-center justify-center cursor-pointer interactive-tap shrink-0"
          >
            {keySaved ? (lang === 'hi' ? "सहेजा गया!" : "Saved!") : (lang === 'hi' ? "कुंजी सहेजें" : "Save Key")}
          </button>
        </div>
      </div>
    </div>
  );
}
