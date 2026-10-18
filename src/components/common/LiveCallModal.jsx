import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldCheck, UserCheck, X } from 'lucide-react';
import { speakText, stopSpeech } from '../../services/speechService';
import { useLanguage } from '../../context/LanguageContext';

export default function LiveCallModal({ isOpen, onClose, contact }) {
  if (!isOpen || !contact) return null;

  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    setCallState('ringing');
    setSeconds(0);
    setIsMuted(false);

    // Simulated ringing sound / transition to connected in 1.8s
    const ringTimer = setTimeout(() => {
      setCallState('connected');
      // Speak the contact's realistic live greeting
      const greeting = contact.greeting || (
        lang === 'hi'
          ? `नमस्ते! मैं ${contact.name} बोल रहा हूँ। किसानलिंक पर आपका संपर्क प्राप्त हुआ। बताइए मैं आपकी क्या सहायता कर सकता हूँ?`
          : `Hello! This is ${contact.name}. I received your connection from KisanLink. How can I assist you with your crop today?`
      );
      speakText(greeting, lang === 'hi' ? 'hi-IN' : 'en-IN');
    }, 1800);

    return () => {
      clearTimeout(ringTimer);
      stopSpeech();
    };
  }, [contact]);

  // Call duration timer
  useEffect(() => {
    let interval = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleEndCall = () => {
    setCallState('ended');
    stopSpeech();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[999] bg-[#1a2113]/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleEndCall}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#272c1a] border-2 border-[#9fd700]/60 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-sm w-full shadow-2xl relative animate-pop-in flex flex-col items-center text-center overflow-hidden"
      >
        {/* Close Corner */}
        <button
          onClick={handleEndCall}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Network Security Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#9fd70020] text-[#9fd700] border border-[#9fd70040] mb-4 sm:mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? "सुरक्षित प्रत्यक्ष किसान हेल्पलाइन" : "Encrypted Direct Hotline"}</span>
        </div>

        {/* Avatar with Animated Pulse Rings */}
        <div className="relative mb-4 sm:mb-5">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#385049] to-[#9fd700] flex items-center justify-center text-2xl sm:text-3xl font-black text-[#272c1a] shadow-xl ${
            callState === 'ringing' ? 'animate-pulse-glow' : 'ring-4 ring-[#9fd700]/40'
          }`}>
            {contact.avatarLetter || contact.name?.split(' ')[1]?.[0] || contact.name?.[0] || 'K'}
          </div>

          {/* Connected Green Dot */}
          {callState === 'connected' && (
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#9fd700] border-2 border-[#272c1a] rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#272c1a] animate-ping" />
            </span>
          )}
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-black text-[#fffeef] tracking-tight">
          {contact.name}
        </h3>
        <p className="text-xs font-bold text-[#9fd700] mt-0.5">
          {contact.subtitle || contact.title || 'Verified Partner'}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {contact.org || contact.location || contact.phone}
        </p>

        {/* Call Status / Audio Waves */}
        <div className="my-6 min-h-[44px] flex flex-col items-center justify-center">
          {callState === 'ringing' ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#9fd700]">
              <span className="w-2 h-2 rounded-full bg-[#9fd700] animate-ping" />
              <span>{lang === 'hi' ? "घंटी बज रही है..." : "Connecting hotline..."}</span>
            </div>
          ) : callState === 'connected' ? (
            <div className="space-y-1.5 flex flex-col items-center">
              <span className="text-base font-black tracking-widest text-emerald-400 font-mono">
                {formatTimer(seconds)}
              </span>
              <div className="flex items-center gap-1 text-[#9fd700] h-5">
                <span className="sound-bar" />
                <span className="sound-bar" />
                <span className="sound-bar" />
                <span className="sound-bar" />
                <span className="sound-bar" />
              </div>
            </div>
          ) : (
            <span className="text-xs font-bold text-red-400">
              {lang === 'hi' ? "कॉल समाप्त" : "Call Ended"}
            </span>
          )}
        </div>

        {/* Live Call Control Buttons */}
        <div className="flex items-center gap-4 w-full justify-center pt-2">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Mute Mic"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer animate-pulse-glow-red"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isSpeakerOn ? 'bg-[#9fd700]/20 text-[#9fd700] border border-[#9fd700]/40' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle Speaker"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Real Dial Fallback for Mobile */}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="mt-6 text-[11px] font-bold text-gray-400 hover:text-[#9fd700] underline flex items-center gap-1 cursor-pointer"
          >
            <Phone className="w-3 h-3" />
            <span>{lang === 'hi' ? `मोबाइल डायलर से कॉल करें (${contact.phone})` : `Dial directly on phone (${contact.phone})`}</span>
          </a>
        )}
      </div>
    </div>
  );
}
