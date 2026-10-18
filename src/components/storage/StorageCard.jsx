import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function StorageCard({ item, onBook }) {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <div className="bg-white border border-[#44615820] rounded-2xl p-3.5 sm:p-4 shadow-soft hover:shadow-card transition-all flex items-center justify-between gap-2.5">
      <div className="min-w-0 flex-1">
        <h4 className="font-extrabold text-[#272c1a] text-sm md:text-base truncate">
          {lang === 'hi' ? item.nameHindi || item.name : item.name}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-[#446158] font-semibold mt-0.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#446158] shrink-0" />
          <span className="truncate">{lang === 'hi' ? item.distanceHindi || item.distance.replace('away', 'दूर') : item.distance}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-[#272c1a] text-[#9fd700] text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#9fd70040] shadow-sm">
          {item.capacityAvailable} {lang === 'hi' ? (item.unitHindi || 'MT उपलब्ध') : (item.unit || 'MT Available')}
        </span>
      </div>
    </div>
  );
}
