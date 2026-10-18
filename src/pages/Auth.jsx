import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, Leaf, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('phone'); // 'phone' | 'otp'
  const [error, setError] = useState('');
  const { sendOtp, verifyOtp } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    sendOtp(phoneNumber);
    setStage('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const success = verifyOtp(otp || '1234');
    if (success) {
      navigate('/');
    } else {
      setError('Invalid OTP code. Enter 1234 for demo.');
    }
  };

  const handleQuickDemoLogin = () => {
    verifyOtp('1234');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fffeef] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#44615820] rounded-3xl p-8 shadow-elevated space-y-6 relative">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#272c1a] text-[#9fd700] flex items-center justify-center mx-auto shadow-md">
            <Leaf className="w-7 h-7 fill-[#9fd700]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            Kisan<span className="text-[#446158]">Link</span>
          </h2>
          <p className="text-xs font-semibold text-[#446158]">
            {lang === 'hi' ? "किसानों का अपना डिजिटल मंच" : "Farmer-First Digital Platform"}
          </p>
        </div>

        {/* Auth Mode Description */}
        <div className="bg-[#fffeef] border border-[#44615820] rounded-2xl p-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#9fd70030] text-[#3d5500] mb-1">
            <ShieldCheck className="w-3 h-3 text-[#3d5500]" />
            <span>Low-Literacy Passwordless Auth</span>
          </div>
          <p className="text-xs text-[#272c1a] font-medium">
            {stage === 'phone'
              ? (lang === 'hi' ? "मोबाइल नंबर डालकर आसानी से लॉगिन करें" : "Enter your mobile number to receive OTP")
              : (lang === 'hi' ? "एसएमएस में आया 4 अंकों का कोड डालें" : "Enter the 4-digit code sent to your phone")}
          </p>
        </div>

        {stage === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#446158] tracking-wider block">
                Mobile Number / मोबाइल नंबर:
              </label>
              <div className="flex items-center bg-[#fffeef] border border-[#44615830] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#9fd700]">
                <span className="text-sm font-black text-[#446158] mr-2">+91</span>
                <input
                  type="tel"
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="98765 43321"
                  className="w-full bg-transparent text-base font-bold text-[#272c1a] outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <button
              type="submit"
              className="w-full btn-lime py-3.5 text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === 'hi' ? "ओटीपी भेजें" : "Send Login OTP"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#446158] tracking-wider block">
                Verification Code / ओटीपी कोड:
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1 2 3 4"
                className="w-full text-center tracking-[0.5em] text-2xl font-black p-3 bg-[#fffeef] border border-[#44615830] rounded-2xl text-[#272c1a] outline-none focus:ring-2 focus:ring-[#9fd700]"
              />
              <p className="text-[11px] text-[#446158] text-center mt-1">
                Demo code: <strong>1234</strong>
              </p>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <button
              type="submit"
              className="w-full btn-lime py-3.5 text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{lang === 'hi' ? "सत्यापित करें और प्रवेश करें" : "Verify & Enter KisanLink"}</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('phone')}
              className="w-full text-xs font-bold text-[#446158] hover:underline text-center block pt-1"
            >
              Change Mobile Number
            </button>
          </form>
        )}

        {/* 1-Tap Demo Bypass Button */}
        <div className="pt-4 border-t border-[#44615815] text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-4 bg-[#272c1a] hover:bg-[#385049] text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9fd700]" />
            <span>1-Tap Demo Login (Ram Singh - Meerut Mandi)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
