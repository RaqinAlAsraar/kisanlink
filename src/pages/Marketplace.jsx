import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, MessageSquare, Plus, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from '../components/common/VerifiedBadge';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { dbGetAll } from '../services/db';
import LiveCallModal from '../components/common/LiveCallModal';
import { MarketplaceSkeleton } from '../components/common/SkeletonCard';

const INITIAL_MARKET_LISTINGS = [
  {
    id: 'listing-1',
    crop: 'Wheat (Sharbati Gehu)',
    cropHindi: 'गेहूं (शरबती गेहूं)',
    cropType: 'Wheat',
    quantity: 120,
    unit: 'Quintal',
    unitHindi: 'क्विंटल',
    price: 2320,
    sellerName: 'Suresh Verma',
    sellerNameHindi: 'सुरेश वर्मा',
    location: 'Meerut Mandi Zone (UP)',
    locationHindi: 'मेरठ मंडी क्षेत्र (उ.प्र.)',
    phone: '+91 98971 22345',
    verified: true,
    hash: 'a3f5b7c8d9e0123456789abcdef0123456789abcdef0123456789abcdef01234',
    signature: '3045022100ab123456789abcdef0123456789abcdef0123456789abcdef01234567890220',
    date: 'Today',
    dateHindi: 'आज'
  },
  {
    id: 'listing-2',
    crop: 'Tomato (Desi Tamatar)',
    cropHindi: 'टमाटर (देसी टमाटर)',
    cropType: 'Tomato',
    quantity: 60,
    unit: 'Quintal',
    unitHindi: 'क्विंटल',
    price: 1850,
    sellerName: 'Harish Chandra',
    sellerNameHindi: 'हरीश चंद्र',
    location: 'Modinagar / Hapur',
    locationHindi: 'मोदीनगर / हापुड़',
    phone: '+91 97580 44512',
    verified: true,
    hash: 'b2c3d4e5f6a7890123456789abcdef0123456789abcdef0123456789abcdef01',
    signature: '3046022100cd3456789abcdef0123456789abcdef0123456789abcdef01234567890221',
    date: 'Yesterday',
    dateHindi: 'कल'
  },
  {
    id: 'listing-3',
    crop: 'Paddy (Basmati 1509)',
    cropHindi: 'धान (बासमती 1509)',
    cropType: 'Paddy',
    quantity: 200,
    unit: 'Quintal',
    unitHindi: 'क्विंटल',
    price: 3150,
    sellerName: 'Balwan Singh',
    sellerNameHindi: 'बलवान सिंह',
    location: 'Karnal / Hapur Highway',
    locationHindi: 'करनाल / हापुड़ हाईवे',
    phone: '+91 98120 77610',
    verified: true,
    hash: 'c4d5e6f7a8b90123456789abcdef0123456789abcdef0123456789abcdef0123',
    signature: '3045022100ef890123456789abcdef0123456789abcdef0123456789abcdef01234567890220aa',
    date: '2 Days Ago',
    dateHindi: '2 दिन पहले'
  },
  {
    id: 'listing-4',
    crop: 'Mustard (Pili Sarson)',
    cropHindi: 'सरसों (पीली सरसों)',
    cropType: 'Mustard',
    quantity: 45,
    unit: 'Quintal',
    unitHindi: 'क्विंटल',
    price: 5480,
    sellerName: 'Devendra Yadav',
    sellerNameHindi: 'देवेंद्र यादव',
    location: 'Alwar / Bharatpur',
    locationHindi: 'अलवर / भरतपुर',
    phone: '+91 94140 33812',
    verified: true,
    hash: 'e8f90123456789abcdef0123456789abcdef0123456789abcdef0123456789ab',
    signature: '30440220456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0220bb',
    date: '3 Days Ago',
    dateHindi: '3 दिन पहले'
  }
];

const BUYER_REQUESTS = [
  {
    id: 'inq-1',
    crop: 'Wheat (Sharbati / Lokwan)',
    cropHindi: 'गेहूं (शरबती / लोकवन)',
    quantity: '500 Quintals',
    quantityHindi: '500 क्विंटल',
    targetPrice: '₹2,300/qtl',
    targetPriceHindi: '₹2,300 / क्विंटल',
    buyerName: 'Patanjali Agro Processing Unit',
    buyerNameHindi: 'पतंजलि एग्रो प्रोसेसिंग यूनिट',
    location: 'Meerut Industrial Hub',
    locationHindi: 'मेरठ औद्योगिक हब',
    phone: '+91 98110 55432',
    pickupType: 'Farmgate Pickup Included',
    pickupTypeHindi: 'खेत से सीधी उठान (पिकअप शामिल)',
    postedTime: '30 mins ago',
    postedTimeHindi: '30 मिनट पहले',
    note: 'Requirement for immediate delivery. Moisture must be under 12%.',
    noteHindi: 'तत्काल डिलीवरी की आवश्यकता। नमी 12% से कम होनी चाहिए।'
  },
  {
    id: 'inq-2',
    crop: 'Potato (Processing Grade)',
    cropHindi: 'आलू (प्रोसेसिंग ग्रेड)',
    quantity: '300 Quintals',
    quantityHindi: '300 क्विंटल',
    targetPrice: '₹1,320/qtl',
    targetPriceHindi: '₹1,320 / क्विंटल',
    buyerName: 'Haldiram Snacks Procurement',
    buyerNameHindi: 'हल्दीराम स्नैक्स खरीद विभाग',
    location: 'Noida Food Park',
    locationHindi: 'नोएडा फूड पार्क',
    phone: '+91 98711 66789',
    pickupType: 'Farmer to deliver at Noida',
    pickupTypeHindi: 'नोएडा में किसान द्वारा डिलीवरी',
    postedTime: '2 hours ago',
    postedTimeHindi: '2 घंटे पहले',
    note: 'Grade A size required. Direct electronic bank transfer upon weighbridge clearance.',
    noteHindi: 'ग्रेड ए साइज की आवश्यकता। धर्मकांटा पर तौल होते ही बैंक खाते में सीधा ट्रांसफर।'
  },
  {
    id: 'inq-3',
    crop: 'Tomato (Hybrid / Roma)',
    cropHindi: 'टमाटर (हाइब्रिड / रोमा)',
    quantity: '80 Quintals',
    quantityHindi: '80 क्विंटल',
    targetPrice: '₹1,850/qtl',
    targetPriceHindi: '₹1,850 / क्विंटल',
    buyerName: 'Azadpur Wholesale Commission Agent',
    buyerNameHindi: 'आजादपुर थोक आढ़ती एजेंट',
    location: 'Azadpur Mandi, Delhi',
    locationHindi: 'आजादपुर मंडी, दिल्ली',
    phone: '+91 99100 88765',
    pickupType: 'Farmgate loading',
    pickupTypeHindi: 'खेत से सीधी लोडिंग',
    postedTime: '4 hours ago',
    postedTimeHindi: '4 घंटे पहले',
    note: 'Firm ripe tomatoes in crates.',
    noteHindi: 'क्रेट में पके एवं ठोस टमाटर चाहिए।'
  }
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('farmer_listings');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [listings, setListings] = useState(INITIAL_MARKET_LISTINGS);
  const [isPreloading, setIsPreloading] = useState(false);
  const [activeCallContact, setActiveCallContact] = useState(null);
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { showToast } = useToast();

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setIsPreloading(true);
    setActiveTab(tab);
    setTimeout(() => setIsPreloading(false), 250);
  };

  const handleCallSeller = (item) => {
    setActiveCallContact({
      name: item.sellerName,
      title: lang === 'hi' ? `किसान (फसल विक्रेता)` : `Farmer & Verified Seller`,
      org: `${item.location} • ${item.crop}`,
      phone: item.phone,
      avatarLetter: item.sellerName?.split(' ')[1]?.[0] || 'K',
      greeting: lang === 'hi'
        ? `नमस्ते! मैं ${item.sellerName} बोल रहा हूँ। मेरी ${item.crop} की फसल बिल्कुल तैयार है। आप कितना क्विंटल लेना चाहते हैं?`
        : `Hello! This is ${item.sellerName}. My ${item.crop} harvest is ready for dispatch. How many quintals do you require?`
    });

    showToast({
      title: lang === 'hi' ? "किसान से कॉल कनेक्ट हो रही है" : "Connecting to Farmer",
      message: `${item.sellerName} (${item.crop})`,
      type: 'phone'
    });
  };

  const handleCallBuyer = (inquiry) => {
    setActiveCallContact({
      name: inquiry.buyerName,
      title: lang === 'hi' ? 'थोक खरीद प्रतिनिधि' : 'Wholesale Procurement Head',
      org: `${inquiry.location} • ${inquiry.crop}`,
      phone: inquiry.phone,
      avatarLetter: inquiry.buyerName?.[0] || 'B',
      greeting: lang === 'hi'
        ? `नमस्ते! मैं ${inquiry.buyerName} खरीद विभाग से बोल रहा हूँ। हमें ${inquiry.quantity} ${inquiry.crop} की तत्काल आवश्यकता है। क्या आपकी गुणवत्ता जांच तैयार है?`
        : `Hello! This is ${inquiry.buyerName} procurement. We are ready to buy ${inquiry.quantity} of ${inquiry.crop}. Do you have quality test papers?`
    });

    showToast({
      title: lang === 'hi' ? "खरीदार से संपर्क हो रहा है" : "Connecting to Buyer",
      message: `${inquiry.buyerName} (${inquiry.targetPrice})`,
      type: 'phone'
    });
  };

  const handleWhatsAppClick = (name) => {
    showToast({
      title: lang === 'hi' ? "व्हाट्सएप चैट खुली" : "WhatsApp Chat Opened",
      message: `${name}`,
      type: 'chat'
    });
  };

  useEffect(() => {
    async function loadLocalListings() {
      try {
        const stored = await dbGetAll('listings');
        if (stored && stored.length > 0) {
          const merged = [...stored, ...INITIAL_MARKET_LISTINGS.filter(i => !stored.some(s => s.id === i.id))];
          setListings(merged);
        }
      } catch (e) {
        console.warn('Failed to load local listings', e);
      }
    }
    loadLocalListings();
  }, []);

  const crops = [
    { id: 'All', label: lang === 'hi' ? 'सभी' : 'All' },
    { id: 'Wheat', label: lang === 'hi' ? 'गेहूं' : 'Wheat' },
    { id: 'Tomato', label: lang === 'hi' ? 'टमाटर' : 'Tomato' },
    { id: 'Paddy', label: lang === 'hi' ? 'धान' : 'Paddy' },
    { id: 'Mustard', label: lang === 'hi' ? 'सरसों' : 'Mustard' },
    { id: 'Potato', label: lang === 'hi' ? 'आलू' : 'Potato' }
  ];

  const filteredListings = listings.filter(l => {
    if (selectedCrop === 'All') return true;
    return l.cropType === selectedCrop || l.crop.includes(selectedCrop);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9fd70025] text-[#3d5500] mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "प्रत्यक्ष उचित व्यापार (शून्य बिचौलिया)" : "Direct Fair Trade (Zero Middlemen)"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            {lang === 'hi' ? "सीधा किसान बाजार और खरीदार मांग" : "Direct Crop Marketplace & Buyer Catalog"}
          </h2>
          <p className="text-xs md:text-sm text-[#446158] mt-1">
            {lang === 'hi' 
              ? "सत्यापित थोक खरीदारों और साथी किसानों से 1-टैप कॉल और व्हाट्सएप द्वारा सीधे जुड़ें।" 
              : "Connect directly with verified wholesale buyers and fellow farmers with 1-tap call and WhatsApp links."}
          </p>
        </div>

        {/* Sell Crop Primary Button */}
        <button
          onClick={() => navigate('/sell')}
          className="btn-lime text-xs md:text-sm font-black flex items-center justify-center gap-2 px-6 py-3.5 shadow-md shrink-0 cursor-pointer w-full md:w-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{lang === 'hi' ? "+ फसल बेचने के लिए डालें" : "+ Post My Crop for Sale"}</span>
        </button>
      </div>

      {/* Tabs Switcher: Farmer Listings vs Buyer Inquiries */}
      <div className="flex items-center justify-between border-b border-[#44615820] pb-2 flex-wrap gap-2.5">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('farmer_listings')}
            className={`px-3 py-2.5 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'farmer_listings'
                ? 'bg-[#272c1a] text-[#9fd700] shadow-sm'
                : 'bg-white text-[#446158] hover:bg-[#fffeef]'
            }`}
          >
            <span>🌾</span>
            <span className="truncate">{lang === 'hi' ? "उपलब्ध फसलें" : "Crops on Sale"}</span>
            <span className="text-[11px] opacity-80">({filteredListings.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('buyer_inquiries')}
            className={`px-3 py-2.5 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'buyer_inquiries'
                ? 'bg-[#272c1a] text-[#9fd700] shadow-sm'
                : 'bg-white text-[#446158] hover:bg-[#fffeef]'
            }`}
          >
            <span>🤝</span>
            <span className="truncate">{lang === 'hi' ? "खरीदार मांग" : "Buyer Demands"}</span>
            <span className="text-[11px] opacity-80">({BUYER_REQUESTS.length})</span>
          </button>
        </div>

        {/* Zero-Typing Crop Filter Chips */}
        {activeTab === 'farmer_listings' && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {crops.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  if (selectedCrop !== c.id) {
                    setIsPreloading(true);
                    setSelectedCrop(c.id);
                    setTimeout(() => setIsPreloading(false), 200);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCrop === c.id
                    ? 'bg-[#9fd700] text-[#272c1a] shadow-sm'
                    : 'bg-white border border-[#44615820] text-[#446158] hover:bg-[#fffeef]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preloading Skeleton State */}
      {isPreloading && <MarketplaceSkeleton count={3} />}

      {/* Tab 1: Farmer Listings Catalog */}
      {!isPreloading && activeTab === 'farmer_listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-3 sm:space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-black text-[#272c1a] tracking-tight">
                    {lang === 'hi' ? item.cropHindi || item.crop : item.crop}
                  </h3>
                  <VerifiedBadge hash={item.hash} signature={item.signature} signedAt={lang === 'hi' ? item.dateHindi || item.date : item.date} />
                </div>

                <div className="bg-[#fffeef] border border-[#44615815] rounded-2xl p-3 my-2.5 space-y-1 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#446158] font-bold">{lang === 'hi' ? "मांगा गया भाव:" : "Asking Price:"}</span>
                    <span className="text-xl font-black text-[#272c1a]">
                      ₹{item.price.toLocaleString()} <span className="text-xs font-semibold text-[#446158]">/{lang === 'hi' ? (item.unitHindi || (item.unit === 'Quintal' ? 'क्विंटल' : item.unit)) : (item.unit || 'qtl')}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#446158] font-bold">{lang === 'hi' ? "उपलब्ध स्टॉक:" : "Stock Available:"}</span>
                    <span className="font-extrabold text-[#3d5500]">
                      {item.quantity} {lang === 'hi' ? (item.unitHindi || (item.unit === 'Quintal' ? 'क्विंटल' : item.unit)) : (item.unit || 'Quintals')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#446158] font-semibold mt-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? item.locationHindi || item.location : item.location}</span>
                </div>
                <p className="text-xs text-[#272c1a] font-bold mt-1">
                  {lang === 'hi' ? "किसान:" : "Farmer:"} {lang === 'hi' ? item.sellerNameHindi || item.sellerName : item.sellerName}
                </p>
              </div>

              {/* 1-Tap Call and WhatsApp CTA Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#44615815]">
                <button
                  type="button"
                  onClick={() => handleCallSeller(item)}
                  className="btn-lime text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 cursor-pointer interactive-tap shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'hi' ? "सीधा कॉल" : "Direct Call"}</span>
                </button>

                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    lang === 'hi' 
                      ? `नमस्ते ${item.sellerNameHindi || item.sellerName}, मैं किसानलिंक पर आपकी ${item.cropHindi || item.crop} लिस्टिंग खरीदने में रुचि रखता हूँ।`
                      : `Hello ${item.sellerName}, I am interested in your listing for ${item.crop} on KisanLink.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsAppClick(item.sellerNameHindi || item.sellerName)}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all interactive-tap cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'hi' ? "व्हाट्सएप" : "WhatsApp"}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Buyer Inquiries Catalog */}
      {!isPreloading && activeTab === 'buyer_inquiries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BUYER_REQUESTS.map((inquiry) => (
            <div 
              key={inquiry.id} 
              className="bg-[#272c1a] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-elevated border border-[#9fd70030] flex flex-col justify-between space-y-4 hover:border-[#9fd700] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#9fd700] uppercase tracking-wider flex items-center gap-1">
                    ✨ {lang === 'hi' ? "सत्यापित खरीदार मांग" : "Verified Buyer Request"}
                  </span>
                  <span className="text-[10px] text-gray-300 font-semibold">
                    {lang === 'hi' ? inquiry.postedTimeHindi || inquiry.postedTime : inquiry.postedTime}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">
                  {lang === 'hi' ? inquiry.buyerNameHindi || inquiry.buyerName : inquiry.buyerName}
                </h3>
                <p className="text-xs text-gray-300 font-medium">
                  📍 {lang === 'hi' ? inquiry.locationHindi || inquiry.location : inquiry.location}
                </p>

                <div className="bg-[#323922] rounded-2xl p-3 my-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{lang === 'hi' ? "आवश्यक फसल:" : "Looking for:"}</span>
                    <span className="font-bold text-[#fffeef]">
                      {lang === 'hi' ? inquiry.quantityHindi || inquiry.quantity : inquiry.quantity} ({lang === 'hi' ? inquiry.cropHindi || inquiry.crop : inquiry.crop})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{lang === 'hi' ? "प्रस्तावित भाव:" : "Target Rate:"}</span>
                    <span className="font-black text-[#9fd700] text-sm">
                      {lang === 'hi' ? inquiry.targetPriceHindi || inquiry.targetPrice : inquiry.targetPrice}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-[11px] text-gray-300 border-t border-gray-700/50">
                    <span>{lang === 'hi' ? "उठान (पिकअप):" : "Pickup:"}</span>
                    <span>{lang === 'hi' ? inquiry.pickupTypeHindi || inquiry.pickupType : inquiry.pickupType}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-200 italic font-medium">
                  {lang === 'hi' ? inquiry.noteHindi || inquiry.note : inquiry.note}
                </p>
              </div>

              {/* 1-Tap Contact for Buyer */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCallBuyer(inquiry)}
                  className="btn-lime text-xs font-black py-2.5 flex items-center justify-center gap-1.5 cursor-pointer interactive-tap shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'hi' ? "खरीदार को कॉल करें" : "Call Buyer"}</span>
                </button>

                <a
                  href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    lang === 'hi'
                      ? `नमस्ते ${inquiry.buyerName}, मैंने किसानलिंक पर आपकी ${inquiry.quantity} ${inquiry.crop} की मांग देखी।`
                      : `Hello ${inquiry.buyerName}, I saw your inquiry for ${inquiry.quantity} ${inquiry.crop} on KisanLink.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsAppClick(inquiry.buyerName)}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer interactive-tap shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'hi' ? "व्हाट्सएप" : "WhatsApp"}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Phone Call Modal */}
      <LiveCallModal
        isOpen={!!activeCallContact}
        onClose={() => setActiveCallContact(null)}
        contact={activeCallContact}
      />
    </div>
  );
}
