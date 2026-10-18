import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Volume2, 
  ShieldCheck, 
  PhoneCall, 
  ArrowLeft,
  Image as ImageIcon,
  Check,
  Eye,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { compressImage, analyzeCropWithGemini, LOCAL_VISION_MODELS_METADATA } from '../services/geminiVision';
import { dbPut, dbGetAll, queueOfflineAction } from '../services/db';
import { useNetwork } from '../context/NetworkContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import DiagnosticCard from '../components/scanner/DiagnosticCard';
import { useNavigate } from 'react-router-dom';

export default function CropScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [history, setHistory] = useState([]);
  const [showModelInfo, setShowModelInfo] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const { isOnline } = useNetwork();
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load diagnostic history from IndexedDB
  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await dbGetAll('scans');
        if (stored) setHistory(stored.reverse());
      } catch (e) {
        console.warn('Failed to load history', e);
      }
    }
    loadHistory();
  }, [currentResult]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    setCurrentResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setErrorMsg(
        lang === 'hi' 
          ? 'कैमरा उपलब्ध नहीं है। कृपया अपनी गैलरी से तस्वीर अपलोड करें या नीचे दिए गए नमूनों को चुनें।'
          : 'Camera is unavailable. Please upload a photo from your gallery or choose a sample below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setPreviewUrl(dataUrl);
    runAnalysis(dataUrl);
  };

  const processUploadFile = async (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'hi' 
          ? 'कृपया केवल छवि फ़ाइल (JPG, PNG, WebP) अपलोड करें।' 
          : 'Please upload a valid image file (JPG, PNG, WebP).'
      );
      return;
    }

    setErrorMsg(null);
    stopCamera();
    try {
      const compressed = await compressImage(file, 1024, 0.85);
      setPreviewUrl(compressed.dataUrl);
      runAnalysis(compressed.dataUrl);
    } catch (err) {
      console.warn('Image processing failed:', err);
      setErrorMsg(
        lang === 'hi'
          ? 'छवि लोड करने में त्रुटि हुई। कृपया दूसरी तस्वीर चुनें।'
          : 'Failed to process image. Please try another.'
      );
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadFile(file);
    }
    // Reset file input so re-selecting same file triggers change
    if (e.target) e.target.value = '';
  };

  // Generate realistic agricultural leaf specimen canvas for instant demo testing
  const generateRealisticLeafDataUrl = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    // Soil/field background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 640, 480);
    bgGrad.addColorStop(0, '#1c2214');
    bgGrad.addColorStop(1, '#2c3322');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Draw main leaf body with organic curve
    ctx.save();
    ctx.translate(320, 240);
    ctx.rotate(0.1);

    ctx.beginPath();
    ctx.moveTo(0, -180);
    ctx.bezierCurveTo(150, -120, 180, 80, 0, 190);
    ctx.bezierCurveTo(-180, 80, -150, -120, 0, -180);
    ctx.closePath();

    const leafGrad = ctx.createLinearGradient(-100, -150, 100, 150);
    if (type === 'healthy') {
      leafGrad.addColorStop(0, '#70a400');
      leafGrad.addColorStop(0.5, '#4e7b00');
      leafGrad.addColorStop(1, '#345200');
    } else if (type === 'wheat') {
      leafGrad.addColorStop(0, '#a3b832');
      leafGrad.addColorStop(0.5, '#7b8f22');
      leafGrad.addColorStop(1, '#566614');
    } else if (type === 'tomato') {
      leafGrad.addColorStop(0, '#668032');
      leafGrad.addColorStop(0.5, '#495e20');
      leafGrad.addColorStop(1, '#304014');
    } else {
      leafGrad.addColorStop(0, '#556633');
      leafGrad.addColorStop(0.5, '#3b4720');
      leafGrad.addColorStop(1, '#273013');
    }

    ctx.fillStyle = leafGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#273311';
    ctx.stroke();

    // Central leaf vein (midrib)
    ctx.beginPath();
    ctx.moveTo(0, -170);
    ctx.quadraticCurveTo(5, 0, 0, 185);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#90b830';
    ctx.stroke();

    // Lateral veins
    for (let y = -120; y < 140; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(50, y - 10, 110, y - 25);
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(-50, y - 10, -110, y - 25);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#85a82860';
      ctx.stroke();
    }

    // Pathogen Symptoms Overlay
    if (type === 'tomato') {
      // Early Blight: Dark concentric target rings with yellow chlorotic halos
      const spots = [
        { x: -40, y: -40, r: 28 },
        { x: 50, y: 30, r: 24 },
        { x: -20, y: 80, r: 20 },
        { x: 30, y: -90, r: 18 }
      ];

      spots.forEach((sp) => {
        // Chlorotic yellow halo
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r + 12, 0, Math.PI * 2);
        ctx.fillStyle = '#eab30845';
        ctx.fill();

        // Dark brown target rings
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = '#261b0c';
        ctx.fill();

        // Inner rings
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = '#4a371c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#110c05';
        ctx.fill();
      });
    } else if (type === 'wheat') {
      // Yellow Stripe Rust: Linear yellow-orange powdery pustules along veins
      ctx.fillStyle = '#f59e0b';
      for (let x of [-45, -20, 25, 55]) {
        for (let y = -130; y < 130; y += 14) {
          ctx.beginPath();
          ctx.ellipse(x, y, 3, 7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'potato') {
      // Late Blight: Water-soaked purplish black necrotic patches
      const blightPatches = [
        { x: -50, y: -20, w: 85, h: 55 },
        { x: 35, y: 40, w: 75, h: 60 }
      ];
      blightPatches.forEach((p) => {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#171c18';
        ctx.fill();

        // White downy mildew margin
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#e2e8f080';
        ctx.stroke();
      });
    }

    ctx.restore();

    // Specimen Watermark Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`KisanLink Ag-Vision Specimen • ${type.toUpperCase()}`, 20, 455);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleDemoSample = async (cropType) => {
    setErrorMsg(null);
    stopCamera();
    const dataUrl = generateRealisticLeafDataUrl(cropType);
    setPreviewUrl(dataUrl);
    runAnalysis(dataUrl, cropType);
  };

  const runAnalysis = async (imageDataUrl, cropContext = '') => {
    setIsAnalyzing(true);
    setCurrentResult(null);
    try {
      const result = await analyzeCropWithGemini(imageDataUrl, cropContext);
      setCurrentResult(result);

      const cropTitle = lang === 'hi' ? result.cropHindi || result.crop : result.crop;
      const diseaseTitle = lang === 'hi' ? result.diseaseHindi || result.disease : result.disease;

      if (!isOnline || result.cloudAiStatus === 'OFFLINE') {
        showToast({
          title: lang === 'hi' ? "ऑन-डिवाइस रोग जांच पूर्ण! 🔬" : "On-Device Diagnosis Complete! 🔬",
          message: lang === 'hi' 
            ? "⚡ सक्रिय क्लाउड एआई केवल ऑनलाइन काम करता है। ऑन-डिवाइस विज़न मॉडल ने पत्ती की जांच की।" 
            : "⚡ Active Cloud AI works only online. Diagnosed via on-device vision model.",
          type: result.riskCode === 'high' ? 'error' : 'success'
        });
      } else {
        showToast({
          title: lang === 'hi' ? "रोग जांच पूर्ण! 🔬" : "Diagnosis Complete! 🔬",
          message: `${cropTitle}: ${diseaseTitle} (${result.riskLevel})`,
          type: result.riskCode === 'high' ? 'error' : 'success'
        });
      }

      // Save to IndexedDB
      await dbPut('scans', result);

      // If offline, queue for sync
      if (!isOnline) {
        await queueOfflineAction('CROP_SCAN', {
          id: result.id,
          disease: result.disease,
          riskLevel: result.riskLevel
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg(
        lang === 'hi'
          ? 'रोग विश्लेषण पूरा नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Diagnosis could not be completed. Please retry.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9fd70025] text-[#3d5500] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Vision AI & Embedded Edge Models</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            {lang === 'hi' ? "एआई फसल रोग स्कैनर" : "AI Crop Health & Disease Scanner"}
          </h2>
          <p className="text-xs md:text-sm text-[#446158] mt-1">
            {lang === 'hi'
              ? "त्वरित रोग निदान, जोखिम मूल्यांकन और उपचार के लिए संक्रमित पत्ती की फोटो अपलोड करें या खींचें।"
              : "Upload or capture any crop leaf picture for instant disease diagnosis, risk rating, and remedies."}
          </p>
        </div>

        {/* Action Controls: Model Architecture & Offline Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowModelInfo(!showModelInfo)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#272c1a] text-white hover:bg-black transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-[#9fd700]" />
            <span>{lang === 'hi' ? "ऑन-डिवाइस मॉडल (ONNX/VLM)" : "Local Edge Models (ONNX/VLM)"}</span>
            {showModelInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {!isOnline && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>{lang === 'hi' ? "⚡ ऑफ़लाइन मोड: ऑन-डिवाइस मॉडल सक्रिय" : "⚡ Offline Mode: On-Device Vision Active"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Offline Guard Banner: Active Cloud AI requires internet */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-sm text-amber-900">
              {lang === 'hi'
                ? "सूचना: सक्रिय क्लाउड एआई (Gemini 3.5 Flash-Lite) केवल ऑनलाइन काम करता है。"
                : "Notice: Active Cloud AI (Gemini 3.5 Flash-Lite) works only when online."}
            </p>
            <p className="text-amber-800 leading-relaxed">
              {lang === 'hi'
                ? "वर्तमान में आपका डिवाइस ऑफ़लाइन है। किसानलिंक का एम्बेडेड ऑन-डिवाइस विज़न मॉडल (MobileNetV3 / Canvas Pathology) बिना किसी इंटरनेट या सर्वर के सीधे आपके ब्राउज़र में पत्तियों का विश्लेषण और उपचार प्रदान कर रहा है।"
                : "Your device is currently offline. KisanLink's embedded on-device vision model (MobileNetV3 / Canvas Pathology) is diagnosing leaf symptoms and prescribing remedies 100% locally with zero internet requirement."}
            </p>
          </div>
        </div>
      )}

      {/* Embedded Lightweight Local Vision Models Drawer */}
      {showModelInfo && (
        <div className="bg-[#272c1a] text-white border border-[#44615840] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-elevated space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#9fd70025] text-[#9fd700] rounded-xl">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  {lang === 'hi' ? "लोकल व लाइटवेट एआई विज़न मॉडल्स (ऑन-डिवाइस आर्किटेक्चर)" : "Lightweight Local AI Vision Models for On-Device Diagnostics"}
                </h4>
                <p className="text-xs text-gray-400">
                  {lang === 'hi' ? "बिना इंटरनेट के ग्रामीण क्षेत्रों में तुरंत 15ms में रोग जांच" : "Sub-20ms inference with zero internet on low-resource mobile devices"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LOCAL_VISION_MODELS_METADATA.map((m) => (
              <div 
                key={m.id} 
                className={`p-3.5 rounded-2xl border ${
                  m.recommended ? 'bg-[#1e2414] border-[#9fd70060]' : 'bg-[#1b2011] border-gray-700'
                } space-y-2`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-xs text-white">{m.name}</span>
                  {m.recommended && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#9fd700] text-[#272c1a]">
                      Best Choice
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
                  <div>साइज़ / Size: <span className="font-bold text-[#9fd700]">{m.size}</span></div>
                  <div>गति / Latency: <span className="font-bold text-[#9fd700]">{m.latency}</span></div>
                  <div>रैम / RAM: <span className="font-bold text-gray-200">{m.memory}</span></div>
                  <div>क्लास / Classes: <span className="font-bold text-gray-200">{m.classes}</span></div>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Camera / Capture Card */}
        <div className="lg:col-span-6 bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#272c1a]">
              {lang === 'hi' ? "फसल की पत्ती की तस्वीर लें या अपलोड करें" : "Capture or Upload Crop Foliage"}
            </h3>
            {previewUrl && (
              <span className="text-xs font-bold text-[#3d5500] bg-[#9fd70025] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{lang === 'hi' ? "तस्वीर लोड हुई" : "Image Loaded"}</span>
              </span>
            )}
          </div>

          {/* Camera Viewport / Drag & Drop Upload Preview Area */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processUploadFile(file);
            }}
            className={`relative w-full aspect-4/3 max-h-[340px] sm:max-h-[440px] bg-[#272c1a] rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragging 
                ? 'border-[#9fd700] bg-[#323922] scale-[1.01]' 
                : 'border-[#44615840] hover:border-[#9fd70080]'
            }`}
            onClick={() => {
              if (!isCameraActive && !isAnalyzing) {
                fileInputRef.current?.click();
              }
            }}
          >
            {isCameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
                {/* Aiming Reticle */}
                <div className="absolute inset-8 border-2 border-dashed border-[#9fd700]/70 rounded-2xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white bg-[#272c1a]/80 px-3 py-1 rounded-full">
                    {lang === 'hi' ? "रोगग्रस्त पत्ती के भाग को केंद्र में रखें" : "Align affected leaf area"}
                  </span>
                </div>
              </>
            ) : previewUrl ? (
              <img src={previewUrl} alt="Crop capture preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-2 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#fffeef]/10 text-[#9fd700] flex items-center justify-center mx-auto transition-transform hover:scale-110">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-extrabold text-[#fffeef]">
                  {lang === 'hi' ? "तस्वीर अपलोड करने के लिए यहाँ क्लिक करें या ड्रैग करें" : "Click to Upload Image or Drag & Drop Here"}
                </p>
                <p className="text-xs text-gray-400">
                  {lang === 'hi' ? "JPG, PNG, WebP • फोन कैमरा या फाइल गैलरी" : "JPG, PNG, WebP • Camera or photo gallery"}
                </p>
              </div>
            )}

            {/* Analyzing Spinner & Laser Line Overlay */}
            {isAnalyzing && (
              <>
                <div className="absolute left-0 right-0 h-1 bg-[#9fd700] shadow-[0_0_20px_#9fd700] animate-laser-scan pointer-events-none z-20" />
                <div className="absolute inset-0 bg-[#272c1a]/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 z-10 animate-pop-in">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full bg-[#9fd700]/20 animate-ping absolute inset-0" />
                    <div className="w-14 h-14 rounded-full bg-[#272c1a] border-2 border-[#9fd700] flex items-center justify-center">
                      <RefreshCw className="w-7 h-7 text-[#9fd700] animate-spin" />
                    </div>
                  </div>
                  <p className="text-sm font-black text-[#9fd700]">
                    {lang === 'hi' ? "जेमिनी विज़न एआई जांच कर रहा है..." : "Gemini Vision AI Analyzing Foliage..."}
                  </p>
                  <p className="text-xs text-gray-300 text-center mt-1 max-w-xs">
                    {lang === 'hi' 
                      ? "रोग लक्षणों की पहचान व रासायनिक एवं जैविक उपचार तैयार हो रहे हैं" 
                      : "Scanning pathogen patterns and formulating targeted treatment"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {isCameraActive ? (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-full btn-lime py-3 text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Camera className="w-5 h-5 fill-current" />
                  <span>{lang === 'hi' ? "तस्वीर खींचें" : "Snap Photo Now"}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-full sm:w-auto btn-outline py-3 text-xs cursor-pointer active:scale-95"
                >
                  {lang === 'hi' ? "रद्द करें" : "Cancel"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full btn-lime py-3 text-xs md:text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'hi' ? "📁 तस्वीर अपलोड करें" : "📁 Upload Image File"}</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full btn-slate py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Camera className="w-4 h-4 fill-current" />
                  <span>{lang === 'hi' ? "📷 कैमरा खोलें" : "📷 Open Camera"}</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Sample Leaves */}
          <div className="pt-3 border-t border-[#44615815]">
            <span className="text-[11px] font-bold text-[#446158] uppercase tracking-wide block mb-2">
              ⚡ {lang === 'hi' ? "त्वरित परीक्षण नमूने (1-टैप डेमो):" : "⚡ Quick Demo Sample Leaves (1-Tap Test):"}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDemoSample('tomato')}
                className="text-xs font-bold bg-[#fffeef] border border-[#44615830] hover:border-red-400 hover:bg-red-50 text-[#272c1a] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                🍅 {lang === 'hi' ? "टमाटर अगेती झुलसा" : "Tomato Early Blight"}
              </button>
              <button
                type="button"
                onClick={() => handleDemoSample('potato')}
                className="text-xs font-bold bg-[#fffeef] border border-[#44615830] hover:border-amber-400 hover:bg-amber-50 text-[#272c1a] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                🥔 {lang === 'hi' ? "आलू पिछेती झुलसा" : "Potato Late Blight"}
              </button>
              <button
                type="button"
                onClick={() => handleDemoSample('wheat')}
                className="text-xs font-bold bg-[#fffeef] border border-[#44615830] hover:border-yellow-400 hover:bg-yellow-50 text-[#272c1a] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                🌾 {lang === 'hi' ? "गेहूं पीला रतुआ" : "Wheat Stripe Rust"}
              </button>
              <button
                type="button"
                onClick={() => handleDemoSample('healthy')}
                className="text-xs font-bold bg-[#fffeef] border border-[#44615830] hover:border-[#9fd700] hover:bg-[#9fd70015] text-[#272c1a] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                🌱 {lang === 'hi' ? "स्वस्थ पत्ती" : "Healthy Leaf"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Result Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#272c1a]">
              {lang === 'hi' ? "रोग जांच रिपोर्ट" : "Diagnostic Health Report"}
            </h3>
            {currentResult && (
              <span className="text-xs font-bold text-[#446158]">
                {lang === 'hi' ? `सटीकता: ${currentResult.confidence || '95%'}` : `Confidence: ${currentResult.confidence || '95%'}`}
              </span>
            )}
          </div>

          {currentResult ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <DiagnosticCard scan={currentResult} />

              {/* High Risk / Medium Risk Agronomist Escalation Card */}
              {(currentResult.riskCode === 'high' || currentResult.riskLevel === 'HIGH RISK') && (
                <div className="bg-[#272c1a] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-elevated border-2 border-red-400/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      {lang === 'hi' ? "गंभीर फसल आपात स्थिति - तत्काल कार्रवाई आवश्यक" : "Critical Crop Escalation Required"}
                    </span>
                    <h4 className="text-base font-extrabold text-[#fffeef]">
                      {lang === 'hi' ? "गंभीर रोग संक्रमण का प्रसार पाया गया" : "Severe pathogen spread detected"}
                    </h4>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {lang === 'hi' 
                        ? "तुरंत अपने नजदीकी कृषि विज्ञान केंद्र (केवीके) विशेषज्ञ से परामर्श लें।" 
                        : "Consult your local Krishi Vigyan Kendra agronomist immediately."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/experts', { state: { scan: currentResult } })}
                    className="btn-lime text-xs font-black py-3 px-5 whitespace-nowrap shrink-0 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 w-full sm:w-auto"
                  >
                    <PhoneCall className="w-4 h-4 fill-current" />
                    <span>{lang === 'hi' ? "कृषि विशेषज्ञ से बात करें" : "Talk to Local Expert"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#44615820] rounded-3xl p-8 shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#fffeef] border border-[#44615820] text-[#446158] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#9fd700]" />
              </div>
              <h4 className="text-sm font-bold text-[#272c1a]">
                {lang === 'hi' ? "फसल की पत्ती स्कैन करने की प्रतीक्षा है" : "Awaiting Crop Foliage Scan"}
              </h4>
              <p className="text-xs text-[#446158] max-w-sm mx-auto">
                {lang === 'hi'
                  ? "एआई रोग निदान, उपचार सलाह और सुरक्षित क्रिप्टोग्राफिक रिपोर्ट प्राप्त करने के लिए बाईं ओर से तस्वीर खींचें या अपलोड करें।"
                  : "Upload or snap a picture from the left panel to generate an AI diagnosis, treatment advice, and cryptographic audit hash."}
              </p>
            </div>
          )}

          {/* Recent Scans History from IndexedDB */}
          {history.length > 0 && (
            <div className="pt-4 space-y-3">
              <span className="text-xs font-extrabold uppercase text-[#446158] tracking-wider block">
                {lang === 'hi' ? `📋 संचित रोग निदान इतिहास (${history.length} जांच)` : `📋 Cached Diagnostic History (${history.length} scans)`}
              </span>
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <DiagnosticCard key={item.id} scan={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
