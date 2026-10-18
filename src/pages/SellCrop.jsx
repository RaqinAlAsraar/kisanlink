import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Volume2, 
  Store, 
  Radio, 
  AlertCircle,
  Plus,
  Minus,
  Edit3,
  RefreshCw,
  MapPin,
  User,
  Phone
} from 'lucide-react';
import { 
  createSpeechRecognizer, 
  speakText, 
  stopSpeech,
  requestMicrophoneAccess, 
  createAudioLevelMeter, 
  getSupportedAudioMimeType 
} from '../services/speechService';
import { parseCropSpeech } from '../services/voiceParser';
import { processOfflineQuery } from '../services/offlinePatternEngine';
import { signRecord } from '../services/cryptoService';
import { dbPut, queueOfflineAction } from '../services/db';
import { useNetwork } from '../context/NetworkContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VoiceAssistantModal from '../components/voice/VoiceAssistantModal';

const PRESET_CROPS = [
  { id: 'Wheat', name: 'Wheat', hindi: 'गेहूं', icon: '🌾', defaultPrice: 2275 },
  { id: 'Tomato', name: 'Tomato', hindi: 'टमाटर', icon: '🍅', defaultPrice: 1800 },
  { id: 'Paddy', name: 'Paddy', hindi: 'धान', icon: '🍚', defaultPrice: 3100 },
  { id: 'Potato', name: 'Potato', hindi: 'आलू', icon: '🥔', defaultPrice: 1250 },
  { id: 'Mustard', name: 'Mustard', hindi: 'सरसों', icon: '🌻', defaultPrice: 5450 },
  { id: 'Onion', name: 'Onion', hindi: 'प्याज़', icon: '🧅', defaultPrice: 1650 },
  { id: 'Cotton', name: 'Cotton', hindi: 'कपास', icon: '☁️', defaultPrice: 6800 },
  { id: 'Maize', name: 'Maize', hindi: 'मक्का', icon: '🌽', defaultPrice: 2050 }
];

const QUANTITY_PRESETS = [20, 50, 100, 200, 500];

export default function SellCrop() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline } = useNetwork();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [crop, setCrop] = useState('Wheat');
  const [cropHindi, setCropHindi] = useState('गेहूं');
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('Quintal');
  const [price, setPrice] = useState(2275);
  const [sellerName, setSellerName] = useState(user?.name || 'Ram Singh');
  const [locationName, setLocationName] = useState(user?.location || 'Meerut Mandi Zone (UP)');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91 98765 43321');

  const [isListening, setIsListening] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [manualInputText, setManualInputText] = useState('');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [aiParsedNotice, setAiParsedNotice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successPayload, setSuccessPayload] = useState(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const levelMeterRef = useRef(null);
  const recognizerRef = useRef(null);
  const spokenTranscriptRef = useRef('');

  // Check if routed with prefilled voice data from Global Modal
  useEffect(() => {
    if (location.state?.prefill) {
      const { crop: prefillCrop, cropHindi: prefillCropHindi, quantity: prefillQty, unit: prefillUnit, price: prefillPrice, rawTranscript } = location.state.prefill;
      if (prefillCrop) {
        setCrop(prefillCrop);
        const match = PRESET_CROPS.find(c => c.id.toLowerCase() === prefillCrop.toLowerCase());
        if (match) setCropHindi(match.hindi);
      }
      if (prefillCropHindi) setCropHindi(prefillCropHindi);
      if (prefillQty) setQuantity(Number(prefillQty));
      if (prefillUnit) setUnit(prefillUnit);
      if (prefillPrice) setPrice(Number(prefillPrice));
      if (rawTranscript) {
        setSpokenTranscript(rawTranscript);
        spokenTranscriptRef.current = rawTranscript;
      }
      setAiParsedNotice(true);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      stopVoiceInput();
    };
  }, []);


  const applyCropSpeech = (text, shouldSpeak = true) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    setSpokenTranscript(cleanText);
    spokenTranscriptRef.current = cleanText;

    const parsed = parseCropSpeech(cleanText);
    if (parsed) {
      // Robust crop matching with PRESET_CROPS
      const match = PRESET_CROPS.find(c => 
        c.id.toLowerCase() === (parsed.cropId || parsed.crop || '').toLowerCase() ||
        c.name.toLowerCase() === (parsed.crop || '').toLowerCase() ||
        c.hindi === parsed.cropHindi
      );

      if (match) {
        setCrop(match.id);
        setCropHindi(match.hindi);
      } else if (parsed.crop) {
        setCrop(parsed.crop);
        setCropHindi(parsed.cropHindi || parsed.crop);
      }

      if (parsed.quantity && Number(parsed.quantity) > 0) {
        setQuantity(Number(parsed.quantity));
      }

      if (parsed.unit) {
        if (/kg|kilo|किलो/i.test(parsed.unit)) setUnit('kg');
        else if (/bori|bag|बोरी/i.test(parsed.unit)) setUnit('Bags');
        else setUnit('Quintal');
      }

      if (parsed.price && Number(parsed.price) >= 100) {
        setPrice(Number(parsed.price));
      }

      setAiParsedNotice(true);

      if (shouldSpeak) {
        const cropNameForSpeech = match ? (lang === 'hi' ? match.hindi : match.name) : (parsed.cropHindi || parsed.crop);
        const unitLabel = parsed.unit === 'Quintal' ? (lang === 'hi' ? 'क्विंटल' : 'Quintal') : parsed.unit;
        const readout = lang === 'hi' 
          ? `आपकी ${parsed.quantity} ${unitLabel} ${cropNameForSpeech} की लिस्टिंग ₹${parsed.price} के भाव पर तैयार है।`
          : `Listing prepared for ${parsed.quantity} ${unitLabel} of ${cropNameForSpeech} at ₹${parsed.price}.`;
        speakText(readout, lang === 'hi' ? 'hi-IN' : 'en-IN');
      }
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      stopVoiceInput();
      return;
    }

    try { stopSpeech(); } catch (e) {}
    setVoiceNotice('');
    setSpokenTranscript('');
    spokenTranscriptRef.current = '';
    setRecSeconds(0);
    setAudioVolume(0);
    audioChunksRef.current = [];

    let stream = null;
    try {
      stream = await requestMicrophoneAccess();
      streamRef.current = stream;
    } catch (err) {
      console.warn('Microphone permission blocked or not available:', err);
      setVoiceNotice(
        lang === 'hi'
          ? 'माइक अनुमति नहीं मिली। आप नीचे दिए गए किसी भी नमूने पर टैप करें या ऊपर टाइप करें।'
          : 'Microphone blocked. Please tap any sample chip below or type in the box.'
      );
      return;
    }

    setIsListening(true);

    // 1. Live volume meter with silence auto-stop
    try {
      const meter = createAudioLevelMeter(
        stream, 
        (vol) => setAudioVolume(vol),
        () => {
          // AI automatically stops recording when farmer finishes speaking
          stopVoiceInput();
        }
      );
      levelMeterRef.current = meter;
    } catch (e) {
      console.warn('Level meter init error:', e);
    }

    // 2. MediaRecorder for cross-browser audio capture
    const mimeType = getSupportedAudioMimeType();
    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        await processSellAudio(audioBlob, mimeType);
      };

      recorder.start(250);
    } catch (e) {
      console.warn('MediaRecorder error:', e);
    }

    // 3. Auto-stop timer backup (8s maximum)
    timerRef.current = setInterval(() => {
      setRecSeconds((prev) => {
        if (prev >= 7) {
          stopVoiceInput();
          return 7;
        }
        return prev + 1;
      });
    }, 1000);

    // 4. Parallel WebSpeech - ACCUMULATE ONLY, DO NOT SPEAK WHILE USER IS SPEAKING!
    const recognizer = createSpeechRecognizer(
      (text) => {
        if (text) {
          spokenTranscriptRef.current = text;
          setSpokenTranscript(text);
        }
      },
      (err) => console.warn('WebSpeech note:', err),
      () => {},
      lang === 'hi' ? 'hi-IN' : 'en-IN'
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try { recognizer.start(); } catch (e) {}
    }
  };

  const stopVoiceInput = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (levelMeterRef.current) {
      try { levelMeterRef.current.stop(); } catch (e) {}
      levelMeterRef.current = null;
    }
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch (e) {}
      recognizerRef.current = null;
    }
    setIsListening(false);
    setAudioVolume(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    } else if (spokenTranscriptRef.current) {
      applyCropSpeech(spokenTranscriptRef.current, true);
    }
  };

  const processSellAudio = async (audioBlob, mimeType) => {
    const currentText = (spokenTranscriptRef.current || spokenTranscript || '').trim();
    setIsProcessingAI(true);

    // CRITICAL REQUIREMENT: Active Cloud AI requires internet; when offline, explicitly state that it doesn't work offline and run offline pattern engine
    if (!isOnline) {
      console.log('[Sell AI] Offline detected: Active Cloud AI requires internet. Running offline pattern engine.');
      const offlineResult = processOfflineQuery(currentText || 'gehu bechna hai', '/sell');
      setSpokenTranscript(currentText || (lang === 'hi' ? 'गेहूं बेचना है' : 'Sell Wheat'));
      
      const cropVal = offlineResult.crop || offlineResult.cropHindi;
      const match = PRESET_CROPS.find(c => 
        (cropVal && c.id.toLowerCase() === cropVal.toLowerCase()) ||
        (cropVal && c.name.toLowerCase() === cropVal.toLowerCase()) ||
        (cropVal && c.hindi === cropVal)
      );

      if (match) {
        setCrop(match.id);
        setCropHindi(match.hindi);
      } else if (offlineResult.crop) {
        setCrop(offlineResult.crop);
        setCropHindi(offlineResult.cropHindi || offlineResult.crop);
      }

      if (offlineResult.quantity && Number(offlineResult.quantity) > 0) {
        setQuantity(Number(offlineResult.quantity));
      }

      if (offlineResult.unit) {
        if (/kg|kilo|किलो/i.test(offlineResult.unit)) setUnit('kg');
        else if (/bori|bag|बोरी/i.test(offlineResult.unit)) setUnit('Bags');
        else setUnit('Quintal');
      }

      if (offlineResult.price && Number(offlineResult.price) >= 100) {
        setPrice(Number(offlineResult.price));
      }

      setAiParsedNotice(true);
      setVoiceNotice(
        lang === 'hi'
          ? '⚡ सक्रिय एआई केवल ऑनलाइन काम करता है। ऑफ़लाइन पैटर्न इंजन द्वारा जानकारी भरी गई।'
          : '⚡ Active AI works only online. Prefilled via offline pattern engine.'
      );

      const spokenLine = lang === 'hi' 
        ? `आपकी ${offlineResult.quantity || quantity} ${unit === 'Quintal' ? 'क्विंटल' : unit} ${cropHindi} की लिस्टिंग ₹${offlineResult.price || price} के भाव पर तैयार है।` 
        : `Prepared listing for ${offlineResult.quantity || quantity} ${unit} of ${crop} at ₹${offlineResult.price || price}.`;
      speakText(spokenLine, lang === 'hi' ? 'hi-IN' : 'en-IN');
      setIsProcessingAI(false);
      return;
    }

    if (audioBlob && audioBlob.size > 1200) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result.split(',')[1];
          try {
            const res = await fetch('/api/voice/parse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                audioBase64: base64Data, 
                mimeType,
                textInput: currentText,
                currentRoute: '/sell'
              })
            });
            const json = await res.json();
            if (json && json.data) {
              setSpokenTranscript(json.data.transcript || currentText || 'वॉयस इनपुट प्राप्त हुआ');
              spokenTranscriptRef.current = json.data.transcript || currentText || '';
              
              const cropVal = json.data.crop || json.data.cropHindi;
              const match = PRESET_CROPS.find(c => 
                (cropVal && c.id.toLowerCase() === cropVal.toLowerCase()) ||
                (cropVal && c.name.toLowerCase() === cropVal.toLowerCase()) ||
                (cropVal && c.hindi === cropVal)
              );

              if (match) {
                setCrop(match.id);
                setCropHindi(match.hindi);
              } else if (json.data.crop) {
                setCrop(json.data.crop);
                setCropHindi(json.data.cropHindi || json.data.crop);
              }

              if (json.data.quantity && Number(json.data.quantity) > 0) {
                setQuantity(Number(json.data.quantity));
              }

              if (json.data.unit) {
                if (/kg|kilo|किलो/i.test(json.data.unit)) setUnit('kg');
                else if (/bori|bag|बोरी/i.test(json.data.unit)) setUnit('Bags');
                else setUnit('Quintal');
              }

              if (json.data.price && Number(json.data.price) >= 100) {
                setPrice(Number(json.data.price));
              }

              setAiParsedNotice(true);

              const spokenLine = json.data.spokenResponse || 
                (lang === 'hi' 
                  ? `आपकी ${json.data.quantity || quantity} ${unit === 'Quintal' ? 'क्विंटल' : unit} ${cropHindi} की लिस्टिंग ₹${json.data.price || price} के भाव पर तैयार है।` 
                  : `Prepared listing for ${json.data.quantity || quantity} ${unit} of ${crop} at ₹${json.data.price || price}.`);
              speakText(spokenLine, lang === 'hi' ? 'hi-IN' : 'en-IN');
              setIsProcessingAI(false);
              return;
            }
          } catch (e) {
            console.warn('Voice API error:', e);
          }

          if (currentText) {
            applyCropSpeech(currentText, true);
          }
          setIsProcessingAI(false);
        };
      } catch (err) {
        setIsProcessingAI(false);
        if (currentText) applyCropSpeech(currentText, true);
      }
    } else if (currentText) {
      applyCropSpeech(currentText, true);
      setIsProcessingAI(false);
    } else {
      setIsProcessingAI(false);
    }
  };

  const handleSelectCropPreset = (c) => {
    setCrop(c.id);
    setCropHindi(c.hindi);
    setPrice(c.defaultPrice);
  };

  const handlePublishListing = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // CLEAN CROP STRING: No duplicated bracketed transliteration
      const listingPayload = {
        crop: crop,
        cropHindi: cropHindi,
        cropType: crop,
        quantity: Number(quantity),
        unit: unit,
        price: Number(price),
        sellerName: sellerName || 'Ram Singh',
        location: locationName || 'Meerut Mandi Zone (UP)',
        phone: phoneNumber || '+91 98765 43321',
        createdAt: new Date().toISOString()
      };

      // 1. Browser Web Crypto cryptographic signing
      const cryptoSignature = await signRecord(listingPayload);

      const fullListing = {
        id: `listing-${Date.now()}`,
        ...listingPayload,
        hash: cryptoSignature.hash,
        signature: cryptoSignature.signature,
        signedAt: cryptoSignature.signedAt,
        verified: true,
        date: 'Just Now'
      };

      // 2. Persist to local IndexedDB
      await dbPut('listings', fullListing);

      // 3. Queue offline sync if disconnected
      if (!isOnline) {
        await queueOfflineAction('NEW_LISTING', fullListing);
      }

      setSuccessPayload(fullListing);

      showToast({
        title: lang === 'hi' ? "फसल लिस्टिंग लाइव हुई! 🌾" : "Crop Listing is Live! 🌾",
        message: `${quantity} ${unit} ${lang === 'hi' ? cropHindi : crop} @ ₹${price}`,
        type: 'success'
      });

      const audioAnnouncement = lang === 'hi'
        ? `आपकी ${quantity} ${unit} ${cropHindi} की लिस्टिंग ₹${price} के भाव पर सफलतापूर्वक दर्ज हो गई है।`
        : `Your listing for ${quantity} ${unit} of ${crop} at ₹${price} has been verified and posted.`;
      speakText(audioAnnouncement, lang === 'hi' ? 'hi-IN' : 'en-IN');
    } catch (err) {
      console.error('Failed to post listing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessPayload(null);
    setCrop('Wheat');
    setCropHindi('गेहूं');
    setQuantity(50);
    setUnit('Quintal');
    setPrice(2275);
    setSpokenTranscript('');
    setAiParsedNotice(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9fd70025] text-[#3d5500]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? "मैजिक ऐड • बोलकर फसल लिस्टिंग" : "Magic Add • Low-Literacy Voice Assistant"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
          {lang === 'hi' ? "फसल बिक्री सूची बनाएं" : "Sell Your Crop (Voice-First Listing)"}
        </h2>
        <p className="text-xs md:text-sm text-[#446158]">
          {lang === 'hi' ? "बोलें या नीचे दिए गए विकल्पों से चुनें। टाइप करने की कोई ज़रूरत नहीं।" : "Speak naturally or tap crop presets. AI fills the form, and you can edit any detail."}
        </p>
      </div>

      {/* Voice Trigger Banner */}
      <div className="bg-[#272c1a] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-elevated border border-[#9fd70030] text-center space-y-4">
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-300 scale-105'
                : 'bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] ring-8 ring-[#9fd70020] active:scale-95'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-8 h-8" />
                <span className="text-[10px] font-black uppercase mt-0.5">0:0{recSeconds}</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 stroke-[2.2]" />
                <span className="text-[9px] font-bold uppercase mt-0.5">
                  {lang === 'hi' ? "माइक दबाएं" : "Tap Mic"}
                </span>
              </>
            )}
          </button>

          {/* Real-time Voice Volume & Hearing Feedback with Silence Notice */}
          {isListening && (
            <div className="mt-3 w-full max-w-xs space-y-2">
              <div className="flex items-center justify-center gap-1 h-7">
                {[0.4, 0.8, 1.2, 0.7, 0.5].map((multiplier, i) => {
                  const barHeight = Math.max(6, Math.min(26, (audioVolume * multiplier) + 6));
                  return (
                    <div
                      key={i}
                      className="w-1.5 rounded-full transition-all duration-75"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: audioVolume > 6 ? '#a3e635' : '#6b7280'
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-center">
                {audioVolume > 6 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>🟢 {lang === 'hi' ? "आवाज़ आ रही है (चुप होने पर AI खुद रुकेगा)" : `Hearing you: ${audioVolume}% (Auto-stops on silence)`}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40">
                    <Radio className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>🟡 {lang === 'hi' ? "माइक तैयार है, बोलिए..." : "Mic ready... speak crop & price"}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={stopVoiceInput}
                className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-[#9fd700] text-[#272c1a] font-black text-xs hover:bg-[#8cb800] transition-all cursor-pointer"
              >
                <span>{lang === 'hi' ? "✓ पूरा हुआ (विश्लेषण करें)" : "✓ Done (Analyze Now)"}</span>
              </button>
            </div>
          )}

          {!isListening && (
            <span className="text-sm font-extrabold text-[#9fd700] mt-3">
              {lang === 'hi' ? "माइक दबाकर बोलें ('Magic Add')" : "Tap Mic to Auto-Fill via Voice ('Magic Add')"}
            </span>
          )}

          <p className="text-xs text-gray-300 mt-1">
            "{lang === 'hi' ? "50 क्विंटल गेहूं 2275 रुपये में बेचना है" : "50 quintal Gehu 2275 rupaye me bechna hai"}"
          </p>
        </div>

        {isProcessingAI && (
          <div className="p-2.5 bg-[#9fd70020] border border-[#9fd70040] rounded-xl text-xs text-[#9fd700] font-bold flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-[#9fd700] border-t-transparent rounded-full animate-spin" />
            <span>{lang === 'hi' ? "AI आवाज़ को समझकर फॉर्म भर रहा है..." : "Gemini AI Analyzing & Auto-Filling Form..."}</span>
          </div>
        )}

        {voiceNotice && (
          <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200">
            {voiceNotice}
          </div>
        )}

        {/* Quick Voice Simulation Chips */}
        <div className="pt-2 border-t border-gray-700/60">
          <span className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
            {lang === 'hi' ? "⚡ त्वरित बोलकर परीक्षण नमूने (1-टैप टेस्ट):" : "⚡ Quick Voice Simulation (1-Tap Test):"}
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { prompt: "50 quintal Gehu 2275 rupaye me bechna hai", labelHi: "50 क्विंटल गेहूं ₹2,275", labelEn: "50 qtl Wheat ₹2,275" },
              { prompt: "20 quintal Tamatar 1800 rupaye me bechna hai", labelHi: "20 क्विंटल टमाटर ₹1,800", labelEn: "20 qtl Tomato ₹1,800" },
              { prompt: "35 quintal Dhan 3100 rupaye me bechna hai", labelHi: "35 क्विंटल धान ₹3,100", labelEn: "35 qtl Paddy ₹3,100" },
              { prompt: "15 quintal Potato 1250 me bechna hai", labelHi: "15 क्विंटल आलू ₹1,250", labelEn: "15 qtl Potato ₹1,250" }
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyCropSpeech(p.prompt)}
                className="text-xs font-semibold bg-[#323922] hover:bg-[#9fd700] hover:text-[#272c1a] text-white px-2.5 py-1.5 rounded-xl border border-gray-600 transition-all text-left cursor-pointer interactive-tap"
              >
                🗣️ {lang === 'hi' ? p.labelHi : p.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Voice / Text Manual Input Form (for 100% reliable entry on any browser/device) */}
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            if (manualInputText.trim()) {
              applyCropSpeech(manualInputText.trim(), true);
              setManualInputText('');
            }
          }} 
          className="pt-2 border-t border-gray-700/60 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input
            type="text"
            value={manualInputText}
            onChange={(e) => setManualInputText(e.target.value)}
            placeholder={lang === 'hi' ? "बोलें या लिखें: 50 क्विंटल गेहूं 2275 रुपये" : "Type/speak: 50 quintal Wheat 2275..."}
            className="flex-1 px-3 py-2 bg-black/40 border border-gray-600 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#9fd700]"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <span>{lang === 'hi' ? "मैजिक भरें" : "Magic Fill"}</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Universal Voice Companion Modal CTA */}
        <div className="pt-2 border-t border-gray-700/60 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#9fd70020] border border-[#9fd70040] text-[#9fd700] hover:bg-[#9fd70030] transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "🎙️ संपूर्ण AI वॉयस सहायक खोलें" : "🎙️ Open Universal Voice Companion"}</span>
          </button>
        </div>

        {spokenTranscript && (
          <div className="bg-[#323922] rounded-2xl p-3 text-xs text-white border border-[#9fd70040]">
            <span className="text-[10px] uppercase font-bold text-[#9fd700] block mb-1">
              {lang === 'hi' ? "लाइव रिकॉर्ड की गई आवाज़:" : "Live Audio Captured:"}
            </span>
            <p className="italic font-medium">"{spokenTranscript}"</p>
          </div>
        )}
      </div>

      {/* AI AUTO-FILL NOTICE & EDITABLE GUIDE */}
      {aiParsedNotice && (
        <div className="bg-[#ecfccb] border border-[#9fd700] rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-pop-in">
          <div className="p-1.5 bg-[#9fd700] rounded-xl text-[#272c1a] shrink-0 mt-0.5">
            <Edit3 className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <span className="font-extrabold text-[#272c1a] block text-sm">
              ✨ {lang === 'hi' ? "AI ने आपकी आवाज़ से फॉर्म भर दिया है" : "AI Auto-Filled From Your Voice"}
            </span>
            <p className="text-[#3d5500] font-semibold mt-0.5">
              {lang === 'hi' 
                ? "आप नीचे किसी भी विवरण (फसल, मात्रा, भाव या संपर्क) को अपनी जरूरत के अनुसार बदल सकते हैं।"
                : "You can freely edit or adjust any details below (Crop, Quantity, Price, or Contact) before publishing."}
            </p>
          </div>
        </div>
      )}

      {/* Structured Zero-Typing / Easily Editable Form */}
      <form onSubmit={handlePublishListing} className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft space-y-5 sm:space-y-6">
        {/* 1. Crop Selection (Visual Chips) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-[#446158] tracking-wider block">
              {lang === 'hi' ? "1. अपनी फसल चुनें:" : "1. Select Crop:"}
            </label>
            <span className="text-xs font-bold text-[#3d5500] bg-[#9fd70025] px-2.5 py-0.5 rounded-full">
              {lang === 'hi' ? cropHindi : crop}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_CROPS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCropPreset(c)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left flex items-center gap-2 sm:gap-2.5 transition-all cursor-pointer interactive-tap ${
                  crop.toLowerCase() === c.id.toLowerCase()
                    ? 'bg-[#ecfccb] border-[#9fd700] text-[#272c1a] font-extrabold ring-2 ring-[#9fd700]'
                    : 'bg-[#fffeef] border-[#44615820] text-[#446158] hover:bg-white'
                }`}
              >
                <span className="text-xl sm:text-2xl">{c.icon}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold leading-tight block truncate">
                    {lang === 'hi' ? c.hindi : c.name}
                  </span>
                  <span className="text-[10px] text-[#446158] block truncate">
                    {lang === 'hi' ? c.name : c.hindi}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Quantity & Presets with +/- Step Buttons */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-[#446158] tracking-wider">
              {lang === 'hi' 
                ? `2. फसल की मात्रा (${unit === 'Quintal' ? 'क्विंटल' : unit}):` 
                : `2. Quantity (${unit}):`}
            </label>
            <span className="text-xl font-black text-[#272c1a]">
              {quantity} {lang === 'hi' && unit === 'Quintal' ? 'क्विंटल' : unit}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, Number(q) - 10))}
              className="px-2.5 sm:px-3 py-2.5 sm:py-3 bg-[#fffeef] hover:bg-[#9fd70020] border border-[#44615830] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-[#272c1a] shrink-0 interactive-tap cursor-pointer"
              title="-10"
            >
              -10
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1 min-w-0 p-2.5 sm:p-3 bg-[#fffeef] border border-[#44615830] rounded-xl sm:rounded-2xl text-sm sm:text-base font-black text-[#272c1a] focus:ring-2 focus:ring-[#9fd700] outline-none text-center"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => Number(q) + 10)}
              className="px-2.5 sm:px-3 py-2.5 sm:py-3 bg-[#fffeef] hover:bg-[#9fd70020] border border-[#44615830] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-[#272c1a] shrink-0 interactive-tap cursor-pointer"
              title="+10"
            >
              +10
            </button>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="p-2.5 sm:p-3 bg-[#fffeef] border border-[#44615830] rounded-xl sm:rounded-2xl text-xs font-bold text-[#272c1a] focus:ring-2 focus:ring-[#9fd700] outline-none cursor-pointer shrink-0"
            >
              <option value="Quintal">{lang === 'hi' ? "क्विंटल" : "Quintals"}</option>
              <option value="kg">{lang === 'hi' ? "किलोग्राम" : "Kilograms"}</option>
              <option value="Bags">{lang === 'hi' ? "बोरी / बैग" : "Bags (बोरी)"}</option>
            </select>
          </div>

          {/* Quick Quantity Presets */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            <span className="text-[10px] font-bold text-[#446158] uppercase">
              {lang === 'hi' ? "त्वरित चयन:" : "Quick:"}
            </span>
            {QUANTITY_PRESETS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer interactive-tap shrink-0 ${
                  Number(quantity) === q
                    ? 'bg-[#272c1a] text-white border-[#272c1a]'
                    : 'bg-[#fffeef] text-[#446158] border-[#44615820] hover:bg-white'
                }`}
              >
                {q} {lang === 'hi' && unit === 'Quintal' ? 'क्विंटल' : unit}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Expected Price with +/- ₹50 Step Buttons */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-[#446158] tracking-wider">
              {lang === 'hi' 
                ? `3. अपेक्षित भाव (प्रति ${unit === 'Quintal' ? 'क्विंटल' : unit}):` 
                : `3. Expected Price (₹ per ${unit}):`}
            </label>
            <span className="text-xl font-black text-[#3d5500]">₹{price}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPrice((p) => Math.max(100, Number(p) - 50))}
              className="px-2.5 sm:px-3.5 py-2.5 sm:py-3 bg-[#fffeef] hover:bg-[#9fd70020] border border-[#44615830] rounded-xl sm:rounded-2xl text-xs font-black text-[#272c1a] shrink-0 interactive-tap cursor-pointer"
            >
              -₹50
            </button>
            <input
              type="number"
              min="100"
              step="10"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full p-2.5 sm:p-3 bg-[#fffeef] border border-[#44615830] rounded-xl sm:rounded-2xl text-sm sm:text-base font-black text-[#272c1a] focus:ring-2 focus:ring-[#9fd700] outline-none text-center"
            />
            <button
              type="button"
              onClick={() => setPrice((p) => Number(p) + 50)}
              className="px-2.5 sm:px-3.5 py-2.5 sm:py-3 bg-[#fffeef] hover:bg-[#9fd70020] border border-[#44615830] rounded-xl sm:rounded-2xl text-xs font-black text-[#272c1a] shrink-0 interactive-tap cursor-pointer"
            >
              +₹50
            </button>
          </div>
        </div>

        {/* 4. Editable Contact & Location Details */}
        <div className="pt-2 border-t border-[#44615820] space-y-3">
          <label className="text-xs font-black uppercase text-[#446158] tracking-wider block">
            {lang === 'hi' ? "4. संपर्क एवं मंडी स्थान:" : "4. Seller & Mandi Location:"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#446158] absolute left-3 top-3" />
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder={lang === 'hi' ? "किसान का नाम" : "Seller Name"}
                className="w-full pl-8 pr-3 py-2.5 bg-[#fffeef] border border-[#44615830] rounded-xl text-xs font-bold text-[#272c1a] outline-none focus:ring-2 focus:ring-[#9fd700]"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#446158] absolute left-3 top-3" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={lang === 'hi' ? "मोबाइल नंबर" : "Phone Number"}
                className="w-full pl-8 pr-3 py-2.5 bg-[#fffeef] border border-[#44615830] rounded-xl text-xs font-bold text-[#272c1a] outline-none focus:ring-2 focus:ring-[#9fd700]"
              />
            </div>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#446158] absolute left-3 top-3" />
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={lang === 'hi' ? "मंडी स्थान" : "Mandi Location"}
                className="w-full pl-8 pr-3 py-2.5 bg-[#fffeef] border border-[#44615830] rounded-xl text-xs font-bold text-[#272c1a] outline-none focus:ring-2 focus:ring-[#9fd700]"
              />
            </div>
          </div>
        </div>

        {/* Cryptographic Trust Notice */}
        <div className="p-3.5 bg-[#9fd70015] border border-[#9fd70050] rounded-2xl flex items-center gap-2.5 text-xs text-[#2d4000]">
          <ShieldCheck className="w-5 h-5 text-[#3d5500] shrink-0" />
          <span>
            {lang === 'hi' 
              ? "प्रत्येक लिस्टिंग आपके किसान सुरक्षा कोड (वेब क्रिप्टो एपीआई) द्वारा प्रमाणित है, जो प्रामाणिकता और उचित भाव सुनिश्चित करती है।" 
              : "Every listing is cryptographically signed with your farmer key (Web Crypto API) to certify authenticity and fair price."}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-lime py-4 text-base font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer interactive-tap"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>
            {isSubmitting 
              ? (lang === 'hi' ? "सुरक्षा कोड से प्रमाणित हो रहा है..." : "Cryptographically Signing...") 
              : (lang === 'hi' ? "प्रमाणित फसल लिस्टिंग लाइव करें" : "Publish Verified Listing")}
          </span>
        </button>
      </form>

      {/* Success Modal with View and Reset Options */}
      {successPayload && (
        <div className="fixed inset-0 z-50 bg-[#272c1a]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-[#44615820] shadow-elevated text-center space-y-4 animate-pop-in">
            <div className="w-16 h-16 rounded-full bg-[#9fd70030] text-[#3d5500] flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h3 className="text-2xl font-black text-[#272c1a]">
              {lang === 'hi' ? "फसल लिस्टिंग सत्यापित एवं लाइव हुई!" : "Listing Verified & Posted!"}
            </h3>

            <p className="text-xs text-[#446158]">
              {lang === 'hi' 
                ? "आपकी फसल का विवरण क्षेत्रीय मंडियों के सत्यापित थोक खरीदारों के लिए लाइव हो चुका है।" 
                : "Your crop offer is now live for verified wholesale buyers across regional mandis."}
            </p>

            <div className="bg-[#fffeef] p-4 rounded-2xl border border-[#44615820] text-left text-xs space-y-1 font-mono">
              <p><strong>{lang === 'hi' ? "फसल:" : "Crop:"}</strong> {lang === 'hi' ? successPayload.cropHindi : successPayload.crop}</p>
              <p><strong>{lang === 'hi' ? "मात्रा:" : "Quantity:"}</strong> {successPayload.quantity} {lang === 'hi' && successPayload.unit === 'Quintal' ? 'क्विंटल' : successPayload.unit}</p>
              <p><strong>{lang === 'hi' ? "भाव:" : "Price:"}</strong> ₹{successPayload.price} /{lang === 'hi' && successPayload.unit === 'Quintal' ? 'क्विंटल' : successPayload.unit}</p>
              <p><strong>{lang === 'hi' ? "किसान / मंडी:" : "Seller:"}</strong> {successPayload.sellerName} ({successPayload.location})</p>
              <p className="break-all text-[10px] text-[#446158] pt-1">
                <strong>{lang === 'hi' ? "क्रिप्टोग्राफिक सुरक्षा कोड:" : "SHA-256 Digest:"}</strong> {successPayload.hash}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full btn-lime py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer interactive-tap"
              >
                <span>{lang === 'hi' ? "सीधा बाजार में देखें" : "View in Marketplace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetForm}
                className="w-full py-2.5 bg-[#fffeef] hover:bg-gray-100 text-[#446158] font-bold text-xs rounded-xl border border-[#44615820] flex items-center justify-center gap-1.5 cursor-pointer interactive-tap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? "+ एक और नई लिस्टिंग बनाएं" : "+ Create Another Listing"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isVoiceAssistantOpen && (
        <VoiceAssistantModal onClose={() => setIsVoiceAssistantOpen(false)} />
      )}
    </div>
  );
}
