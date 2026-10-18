import React, { useState, useEffect } from 'react';
import { TrendingUp, Volume2, Search, Filter, ArrowUpRight, ArrowDownRight, MapPin, Calendar, RefreshCw } from 'lucide-react';
import MandiCard from '../components/mandi/MandiCard';
import WeatherWidget from '../components/weather/WeatherWidget';
import { MandiCardSkeleton } from '../components/common/SkeletonCard';
import { COMMODITIES } from '../data/commodities';
import { speakText, stopSpeech } from '../services/speechService';
import { useLanguage } from '../context/LanguageContext';

export default function MandiPrices() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isPreloading, setIsPreloading] = useState(true);
  const { lang, t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsPreloading(false), 380);
    return () => clearTimeout(timer);
  }, []);

  const filteredCommodities = COMMODITIES.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          (item.hindiName && item.hindiName.toLowerCase().includes(search.toLowerCase())) ||
                          item.mandi.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const [isSpeakingAll, setIsSpeakingAll] = useState(false);

  const handleReadAllPrices = () => {
    if (isSpeakingAll) {
      stopSpeech();
      setIsSpeakingAll(false);
      return;
    }

    setIsSpeakingAll(true);
    const itemsToRead = filteredCommodities.slice(0, 4);
    const speech = itemsToRead.map(c => 
      lang === 'hi' 
        ? `${c.hindiName} भाव ${c.price} रुपये`
        : `${c.name} rate is ₹${c.price}`
    ).join('. ');
    speakText(speech, lang === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => setIsSpeakingAll(false), 8000);
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header Banner */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9fd70025] text-[#3d5500] mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "एगमार्कनेट एवं स्थानीय एपीएमसी लाइव डेटा" : "AGMARKNET & Regional APMC Live Feeds"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            {lang === 'hi' ? "लाइव मंडी भाव और रुझान" : "Live Local Mandi Prices & Market Trends"}
          </h2>
          <p className="text-xs md:text-sm text-[#446158] mt-1">
            {lang === 'hi' 
              ? "वास्तविक समय मंडी आवक, दैनिक भाव परिवर्तन और किसानों के लिए बोलकर सुनने की सुविधा।" 
              : "Real-time APMC arrivals, daily rate deltas, and voice audio readouts for farmers."}
          </p>
        </div>

        {/* Listen All Audio Button */}
        <button
          onClick={handleReadAllPrices}
          className={`btn-lime text-xs md:text-sm font-bold flex items-center justify-center gap-2 px-5 py-3 shadow-md shrink-0 cursor-pointer interactive-tap w-full md:w-auto ${
            isSpeakingAll ? 'ring-4 ring-[#9fd70040]' : ''
          }`}
        >
          {isSpeakingAll ? (
            <div className="flex items-center gap-0.5 text-[#272c1a] h-4">
              <span className="sound-bar" />
              <span className="sound-bar" />
              <span className="sound-bar" />
            </div>
          ) : (
            <Volume2 className="w-4 h-4 fill-[#272c1a]" />
          )}
          <span>{lang === 'hi' ? (isSpeakingAll ? "भाव पढ़े जा रहे हैं..." : "प्रमुख भाव एक साथ सुनें") : (isSpeakingAll ? "Reading prices..." : "Listen to Top Prices")}</span>
        </button>
      </div>

      {/* Free Agricultural Weather Advisory Widget */}
      <WeatherWidget />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#446158] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? "फसल या मंडी का नाम खोजें..." : "Search crop or local mandi name..."}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#44615830] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9fd700] text-[#272c1a] shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Mandi Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isPreloading ? (
          <MandiCardSkeleton count={8} />
        ) : (
          filteredCommodities.map((item) => (
            <MandiCard key={item.id} item={item} />
          ))
        )}
      </div>

      {/* In-depth Market Table */}
      <div className="bg-white border border-[#44615820] rounded-3xl p-4 sm:p-6 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-black text-[#272c1a]">
            {lang === 'hi' ? "मंडी आगमन और भाव विवरण" : "Detailed APMC Mandi Arrivals & Ranges"}
          </h3>
          <span className="text-[10px] text-[#44615880] sm:hidden font-bold">
            {lang === 'hi' ? "दाएं स्वाइप करें ➔" : "Swipe sideways ➔"}
          </span>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[580px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#44615820] text-[#446158] uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">{lang === 'hi' ? "फसल / वस्तु" : "Commodity"}</th>
                <th className="pb-3">{lang === 'hi' ? "मंडी स्थान" : "Mandi Location"}</th>
                <th className="pb-3 text-right">{lang === 'hi' ? "आज का भाव" : "Today's Rate"}</th>
                <th className="pb-3 text-right">{lang === 'hi' ? "न्यूनतम / अधिकतम" : "Min / Max Range"}</th>
                <th className="pb-3 text-right">{lang === 'hi' ? "दैनिक आवक" : "Daily Arrival"}</th>
                <th className="pb-3 text-center">{lang === 'hi' ? "रुझान" : "Trend"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#44615810] text-[#272c1a] font-medium">
              {filteredCommodities.map((c) => (
                <tr key={c.id} className="hover:bg-[#fffeef] transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-sm flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span>
                      {lang === 'hi' ? c.hindiName : c.name}{' '}
                      <span className="text-xs text-[#446158] font-normal">
                        ({lang === 'hi' ? c.name : c.hindiName.split(' ')[0]})
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 text-[#446158] font-semibold">{c.mandi}</td>
                  <td className="py-3.5 text-right font-black text-sm">
                    ₹{c.price.toLocaleString()} /{lang === 'hi' && c.unit === 'qtl' ? 'क्विंटल' : c.unit}
                  </td>
                  <td className="py-3.5 text-right text-[#446158]">₹{c.minPrice} - ₹{c.maxPrice}</td>
                  <td className="py-3.5 text-right font-bold text-[#3d5500]">{c.arrival}</td>
                  <td className="py-3.5 text-center">
                    <span className={`inline-block font-extrabold ${c.delta > 0 ? 'text-emerald-700' : c.delta < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {c.deltaText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
