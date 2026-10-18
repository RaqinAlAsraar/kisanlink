import React, { useState } from 'react';
import { Sparkles, Phone, MessageSquare, Check, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function InquiryCard({ inquiry }) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { lang, t } = useLanguage();

  return (
    <>
      <div className="bg-[#272c1a] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-elevated border border-[#9fd70020] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#9fd700]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-extrabold text-[#9fd700] tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-[#9fd700]" />
            {t('freshInquiry')}
          </span>
        </div>

        <p className="text-xs md:text-sm text-[#fffeef] leading-relaxed mb-4 font-medium">
          {lang === 'hi' ? inquiry.noteHindi || inquiry.note : inquiry.note}
        </p>

        <button
          onClick={() => setShowDetailModal(true)}
          className="w-full bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] font-black text-xs md:text-sm py-2.5 rounded-xl shadow-md transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer interactive-tap"
        >
          <span>{t('viewDetail')}</span>
        </button>
      </div>

      {/* Buyer Inquiry Detail Modal with 1-tap Call / WhatsApp */}
      {showDetailModal && (
        <div 
          onClick={() => setShowDetailModal(false)}
          className="fixed inset-0 z-50 bg-[#272c1a]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full border border-[#44615820] shadow-elevated relative animate-pop-in text-left max-h-[95vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#fffeef] border border-[#44615820] flex items-center justify-center text-[#446158] hover:text-[#272c1a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#3d5500] bg-[#9fd70025] px-3 py-1 rounded-full w-fit mb-3">
              <ShieldCheck className="w-4 h-4 text-[#3d5500]" />
              <span>{lang === 'hi' ? "सत्यापित प्रत्यक्ष खरीदार मांग" : "Verified Direct Buyer Request"}</span>
            </div>

            <h3 className="text-xl font-black text-[#272c1a] mb-1">
              {lang === 'hi' ? inquiry.buyerNameHindi || inquiry.buyerName : inquiry.buyerName}
            </h3>
            <p className="text-xs text-[#446158] font-semibold mb-4">
              📍 {lang === 'hi' ? inquiry.locationHindi || inquiry.location : inquiry.location} • {lang === 'hi' ? `पोस्ट किया गया: ${inquiry.postedTimeHindi || inquiry.postedTime}` : `Posted ${inquiry.postedTime}`}
            </p>

            <div className="bg-[#fffeef] border border-[#44615820] rounded-2xl p-4 space-y-2 mb-5 text-xs text-[#272c1a]">
              <div className="flex justify-between py-1 border-b border-[#44615810]">
                <span className="text-[#446158] font-bold">{lang === 'hi' ? "फसल एवं ग्रेड:" : "Crop & Grade:"}</span>
                <span className="font-extrabold">
                  {lang === 'hi' ? inquiry.cropHindi || inquiry.crop : inquiry.crop} ({lang === 'hi' ? inquiry.cropGradeHindi || inquiry.cropGrade : inquiry.cropGrade})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#44615810]">
                <span className="text-[#446158] font-bold">{lang === 'hi' ? "आवश्यक मात्रा:" : "Required Quantity:"}</span>
                <span className="font-extrabold text-[#3d5500]">
                  {lang === 'hi' ? inquiry.quantityHindi || inquiry.quantity : inquiry.quantity}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#44615810]">
                <span className="text-[#446158] font-bold">{lang === 'hi' ? "प्रस्तावित भाव:" : "Target Price:"}</span>
                <span className="font-black text-sm text-[#272c1a]">
                  {lang === 'hi' ? inquiry.targetPriceHindi || inquiry.targetPrice : inquiry.targetPrice}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#44615810]">
                <span className="text-[#446158] font-bold">{lang === 'hi' ? "परिवहन / पिकअप:" : "Logistics / Pickup:"}</span>
                <span className="font-medium text-right">
                  {lang === 'hi' ? inquiry.pickupTypeHindi || inquiry.pickupType : inquiry.pickupType}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#446158] font-bold">{lang === 'hi' ? "भुगतान की शर्तें:" : "Payment Terms:"}</span>
                <span className="font-medium text-right text-emerald-800">
                  {lang === 'hi' ? inquiry.paymentTermHindi || inquiry.paymentTerm : inquiry.paymentTerm}
                </span>
              </div>
            </div>

            {/* Direct 1-tap Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${inquiry.phone}`}
                className="btn-lime text-xs font-bold py-2.5 flex items-center justify-center gap-2 interactive-tap"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>{lang === 'hi' ? "खरीदार को कॉल करें" : "Call Buyer"}</span>
              </a>

              <a
                href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  lang === 'hi' 
                    ? `नमस्ते ${inquiry.buyerNameHindi || inquiry.buyerName}, किसानलिंक पर आपकी ${inquiry.quantityHindi || inquiry.quantity} ${inquiry.cropHindi || inquiry.crop} की मांग के संबंध में संपर्क कर रहा हूँ।` 
                    : `Hello ${inquiry.buyerName}, I have ${inquiry.quantity} of ${inquiry.crop} ready for sale on KisanLink.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all interactive-tap cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>{lang === 'hi' ? "व्हाट्सएप" : "WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
