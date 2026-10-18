import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { speakText, stopSpeech } from '../../services/speechService';
import { useLanguage } from '../../context/LanguageContext';

export default function MandiCard({ item }) {
  const { lang, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAudioReadout = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const readout = lang === 'hi'
      ? `${item.hindiName || item.name} का आज का भाव ${item.price} रुपये प्रति क्विंटल है। ${item.delta > 0 ? `${item.delta} रुपये की तेजी है` : item.delta < 0 ? `${Math.abs(item.delta)} रुपये की मंदी है` : 'भाव स्थिर है'}`
      : `${item.name} today's rate is ₹${item.price} per quintal. Trend: ${item.deltaText}`;

    speakText(readout, lang === 'hi' ? 'hi-IN' : 'en-IN');

    // Reset speaking indicator after 4 seconds
    setTimeout(() => {
      setIsSpeaking(false);
    }, 4000);
  };

  const isUp = item.delta > 0;
  const isDown = item.delta < 0;

  return (
    <div className="bg-white border border-[#44615818] rounded-2xl p-4 shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between group">
      {/* Top Header: Name & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-[#272c1a] group-hover:text-[#446158] transition-colors truncate">
          {lang === 'hi' ? (
            <>
              {item.hindiName || item.name} <span className="text-xs font-normal text-[#446158]">({item.name})</span>
            </>
          ) : (
            <>
              {item.name} <span className="text-xs font-normal text-[#446158]">({item.hindiName ? item.hindiName.split(' ')[0] : ''})</span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={handleAudioReadout}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 interactive-tap ${
            isSpeaking 
              ? 'bg-[#9fd700] text-[#272c1a] border-[#9fd700] ring-4 ring-[#9fd70040] scale-105' 
              : 'bg-[#fffeef] border-[#44615820] text-[#446158] hover:bg-[#9fd700] hover:text-[#272c1a]'
          }`}
          title={t('audioReadout')}
        >
          {isSpeaking ? (
            <div className="flex items-center gap-0.5 h-3 text-[#272c1a]">
              <span className="sound-bar" />
              <span className="sound-bar" />
              <span className="sound-bar" />
            </div>
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Price */}
      <div className="my-1.5 flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-black text-[#272c1a] tracking-tight">
          ₹{item.price.toLocaleString()}
        </span>
        <span className="text-xs font-bold text-[#446158]">
          /{lang === 'hi' ? (item.unit === 'qtl' ? 'क्विंटल' : item.unit) : (item.unit || 'qtl')}
        </span>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center justify-between pt-1">
        <div className={`inline-flex items-center gap-1 text-xs font-bold ${
          isUp ? 'text-emerald-700' : isDown ? 'text-red-600' : 'text-gray-500'
        }`}>
          {isUp ? (
            <>
              <span className="text-emerald-600 font-extrabold">▲</span>
              <span>+{Math.abs(item.delta)} {lang === 'hi' ? "(आज)" : "(Today)"}</span>
            </>
          ) : isDown ? (
            <>
              <span className="text-red-500 font-extrabold">▼</span>
              <span>-{Math.abs(item.delta)} {lang === 'hi' ? "(आज)" : "(Today)"}</span>
            </>
          ) : (
            <>
              <span>—</span>
              <span>{lang === 'hi' ? "स्थिर" : "No Change"}</span>
            </>
          )}
        </div>
        <span className="text-[10px] text-[#44615890] font-semibold truncate max-w-[110px] text-right">{item.mandi}</span>
      </div>
    </div>
  );
}
