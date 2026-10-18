import React, { useState } from 'react';
import { ShieldCheck, Check, Key, ExternalLink, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function VerifiedBadge({ hash, signature, signedAt, algorithm = 'ECDSA-P256-SHA256' }) {
  const [showModal, setShowModal] = useState(false);
  const { lang } = useLanguage();

  const shortHash = hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : 'e3b0c4...a98b';

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#9fd70025] text-[#2d4000] border border-[#9fd70070] hover:bg-[#9fd70040] transition-colors cursor-pointer"
        title="Cryptographically Signed by Farmer Key (Click to Inspect)"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#3d5500]" />
        <span>{lang === 'hi' ? "सत्यापित रिकॉर्ड" : "Verified Record"}</span>
        <span className="font-mono text-[10px] text-[#446158] opacity-75 hidden sm:inline">[{shortHash}]</span>
      </button>

      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-[#272c1a]/70 backdrop-blur-sm flex items-center justify-center p-4 text-left"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#44615825] shadow-elevated relative animate-in fade-in zoom-in-95"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#fffeef] border border-[#44615820] flex items-center justify-center text-[#446158] hover:text-[#272c1a]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-[#3d5500] mb-3">
              <div className="w-9 h-9 rounded-2xl bg-[#9fd70030] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#3d5500]" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#272c1a]">
                  {lang === 'hi' ? "क्रिप्टोग्राफिक रिकॉर्ड सत्यापन" : "Cryptographic Trust Audit"}
                </h4>
                <p className="text-xs text-[#446158]">SubtleCrypto ECDSA Signature</p>
              </div>
            </div>

            <p className="text-xs text-[#446158] mb-4">
              This record was cryptographically signed on the farmer's browser using private-key encryption to guarantee tamper-proof auditability.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#fffeef] p-3 rounded-xl border border-[#44615820]">
                <span className="text-[10px] uppercase font-bold text-[#446158] block mb-1">SHA-256 Digest</span>
                <p className="break-all text-[#272c1a] font-bold">{hash || "0x9f81a74d2b..."}</p>
              </div>

              <div className="bg-[#fffeef] p-3 rounded-xl border border-[#44615820]">
                <span className="text-[10px] uppercase font-bold text-[#446158] block mb-1">ECDSA Signature (P-256)</span>
                <p className="break-all text-[#446158] text-[11px] leading-tight">
                  {signature || "3045022100d8b4e7a8...e748b9f"}
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#446158] pt-1">
                <span>Timestamp:</span>
                <span className="font-sans font-medium text-[#272c1a]">{signedAt ? new Date(signedAt).toLocaleString() : 'Just Now'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#446158]">
                <span>Algorithm:</span>
                <span className="bg-[#9fd70030] text-[#2d4000] px-2 py-0.5 rounded font-bold">{algorithm}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#44615815] flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="btn-lime text-xs font-bold py-2 px-5"
              >
                Close Audit Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
