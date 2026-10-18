import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, ShieldAlert, Sparkles, Volume2, RefreshCw, MapPin, Navigation } from 'lucide-react';
import { fetchAgriculturalWeather, MANDI_WEATHER_ZONES } from '../../services/weatherService';
import { speakText } from '../../services/speechService';
import { useLanguage } from '../../context/LanguageContext';

export default function WeatherWidget() {
  const [selectedZone, setSelectedZone] = useState(MANDI_WEATHER_ZONES[0]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const { lang, t } = useLanguage();

  const loadWeather = async (zone = selectedZone) => {
    setLoading(true);
    const data = await fetchAgriculturalWeather(zone.lat, zone.lon, zone.name);
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWeather(selectedZone);
  }, [selectedZone]);

  const handleZoneChange = (e) => {
    const found = MANDI_WEATHER_ZONES.find(z => z.id === e.target.value);
    if (found) {
      setSelectedZone(found);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported on this device');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const customZone = {
          id: 'gps_farm',
          name: 'My Live Farm Location',
          lat: latitude,
          lon: longitude
        };
        setSelectedZone(customZone);
        await loadWeather(customZone);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleAudioAdvisory = () => {
    if (!weather) return;
    const text = lang === 'hi'
      ? `कृषि मौसम समाचार: ${weather.locationName} में वर्तमान तापमान ${weather.temp} डिग्री सेल्सियस है। अधिकतम तापमान ${weather.maxTemp} और न्यूनतम ${weather.minTemp} डिग्री रहेगा। नमी ${weather.humidity} प्रतिशत और हवा की गति ${weather.windSpeed} किलोमीटर प्रति घंटा है। कीटनाशक छिड़काव के लिए स्थिति ${weather.spraySuitability === 'Optimal' ? 'सर्वोत्तम' : 'प्रतिकूल'} है।`
      : `Agricultural Advisory for ${weather.locationName}: Current temperature is ${weather.temp}°C, condition is ${weather.conditionEn}. Relative humidity is ${weather.humidity}%. Spray window conditions are ${weather.spraySuitability}.`;
    speakText(text, lang === 'hi' ? 'hi-IN' : 'en-IN');
  };

  if (loading && !weather) {
    return (
      <div className="bg-white border border-[#44615820] rounded-3xl p-4 animate-pulse flex items-center justify-between">
        <div className="h-6 bg-[#44615820] rounded w-48" />
        <div className="h-8 bg-[#9fd70020] rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-white via-white to-[#ecfccb]/40 border border-[#44615820] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-soft hover:shadow-card transition-all space-y-3">
      {/* Top Bar: Location Switcher & Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#44615815] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#272c1a]">
            <MapPin className="w-3.5 h-3.5 text-[#3d5500]" />
            <select
              value={selectedZone.id}
              onChange={handleZoneChange}
              className="bg-[#fffeef] border border-[#44615830] rounded-lg px-2 py-1 text-xs font-extrabold text-[#272c1a] outline-none cursor-pointer hover:border-[#9fd700]"
            >
              {MANDI_WEATHER_ZONES.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
              {selectedZone.id === 'gps_farm' && (
                <option value="gps_farm">📍 My Live Farm Location</option>
              )}
            </select>
          </div>

          <button
            onClick={handleUseGPS}
            disabled={isLocating}
            className="text-[11px] font-bold text-[#446158] hover:text-[#272c1a] bg-white border border-[#44615820] px-2 py-1 rounded-lg flex items-center gap-1 hover:border-[#9fd700] transition-colors"
            title="Locate my farm using GPS"
          >
            <Navigation className={`w-3 h-3 text-[#3d5500] ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">GPS Farm</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#3d5500] bg-[#9fd70025] px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">{lang === 'hi' ? "कृषि मौसम (ओपन-मेटियो • सटीक पूर्वानुमान)" : "Free Agro-Weather (Open-Meteo • Zero data.gov.in)"}</span>
          <span className="sm:hidden">{lang === 'hi' ? "ओपन-मेटियो लाइव" : "Open-Meteo Live"}</span>
        </div>
      </div>

      {/* Main Weather Information Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Weather condition & temperature */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="text-2xl sm:text-4xl p-2 sm:p-2.5 bg-[#fffeef] rounded-2xl border border-[#44615815] shadow-inner shrink-0">
            {weather?.icon || '☀️'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-[#272c1a] tracking-tight">
                {weather?.temp}°C
              </span>
              <span className="text-xs font-bold text-[#446158]">
                ({weather?.minTemp}°C - {weather?.maxTemp}°C)
              </span>
              <span className="text-xs font-black text-[#3d5500] px-2 py-0.5 rounded-full bg-[#9fd70025] hidden md:inline">
                {lang === 'hi' ? weather?.conditionHi : weather?.conditionEn}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-[#446158] flex items-center gap-1.5 mt-0.5 truncate">
              <span>📍 {weather?.locationName}</span>
              <span className="text-[#44615840]">•</span>
              <span className="text-[10px] text-[#44615880]">
                {lang === 'hi' ? `अपडेट: ${weather?.lastUpdated}` : `Updated ${weather?.lastUpdated}`}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Agricultural Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs w-full sm:w-auto overflow-x-auto py-1">
          <div className="bg-[#fffeef] border border-[#44615815] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
            <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-[#446158] block leading-tight">
                {lang === 'hi' ? "नमी" : "Humidity"}
              </span>
              <span className="font-extrabold text-[#272c1a]">{weather?.humidity}%</span>
            </div>
          </div>

          <div className="bg-[#fffeef] border border-[#44615815] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
            <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <div>
              <span className="text-[10px] text-[#446158] block leading-tight">
                {lang === 'hi' ? "हवा" : "Wind"}
              </span>
              <span className="font-extrabold text-[#272c1a]">
                {weather?.windSpeed} {lang === 'hi' ? "किमी/घंटा" : "km/h"}
              </span>
            </div>
          </div>

          <div className="bg-[#fffeef] border border-[#44615815] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
            <ShieldAlert className={`w-3.5 h-3.5 ${weather?.pestRisk === 'High' ? 'text-red-500' : 'text-emerald-600'} shrink-0`} />
            <div>
              <span className="text-[10px] text-[#446158] block leading-tight">
                {lang === 'hi' ? "छिड़काव अनुकूलता" : "Spray Window"}
              </span>
              <span className="font-extrabold text-[#3d5500]">
                {lang === 'hi' 
                  ? (weather?.spraySuitability === 'Optimal' ? 'सर्वोत्तम' : weather?.spraySuitability === 'Caution' ? 'सावधानी' : 'प्रतिकूल')
                  : weather?.spraySuitability}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Audio Reader & Refresh */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 shrink-0">
          <button
            onClick={handleAudioAdvisory}
            className="btn-lime text-xs font-bold py-2 px-3 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-sm cursor-pointer interactive-tap"
            title="Listen to Weather Advisory"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "मौसम सुनें" : "Listen Advisory"}</span>
          </button>
          <button
            onClick={() => loadWeather()}
            className="p-2 rounded-xl border border-[#44615820] bg-white hover:bg-[#fffeef] text-[#446158] transition-colors shrink-0 cursor-pointer interactive-tap"
            title="Refresh Weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
