import React, { useState } from 'react';
import { PhoneCall, FileText, Volume2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { speakText } from '../../services/speechService';
import VerifiedBadge from '../common/VerifiedBadge';
import { useLanguage } from '../../context/LanguageContext';

export default function DiagnosticCard({ scan }) {
  const [showRemedies, setShowRemedies] = useState(false);
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const isHighRisk = scan.riskLevel === 'HIGH RISK' || scan.riskCode === 'high';
  const isLowRisk = scan.riskLevel === 'LOW RISK' || scan.riskCode === 'low';

  const handleAudioRemedy = (e) => {
    e.stopPropagation();
    const diseaseText = lang === 'hi' ? scan.diseaseHindi || scan.disease : scan.disease;
    const summaryText = lang === 'hi' ? scan.summaryHindi || scan.summary : scan.summary;
    const remedyList = lang === 'hi' ? scan.remedyHindi || scan.remedy : scan.remedy;
    
    const textToSpeak = `${diseaseText}। ${summaryText}। ` + 
      (remedyList ? remedyList.join('. ') : '');
    speakText(textToSpeak, lang === 'hi' ? 'hi-IN' : 'en-IN');
  };

  const getRiskLabel = () => {
    if (lang === 'hi') {
      return scan.riskLevelHindi || (isHighRisk ? 'गंभीर खतरा' : isLowRisk ? 'सुरक्षित' : 'मध्यम खतरा');
    }
    return scan.riskLevel;
  };

  const remediesToDisplay = lang === 'hi' ? scan.remedyHindi || scan.remedy : scan.remedy;

  return (
    <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Thumbnail & Details */}
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          {/* Visual Square Thumbnail (Matching Wireframe) */}
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center relative shrink-0 shadow-inner overflow-hidden"
            style={{ 
              backgroundColor: scan.imageDataUrl ? 'transparent' : (scan.thumbBg || (isLowRisk ? '#9fd700' : '#385049'))
            }}
          >
            {scan.imageDataUrl ? (
              <img src={scan.imageDataUrl} alt={scan.disease} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <>
                <span 
                  className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                    isHighRisk ? 'bg-red-500 ring-2 ring-white' : 'bg-emerald-900 ring-2 ring-white'
                  }`}
                />
                <span className={`text-[10px] sm:text-xs font-black tracking-tight text-center px-1 ${isLowRisk ? 'text-[#272c1a]' : 'text-white'}`}>
                  {lang === 'hi' 
                    ? scan.thumbTextHindi || (isLowRisk ? 'स्वस्थ' : 'पत्ती धब्बा')
                    : scan.thumbText || (isLowRisk ? 'Healthy' : 'Leaf Spot')}
                </span>
              </>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
              <h3 className="text-base sm:text-lg font-black text-[#272c1a] tracking-tight">
                {lang === 'hi' ? scan.diseaseHindi || scan.disease : scan.disease}
              </h3>
              <span 
                className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${
                  isHighRisk 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : isLowRisk 
                    ? 'bg-[#9fd70030] text-[#3d5500] border border-[#9fd70060]' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {getRiskLabel()}
              </span>

              {(scan.isOffline || scan.cloudAiStatus === 'OFFLINE') && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  <span>⚡ {lang === 'hi' ? "ऑन-डिवाइस विज़न मॉडल" : "On-Device Model"}</span>
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs font-semibold text-[#446158] mb-1">
              {lang === 'hi' ? scan.cropHindi || scan.crop : scan.crop} • {lang === 'hi' ? scan.timestampHindi || scan.timestamp : scan.timestamp}
            </p>

            <p className="text-xs text-[#272c1a] leading-relaxed max-w-xl">
              {lang === 'hi' ? scan.summaryHindi || scan.summary : scan.summary}
            </p>
          </div>
        </div>

        {/* Action Buttons (Responsive Grid on Mobile / Flex on Desktop) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 shrink-0">
          {/* Talk to Expert CTA (Priority for High/Medium Risk) */}
          <button
            onClick={() => navigate('/experts', { state: { scan } })}
            className="flex items-center justify-center gap-1.5 bg-[#272c1a] hover:bg-[#385049] text-white text-xs font-bold px-2.5 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer interactive-tap"
            title="Connect with local agronomist"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#9fd700]" />
            <span className="truncate">{t('talkToExpert')}</span>
          </button>

          {/* View Remedy Button */}
          <button
            onClick={() => setShowRemedies(!showRemedies)}
            className="flex items-center justify-center gap-1.5 border border-[#44615835] hover:bg-[#fffeef] text-[#272c1a] text-xs font-bold px-2.5 sm:px-4 py-2.5 rounded-xl transition-all active:scale-95 bg-white shadow-sm cursor-pointer interactive-tap"
          >
            <FileText className="w-3.5 h-3.5 text-[#446158]" />
            <span className="truncate">{t('viewRemedy')}</span>
            {showRemedies ? <ChevronUp className="w-3 h-3 text-[#446158]" /> : <ChevronDown className="w-3 h-3 text-[#446158]" />}
          </button>
        </div>
      </div>

      {/* Expandable Remedy Section with Audio Reader */}
      {showRemedies && (
        <div className="mt-4 pt-4 border-t border-[#44615815] bg-[#fffeef] rounded-2xl p-3.5 sm:p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-xs font-extrabold uppercase text-[#446158] tracking-wider">
              🌿 {lang === 'hi' ? "उपचार और रोकथाम निर्देश" : "Prescribed Actionable Remedies"}
            </span>
            <button
              onClick={handleAudioRemedy}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer interactive-tap"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? "उपचार सुनें" : "Listen to Remedies"}</span>
            </button>
          </div>

          <ul className="space-y-2 text-xs text-[#272c1a]">
            {remediesToDisplay && remediesToDisplay.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#44615820] text-[#446158] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ul>

          {/* Cryptographic Verified Badge */}
          <div className="mt-4 pt-3 border-t border-[#44615815] flex items-center justify-between flex-wrap gap-2">
            <VerifiedBadge 
              hash={scan.hash} 
              signature={scan.signature} 
              signedAt={scan.signedAt} 
            />
            <span className="text-[10px] text-[#44615880]">
              {lang === 'hi' ? "किसानलिंक एआई रोग निदान इंजन द्वारा सत्यापित" : "Audited by KisanLink AI Diagnostics Engine"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
