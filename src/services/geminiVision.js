import { signRecord } from './cryptoService.js';
import { diagnoseCropOffline, LOCAL_VISION_MODELS_METADATA } from './localCropVision.js';

export { LOCAL_VISION_MODELS_METADATA };

// Client-side Canvas Image Compression
export async function compressImage(file, maxWidth = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((dataUrl.length * 3) / 4)
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Comprehensive Agronomist Diagnostics (Offline & Quick Model)
const CROP_DIAGNOSTICS = [
  {
    disease: 'Early Blight Detected (Alternaria solani)',
    diseaseHindi: 'अगेती झुलसा रोग (Early Blight)',
    crop: 'Tomato Crop',
    cropHindi: 'टमाटर की फसल',
    cropName: 'Tomato',
    riskLevel: 'HIGH RISK',
    riskLevelHindi: 'गंभीर खतरा (High Risk)',
    riskCode: 'high',
    badgeText: 'HIGH RISK',
    badgeColor: 'red',
    thumbText: 'Leaf Spot',
    thumbTextHindi: 'पत्ती धब्बा',
    thumbBg: '#385049',
    thumbDot: 'red',
    confidence: '95%',
    summary: 'Dark concentric target-board rings with yellow chlorotic halos on lower tomato foliage.',
    summaryHindi: 'टमाटर की निचली पत्तियों पर काले-भूरे छल्लेदार धब्बे और चारों ओर पीलापन देखा गया है।',
    remedy: [
      'Apply Copper Oxychloride 50% WP @ 3g/litre of clean water immediately.',
      'Carefully prune and safely destroy heavily infected lower foliage away from field.',
      'Switch from sprinkler/overhead watering to drip irrigation to keep leaf canopy dry.',
      'Maintain 2 feet spacing between plants for adequate airflow and aeration.'
    ],
    remedyHindi: [
      'कॉपर ऑक्सीक्लोराइड 50% WP (3 ग्राम प्रति लीटर पानी) का तुरंत छिड़काव करें।',
      'रोगग्रस्त निचली पत्तियों को तोड़कर खेत से दूर नष्ट कर दें।',
      'फसल पर ऊपर से पानी देने के बजाय ड्रिप सिंचाई अपनाएं ताकि पत्तियां सूखी रहें।',
      'हवा के संचलन के लिए पौधों के बीच 2 फीट की दूरी बनाए रखें।'
    ],
    expertRecommended: true
  },
  {
    disease: 'Healthy Crop (Optimal Chlorophyll)',
    diseaseHindi: 'स्वस्थ फसल (कोई रोग नहीं)',
    crop: 'Wheat Crop',
    cropHindi: 'गेहूं की फसल',
    cropName: 'Wheat',
    riskLevel: 'LOW RISK',
    riskLevelHindi: 'सुरक्षित (Low Risk)',
    riskCode: 'low',
    badgeText: 'LOW RISK',
    badgeColor: 'lime',
    thumbText: 'Healthy',
    thumbTextHindi: 'स्वस्थ',
    thumbBg: '#9fd700',
    thumbDot: '#3d5500',
    confidence: '98%',
    summary: 'Foliage exhibits vigorous chlorophyll saturation with intact cells and zero fungal lesions.',
    summaryHindi: 'फसल की पत्तियां गहरे हरे रंग की, पूर्णतः स्वस्थ और किसी भी फफूंद या कीट से मुक्त हैं।',
    remedy: [
      'Maintain crown root irrigation schedule at 21 days interval.',
      'Top dress with 30 kg Urea or balanced NPK per acre before next irrigation cycle.',
      'Scout field borders weekly for early aphid or seasonal rust signs.'
    ],
    remedyHindi: [
      'मुकुट जड़ अवस्था पर 21 दिनों के अंतराल पर हल्की सिंचाई जारी रखें।',
      'मृदा स्वास्थ्य कार्ड के अनुसार संतुलित खाद और सूक्ष्म पोषक तत्व दें।',
      'साप्ताहिक खेत भ्रमण जारी रखें ताकि फसल स्वस्थ बनी रहे।'
    ],
    expertRecommended: false
  },
  {
    disease: 'Yellow Stripe Rust (Puccinia striiformis)',
    diseaseHindi: 'पीला रतुआ / हल्दी रोग (Yellow Rust)',
    crop: 'Wheat Crop',
    cropHindi: 'गेहूं की फसल',
    cropName: 'Wheat',
    riskLevel: 'MEDIUM RISK',
    riskLevelHindi: 'मध्यम खतरा (Medium Risk)',
    riskCode: 'medium',
    badgeText: 'MEDIUM RISK',
    badgeColor: 'yellow',
    thumbText: 'Rust Stripe',
    thumbTextHindi: 'पीला रतुआ',
    thumbBg: '#eab308',
    thumbDot: '#854d0e',
    confidence: '91%',
    summary: 'Linear stripes of bright yellow-orange urediniospores visible on upper leaf lamina.',
    summaryHindi: 'गेहूं की पत्तियों की नसों के समानांतर चमकीली पीली-नारंगी पाउडर जैसी पट्टियां दिखाई दे रही हैं।',
    remedy: [
      'Spray Propiconazole 25% EC (Tilt) @ 1ml/litre of water at first sign of appearance.',
      'Avoid excess nitrogenous/urea fertilizer which increases foliage susceptibility.',
      'Notify local Krishi Vigyan Kendra (KVK) agronomist of stripe rust progression.'
    ],
    remedyHindi: [
      'प्रोपिकोनाज़ोल 25% EC (टिल्ट) 1 मिली प्रति लीटर पानी की दर से तुरंत स्प्रे करें।',
      'खेत में अधिक यूरिया न डालें, क्योंकि इससे फफूंद का प्रसार तेजी से होता है।',
      'साप्ताहिक निरीक्षण करें और अधिक फैलाव होने पर केवीके विशेषज्ञ को सूचित करें।'
    ],
    expertRecommended: true
  },
  {
    disease: 'Late Blight Infestation (Phytophthora infestans)',
    diseaseHindi: 'पिछेती झुलसा रोग (Late Blight)',
    crop: 'Potato Crop',
    cropHindi: 'आलू की फसल',
    cropName: 'Potato',
    riskLevel: 'HIGH RISK',
    riskLevelHindi: 'गंभीर खतरा (High Risk)',
    riskCode: 'high',
    badgeText: 'HIGH RISK',
    badgeColor: 'red',
    thumbText: 'Blight Mold',
    thumbTextHindi: 'पिछेती झुलसा',
    thumbBg: '#2d403a',
    thumbDot: 'red',
    confidence: '96%',
    summary: 'Water-soaked irregular black/brown lesions with pale white downy mildew on leaf undersides.',
    summaryHindi: 'आलू की पत्तियों पर पानी जैसे काले धब्बे और पत्तियों के नीचे सफेद फफूंद की परत विकसित हो रही है।',
    remedy: [
      'Immediate contact spray with Cymoxanil + Mancozeb @ 2.5g/L or Metalaxyl + Mancozeb @ 2g/L.',
      'Halt all overhead sprinkler irrigation; ensure rapid drainage in field furrows.',
      'Harvest tubers only when crop vines are completely dry to prevent tuber rot in storage.'
    ],
    remedyHindi: [
      'साइमोक्सानिल + मैंकोजेब (2.5 ग्राम प्रति लीटर) का तुरंत सघन छिड़काव करें।',
      'खेत में पानी जमा न होने दें और फव्वारा सिंचाई पूरी तरह बंद करें।',
      'कंदों को सड़न से बचाने के लिए पत्तियां पूरी तरह सूखने के बाद ही खुदाई करें।'
    ],
    expertRecommended: true
  }
];

export async function analyzeCropWithGemini(compressedImageDataUrl, cropContext = '') {
  // CRITICAL REQUIREMENT: Active Cloud AI requires internet; when offline, explicitly declare offline and run on-device local vision model
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    console.log('[Crop AI] Offline detected: Active Cloud AI works only online. Executing on-device local vision model.');
    const localResult = await diagnoseCropOffline(compressedImageDataUrl, cropContext);
    return {
      ...localResult,
      cloudAiStatus: 'OFFLINE',
      cloudAiNotice: 'सक्रिय क्लाउड एआई (Gemini) केवल ऑनलाइन काम करता है। ऑन-डिवाइस मॉडल से जांच की गई।',
      cloudAiNoticeEn: 'Active Cloud AI (Gemini) works only online. Diagnosis completed via on-device vision model.'
    };
  }

  let diagnosticResult = null;
  let usedModel = 'gemini-3.5-flash-lite';

  // Primary Engine: Call KisanLink Backend Vision Proxy (utilizing Gemini 3.5 Flash-Lite)
  try {
    const base64Data = compressedImageDataUrl.includes(',') 
      ? compressedImageDataUrl.split(',')[1] 
      : compressedImageDataUrl;

    const res = await fetch('/api/crop/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: 'image/jpeg',
        cropContext
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        diagnosticResult = json.data;
        if (json.model) usedModel = json.model;
      }
    }
  } catch (apiError) {
    console.warn('Backend Vision API call failed, falling back to local on-device model:', apiError);
  }

  // Fallback Engine: Execute local on-device agronomy classifier
  if (!diagnosticResult) {
    const localDiag = await diagnoseCropOffline(compressedImageDataUrl, cropContext);
    return {
      ...localDiag,
      cloudAiStatus: 'FALLBACK_LOCAL',
      cloudAiNotice: 'क्लाउड एआई नेटवर्क अनुपलब्ध: ऑन-डिवाइस विज़न मॉडल द्वारा परिणाम दिए गए।',
      cloudAiNoticeEn: 'Cloud AI network unavailable: Result produced by on-device vision model.'
    };
  }

  // Ensure all required fields exist
  if (!diagnosticResult.cropHindi) diagnosticResult.cropHindi = diagnosticResult.crop || 'फसल';
  if (!diagnosticResult.diseaseHindi) diagnosticResult.diseaseHindi = diagnosticResult.disease || 'रोग जांच';
  if (!diagnosticResult.riskLevelHindi) {
    diagnosticResult.riskLevelHindi = diagnosticResult.riskCode === 'high' 
      ? 'गंभीर खतरा (High Risk)' 
      : diagnosticResult.riskCode === 'low' 
      ? 'सुरक्षित (Low Risk)' 
      : 'मध्यम खतरा (Medium Risk)';
  }
  if (!diagnosticResult.summaryHindi) diagnosticResult.summaryHindi = diagnosticResult.summary || '';
  if (!diagnosticResult.remedyHindi) diagnosticResult.remedyHindi = diagnosticResult.remedy || [];

  // Cryptographically sign the diagnostic record with browser SubtleCrypto
  const recordToSign = {
    disease: diagnosticResult.disease,
    crop: diagnosticResult.crop,
    riskLevel: diagnosticResult.riskLevel,
    remedy: diagnosticResult.remedy,
    model: usedModel,
    timestamp: new Date().toISOString()
  };

  const cryptoSig = await signRecord(recordToSign);

  return {
    ...diagnosticResult,
    id: `scan-${Date.now()}`,
    timestamp: 'Scanned Just Now',
    imageDataUrl: compressedImageDataUrl,
    model: usedModel,
    cloudAiStatus: 'ONLINE_ACTIVE',
    hash: cryptoSig.hash,
    signature: cryptoSig.signature,
    signedAt: cryptoSig.signedAt,
    algorithm: cryptoSig.algorithm,
    verified: true
  };
}
