import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Send, 
  Radio, 
  Plus, 
  Minus, 
  TrendingUp, 
  CloudSun, 
  Camera, 
  Warehouse, 
  PhoneCall, 
  ShoppingBag,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { 
  createSpeechRecognizer, 
  speakText, 
  requestMicrophoneAccess, 
  stopSpeech,
  createAudioLevelMeter,
  getSupportedAudioMimeType
} from '../../services/speechService';
import { parseCropSpeech } from '../../services/voiceParser';
import { processOfflineQuery } from '../../services/offlinePatternEngine';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const PRESET_CROPS = [
  { id: 'Wheat', name: 'Wheat', hindi: 'गेहूं', icon: '🌾', price: 2275 },
  { id: 'Tomato', name: 'Tomato', hindi: 'टमाटर', icon: '🍅', price: 1800 },
  { id: 'Paddy', name: 'Paddy', hindi: 'धान', icon: '🍚', price: 3100 },
  { id: 'Potato', name: 'Potato', hindi: 'आलू', icon: '🥔', price: 1250 },
  { id: 'Mustard', name: 'Mustard', hindi: 'सरसों', icon: '🌻', price: 5450 },
  { id: 'Onion', name: 'Onion', hindi: 'प्याज़', icon: '🧅', price: 1650 },
  { id: 'Cotton', name: 'Cotton', hindi: 'कपास', icon: '☁️', price: 6800 },
  { id: 'Maize', name: 'Maize', hindi: 'मक्का', icon: '🌽', price: 2050 }
];

export default function VoiceAssistantModal({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Full Conversational Assistant State
  const [aiResult, setAiResult] = useState(null);

  // Editable Form Fields (when AI parses a listing or edit is needed)
  const [editCrop, setEditCrop] = useState('Wheat');
  const [editCropHindi, setEditCropHindi] = useState('गेहूं');
  const [editQuantity, setEditQuantity] = useState(50);
  const [editUnit, setEditUnit] = useState('Quintal');
  const [editPrice, setEditPrice] = useState(2275);

  const recognizerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const levelMeterRef = useRef(null);
  const transcriptRef = useRef('');

  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const sampleVoicePrompts = [
    { text: "50 quintal Gehu 2275 rupaye me bechna hai", label: "🌾 फसल बेचें: 50 क्विंटल गेहूं ₹2,275", intent: "SELL_CROP" },
    { text: "Tamatar ka aaj ka mandi bhav kya hai?", label: "📈 लाइव मंडी भाव: आज टमाटर का क्या भाव है?", intent: "MANDI_PRICE" },
    { text: "Patanjali ya McCain ka khareed order kya hai?", label: "🤝 थोक खरीदार: पतंजलि व खरीदार मांग", intent: "BUYER_DEMAND" },
    { text: "Aaj ka mausam aur keetnashak spray kaisa rahega?", label: "⛅ लाइव मौसम: क्या आज कीटनाशक स्प्रे करें?", intent: "WEATHER" },
    { text: "Aalu rakhne ke liye cold storage me kitni jagah khali hai?", label: "🏬 कोल्ड स्टोरेज: 320 MT खाली जगह व रेट", intent: "COLD_STORAGE" },
    { text: "Pattiyo par rog laga hai kisan doctor dikhao", label: "🩺 फसल डॉक्टर: रोग जांच और उपचार", intent: "CROP_DISEASE" }
  ];

  useEffect(() => {
    return () => {
      cleanupAudioSession();
      stopSpeech();
    };
  }, []);

  const cleanupAudioSession = () => {
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) {
      try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      streamRef.current = null;
    }
    setIsListening(false);
    setAudioVolume(0);
  };

  const startListening = async () => {
    stopSpeech();
    cleanupAudioSession();
    setStatusMessage('');
    setTranscript('');
    transcriptRef.current = '';
    setAiResult(null);
    setRecordingSeconds(0);
    setAudioVolume(0);
    audioChunksRef.current = [];

    // Step 1: Explicitly request microphone stream
    let stream = null;
    try {
      stream = await requestMicrophoneAccess();
      streamRef.current = stream;
    } catch (err) {
      console.warn('Microphone permission blocked:', err);
      setStatusMessage('Microphone access denied. Please allow microphone permissions or tap any question below.');
      return;
    }

    setIsListening(true);

    // Step 2: Initialize Web Audio volume meter with AUTOMATIC SILENCE DETECTION
    try {
      const meter = createAudioLevelMeter(
        stream, 
        (vol) => setAudioVolume(vol),
        () => {
          // AI STOPS ITSELF ON SILENCE
          stopListening();
        }
      );
      levelMeterRef.current = meter;
    } catch (e) {
      console.warn('Level meter error:', e);
    }

    // Step 3: MediaRecorder with cross-browser MIME format
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
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        await processRecordedAudio(audioBlob, mimeType);
      };

      recorder.start(250);
    } catch (recorderErr) {
      console.warn('MediaRecorder init error:', recorderErr);
    }

    // Maximum safe auto-cutoff timer (7 seconds)
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 6) {
          stopListening();
          return 6;
        }
        return prev + 1;
      });
    }, 1000);

    // Step 4: Parallel WebSpeech (live preview in browsers that support it)
    const recognizer = createSpeechRecognizer(
      (liveText) => {
        if (liveText) {
          setTranscript(liveText);
          transcriptRef.current = liveText;
        }
      },
      (err) => {},
      () => {},
      lang === 'hi' ? 'hi-IN' : 'en-IN'
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try { recognizer.start(); } catch (e) {}
    }
  };

  const stopListening = () => {
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
    }
  };

  const processRecordedAudio = async (audioBlob, mimeType) => {
    const currentTranscript = (transcriptRef.current || transcript || '').trim();
    setIsProcessingAI(true);

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // CRITICAL REQUIREMENT: Active cloud AI requires internet; when offline, state that it doesn't work offline and run offline pattern engine
    if (!isOnline) {
      console.log('[Voice AI] Offline detected: Active Cloud AI requires internet. Running offline pattern engine.');
      const queryText = currentTranscript || (lang === 'hi' ? 'गेहूं बेचना है' : 'sell wheat');
      const offlineResult = processOfflineQuery(queryText, window.location.pathname);
      handleAiResponse({
        ...offlineResult,
        cloudAiStatus: 'OFFLINE',
        offlineNotice: lang === 'hi'
          ? '⚡ सक्रिय क्लाउड एआई केवल ऑनलाइन काम करता है। ऑफ़लाइन पैटर्न इंजन द्वारा उत्तर दिया गया।'
          : '⚡ Active Cloud AI works only online. Answered via offline pattern engine.'
      });
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
                mimeType: mimeType || 'audio/webm',
                textInput: currentTranscript,
                currentRoute: window.location.pathname
              })
            });
            const json = await res.json();
            if (json && json.data) {
              handleAiResponse(json.data);
              return;
            }
          } catch (apiErr) {
            console.warn('Voice API error, using offline pattern fallback:', apiErr);
          }

          if (currentTranscript) {
            executeTextAnalysis(currentTranscript);
          } else {
            const fallbackRes = processOfflineQuery('namaste', window.location.pathname);
            handleAiResponse(fallbackRes);
          }
        };
      } catch (err) {
        setIsProcessingAI(false);
        if (currentTranscript) executeTextAnalysis(currentTranscript);
      }
    } else if (currentTranscript) {
      executeTextAnalysis(currentTranscript);
    } else {
      setIsProcessingAI(false);
      handleAiResponse({
        transcript: lang === 'hi' ? 'माइक से आवाज़ नहीं आई' : 'No speech detected',
        intent: 'GENERAL',
        spokenResponse: lang === 'hi' 
          ? 'कृपया थोड़ा तेज बोलें या नीचे दिए गए किसी भी प्रश्न पर टैप करें।' 
          : 'Please speak louder or tap any question below.',
        action: { route: '/mandi', label: lang === 'hi' ? 'मंडी भाव देखें' : 'View Mandi Prices' },
        crop: 'Wheat',
        cropHindi: 'गेहूं',
        quantity: 50,
        unit: 'Quintal',
        price: 2275
      });
    }
  };

  const executeTextAnalysis = async (inputText) => {
    if (!inputText || !inputText.trim()) return;
    const cleanText = inputText.trim();
    setIsProcessingAI(true);
    setTranscript(cleanText);
    transcriptRef.current = cleanText;

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // CRITICAL REQUIREMENT: Active cloud AI requires internet; when offline, explicitly declare offline and run offline pattern engine
    if (!isOnline) {
      console.log('[Text AI] Offline detected: Active Cloud AI works only online. Running offline pattern engine.');
      const offlineResult = processOfflineQuery(cleanText, window.location.pathname);
      handleAiResponse({
        ...offlineResult,
        cloudAiStatus: 'OFFLINE',
        offlineNotice: lang === 'hi'
          ? '⚡ सक्रिय क्लाउड एआई केवल ऑनलाइन काम करता है। ऑफ़लाइन पैटर्न इंजन द्वारा समझा गया।'
          : '⚡ Active Cloud AI works only online. Processed locally via pattern engine.'
      });
      return;
    }

    try {
      const res = await fetch('/api/voice/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          textInput: cleanText,
          currentRoute: window.location.pathname
        })
      });
      const json = await res.json();
      if (json && json.data) {
        handleAiResponse(json.data);
        return;
      }
    } catch (err) {
      console.warn('Analysis error, falling back to offline pattern engine:', err);
    }

    // Instant Client-side Offline Pattern fallback so AI ALWAYS actively works
    const offlineResult = processOfflineQuery(cleanText, window.location.pathname);
    handleAiResponse(offlineResult);
  };

  const handleAiResponse = (data) => {
    setIsProcessingAI(false);
    setIsListening(false);
    setAiResult(data);
    if (data.transcript) {
      setTranscript(data.transcript);
      transcriptRef.current = data.transcript;
    }

    // If crop listing fields returned, seed editable form
    if (data.crop) setEditCrop(data.crop);
    if (data.cropHindi) setEditCropHindi(data.cropHindi);
    if (data.quantity) setEditQuantity(data.quantity);
    if (data.unit) setEditUnit(data.unit);
    if (data.price) setEditPrice(data.price);

    // Speak AI response out loud (ensuring clean single crop name)
    const voiceLine = data.spokenResponse || `${data.quantity || 50} ${data.unit || 'Quintal'} ${data.cropHindi || data.crop}, भाव ₹${data.price || 2275}`;
    speakText(voiceLine, lang === 'hi' ? 'hi-IN' : 'en-IN');
  };

  const handleCropSelect = (c) => {
    setEditCrop(c.id);
    setEditCropHindi(c.hindi);
    setEditPrice(c.price);
  };

  const handleNavigateAction = (targetRoute) => {
    onClose();
    // Normalize targetRoute
    let route = targetRoute || '/';
    if (route.includes('mandi') || route.includes('weather') || route.includes('mausam')) route = '/mandi';
    else if (route.includes('scan') || route.includes('doctor')) route = '/scanner';
    else if (route.includes('stor')) route = '/storage';
    else if (route.includes('expert')) route = '/experts';
    else if (route.includes('market')) route = '/marketplace';
    else if (route.includes('sell')) {
      navigate('/sell', {
        state: {
          prefill: {
            crop: editCrop,
            cropHindi: editCropHindi,
            quantity: editQuantity,
            unit: editUnit,
            price: editPrice,
            rawTranscript: transcript
          }
        }
      });
      return;
    }
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#272c1a]/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#fffeef] border border-[#44615830] rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-7 shadow-elevated relative my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[96vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#44615820] flex items-center justify-center text-[#446158] hover:text-[#272c1a] hover:bg-[#fffeef] transition-colors"
          title="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-3 sm:mb-4 pr-6 pl-6 sm:px-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9fd70030] text-[#3d5500] text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3d5500]" />
            <span>KisanLink AI • Universal Voice Companion</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-[#272c1a]">
            {lang === 'hi' ? "किसानलिंक से कुछ भी पूछें" : "Ask KisanLink Anything"}
          </h3>
          <p className="text-xs text-[#446158] mt-1 max-w-sm mx-auto">
            {lang === 'hi' 
              ? "फसल बेचना, मंडी भाव, मौसम, फसल रोग डॉक्टर या कोल्ड स्टोरेज — बोलिए, AI खुद सुनकर जवाब देगा।" 
              : "Speak naturally. AI automatically stops on silence and responds."}
          </p>
        </div>

        {/* Offline Guard Banner: Active Cloud AI requires internet */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                {lang === 'hi' 
                  ? "⚡ ऑफ़लाइन मोड: सक्रिय क्लाउड एआई केवल ऑनलाइन काम करता है। ऑफ़लाइन पैटर्न सहायक चालू है।" 
                  : "⚡ Offline Mode: Active Cloud AI works only online. Offline pattern assistant is active."}
              </span>
            </div>
          </div>
        )}

        {/* Animated Central Mic / Recorder Button */}
        <div className="flex flex-col items-center justify-center my-2 sm:my-4">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200 scale-105'
                : 'bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] hover:scale-105 active:scale-95 ring-8 ring-[#9fd70030]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-0.5 sm:mt-1">
                  0:0{recordingSeconds} • Stop
                </span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 sm:w-12 sm:h-12 stroke-[2.2]" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 sm:mt-1">
                  {lang === 'hi' ? "बोलें" : "Tap to Speak"}
                </span>
              </>
            )}
          </button>

          {/* Real-Time Audio Level & Hearing Indicator with Silence Notice */}
          {isListening && (
            <div className="mt-4 w-full max-w-xs space-y-2">
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[0.4, 0.8, 1.2, 0.7, 0.5].map((multiplier, i) => {
                  const barHeight = Math.max(8, Math.min(32, (audioVolume * multiplier) + 6));
                  return (
                    <div
                      key={i}
                      className="w-2 rounded-full transition-all duration-75"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: audioVolume > 6 ? '#84cc16' : '#9ca3af'
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-center">
                {audioVolume > 6 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>🟢 {lang === 'hi' ? "आवाज़ आ रही है (चुप होने पर AI खुद रुकेगा)" : `Hearing you: ${audioVolume}% (Auto-stops on silence)`}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Radio className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>🟡 {lang === 'hi' ? "माइक तैयार है... बोलिए" : "Mic ready... speak your question"}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={stopListening}
                className="w-full mt-2 py-2 px-4 rounded-xl bg-[#272c1a] text-white font-extrabold text-xs shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'hi' ? "✓ पूरा हुआ (विश्लेषण करें)" : "✓ Done Speaking (Analyze Now)"}</span>
              </button>
            </div>
          )}

          {!isListening && (
            <p className="mt-2.5 text-xs sm:text-sm font-bold text-[#272c1a] text-center">
              {lang === 'hi' ? "माइक दबाकर बोलें (चुप होने पर AI खुद जवाब देगा)" : "Tap mic to speak (AI stops automatically when you pause)"}
            </p>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessingAI && (
          <div className="p-3 bg-[#9fd70025] border border-[#9fd70060] rounded-2xl text-xs text-[#272c1a] font-bold flex items-center justify-center gap-2 mb-3">
            <div className="w-4 h-4 border-2 border-[#272c1a] border-t-transparent rounded-full animate-spin" />
            <span>{lang === 'hi' ? "AI विश्लेषण कर रहा है..." : "Gemini AI Analyzing & Formulating Response..."}</span>
          </div>
        )}

        {/* Live Spoken Transcript */}
        {transcript && (
          <div className="bg-white rounded-2xl p-3.5 border border-[#44615820] shadow-sm mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#446158] uppercase tracking-wider">
                {lang === 'hi' ? "आपने कहा:" : "You Spoke:"}
              </span>
              <button
                type="button"
                onClick={() => speakText(transcript, lang === 'hi' ? 'hi-IN' : 'en-IN')}
                className="text-[#446158] hover:text-[#272c1a] flex items-center gap-1 text-xs font-bold"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#3d5500]" />
                <span>Play</span>
              </button>
            </div>
            <p className="text-sm font-bold text-[#272c1a] italic">"{transcript}"</p>
          </div>
        )}

        {/* AI Response Card (Conversational Answer & Actions) */}
        {aiResult && (
          <div className="bg-[#272c1a] text-white rounded-2xl p-4 shadow-elevated mb-4 animate-in fade-in space-y-3">
            {/* Spoken Response Header */}
            <div className="flex items-start justify-between gap-2 border-b border-gray-700/70 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#9fd70025] text-[#9fd700]">
                  {aiResult.intent === 'MANDI_PRICE' && <TrendingUp className="w-4 h-4" />}
                  {aiResult.intent === 'WEATHER' && <CloudSun className="w-4 h-4" />}
                  {aiResult.intent === 'BUYER_DEMAND' && <ShoppingBag className="w-4 h-4" />}
                  {aiResult.intent === 'CROP_DISEASE' && <Camera className="w-4 h-4" />}
                  {aiResult.intent === 'COLD_STORAGE' && <Warehouse className="w-4 h-4" />}
                  {aiResult.intent === 'EXPERT' && <PhoneCall className="w-4 h-4" />}
                  {aiResult.intent === 'MARKETPLACE' && <ShoppingBag className="w-4 h-4" />}
                  {(!aiResult.intent || aiResult.intent === 'SELL_CROP' || aiResult.intent === 'GENERAL') && <Sparkles className="w-4 h-4" />}
                </span>
                <span className="text-xs font-bold text-[#9fd700] uppercase tracking-wider">
                  KisanLink Voice AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => speakText(aiResult.spokenResponse, lang === 'hi' ? 'hi-IN' : 'en-IN')}
                className="text-[#9fd700] hover:text-white flex items-center gap-1 text-xs font-bold"
              >
                <Volume2 className="w-4 h-4" />
                <span>Re-listen</span>
              </button>
            </div>

            {/* Conversational Text Response */}
            <p className="text-sm font-semibold text-gray-100 leading-relaxed">
              {aiResult.spokenResponse}
            </p>

            {/* Offline Engine Badge */}
            {(aiResult.isOfflineProcessed || aiResult.offlineNotice) && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <span>{aiResult.offlineNotice || (lang === 'hi' ? "⚡ ऑफ़लाइन पैटर्न समझ (बिना इंटरनेट)" : "⚡ Offline Pattern Match (No Internet)")}</span>
              </div>
            )}

            {/* EDITABLE FORM PREVIEW (If Selling or Listing) */}
            {aiResult.intent === 'SELL_CROP' && (
              <div className="bg-[#1b2011] p-3.5 rounded-xl border border-[#9fd70040] space-y-3 mt-2">
                <div className="flex items-center justify-between text-xs text-[#9fd700] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editable Form Details (जरूरत अनुसार बदलें):</span>
                  </span>
                </div>

                {/* 1. Crop Selection Chips */}
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESET_CROPS.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCropSelect(c)}
                      className={`p-1.5 rounded-lg border text-center text-[11px] font-bold transition-all cursor-pointer ${
                        editCrop === c.id
                          ? 'bg-[#9fd700] text-[#272c1a] border-[#9fd700]'
                          : 'bg-[#272c1a] text-gray-300 border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span>{c.icon} {c.hindi}</span>
                    </button>
                  ))}
                </div>

                {/* 2. Quantity & Unit Controls */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">मात्रा (Quantity):</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditQuantity((q) => Math.max(1, Number(q) - 10))}
                        className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-full text-center py-1 bg-black/40 border border-gray-600 rounded-lg text-white font-extrabold text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setEditQuantity((q) => Number(q) + 10)}
                        className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">इकाई (Unit):</span>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full py-1.5 px-2 bg-black/40 border border-gray-600 rounded-lg text-white font-bold text-xs"
                    >
                      <option value="Quintal">Quintal (क्विंटल)</option>
                      <option value="kg">kg (किलो)</option>
                      <option value="Bags">Bags (बोरी)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Price Control */}
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">भाव (Price ₹ per {editUnit}):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditPrice((p) => Math.max(100, Number(p) - 50))}
                      className="px-2.5 py-1 rounded-lg bg-gray-700 text-white font-bold text-xs"
                    >
                      -50
                    </button>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="flex-1 text-center py-1 bg-black/40 border border-gray-600 rounded-lg text-white font-extrabold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setEditPrice((p) => Number(p) + 50)}
                      className="px-2.5 py-1 rounded-lg bg-gray-700 text-white font-bold text-xs"
                    >
                      +50
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Navigation Button */}
            <button
              type="button"
              onClick={() => handleNavigateAction(aiResult.action?.route || (aiResult.intent === 'SELL_CROP' ? '/sell' : '/'))}
              className="w-full bg-[#9fd700] hover:bg-[#8cb800] text-[#272c1a] font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md text-xs sm:text-sm mt-2"
            >
              <span>{aiResult.action?.label || (lang === 'hi' ? "पुष्टि करें व आगे बढ़ें" : "Proceed & Review")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Question / Action Chips */}
        <div className="pt-2.5 border-t border-[#44615820]">
          <p className="text-[11px] font-bold text-[#446158] mb-2 uppercase tracking-wide">
            {lang === 'hi' ? "या तुरंत पूछें (1-Tap Test):" : "Or Tap Any Common Farmer Query:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleVoicePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => executeTextAnalysis(p.text)}
                className="text-xs font-bold bg-white border border-[#44615825] hover:border-[#9fd700] hover:bg-[#9fd70015] text-[#272c1a] p-2.5 rounded-xl transition-all text-left flex items-center justify-between group"
              >
                <span>{p.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#446158] group-hover:text-[#3d5500]" />
              </button>
            ))}
          </div>
        </div>

        {/* Natural Language Fallback Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (manualText.trim()) executeTextAnalysis(manualText.trim());
          }} 
          className="mt-3.5 pt-2.5 border-t border-[#44615820]"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={lang === 'hi' ? "कुछ भी पूछें या लिखें..." : "Ask prices, weather, doctor, storage..."}
              className="flex-1 px-3 py-2 bg-white border border-[#44615830] rounded-xl text-xs font-semibold text-[#272c1a] outline-none focus:ring-2 focus:ring-[#9fd700]"
            />
            <button
              type="submit"
              className="btn-lime text-xs font-bold py-2 px-3 shrink-0 flex items-center gap-1"
            >
              <span>Ask</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
