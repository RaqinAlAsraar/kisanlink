/**
 * KisanLink Offline Pattern-Based Conversational Engine
 * 
 * Enables seamless agricultural chatting and basic task execution completely
 * offline (without internet) through pattern matching and word understanding
 * across Hindi (Devanagari), English, and Hinglish.
 */

export const CROPS_DICTIONARY = [
  { 
    id: 'Wheat', 
    en: 'Wheat', 
    hi: 'गेहूं', 
    defaultPrice: 2275, 
    mandi: 'Meerut Mandi (UP)',
    trend: '+₹45',
    range: '₹2,240 - ₹2,310',
    aliases: ['gehu', 'gehun', 'wheat', 'kanak', 'gehoon', 'गेंहू', 'गेहूं', 'गेहू'] 
  },
  { 
    id: 'Tomato', 
    en: 'Tomato', 
    hi: 'टमाटर', 
    defaultPrice: 1800, 
    mandi: 'Azadpur Mandi (Delhi)',
    trend: '+₹120',
    range: '₹1,650 - ₹1,950',
    aliases: ['tamatar', 'tomato', 'tamater', 'टमाटर'] 
  },
  { 
    id: 'Paddy', 
    en: 'Paddy', 
    hi: 'धान', 
    defaultPrice: 3100, 
    mandi: 'Karnal Mandi (HR)',
    trend: '+₹25',
    range: '₹3,050 - ₹3,180',
    aliases: ['dhan', 'paddy', 'chawal', 'rice', 'basmati', 'धान', 'चावल'] 
  },
  { 
    id: 'Potato', 
    en: 'Potato', 
    hi: 'आलू', 
    defaultPrice: 1250, 
    mandi: 'Agra Mandi (UP)',
    trend: '-₹30',
    range: '₹1,180 - ₹1,320',
    aliases: ['aloo', 'aalu', 'potato', 'alu', 'आलू'] 
  },
  { 
    id: 'Mustard', 
    en: 'Mustard', 
    hi: 'सरसों', 
    defaultPrice: 5450, 
    mandi: 'Bharatpur Mandi (RJ)',
    trend: '+₹80',
    range: '₹5,380 - ₹5,520',
    aliases: ['sarson', 'sarso', 'mustard', 'rai', 'toria', 'सरसों', 'राई'] 
  },
  { 
    id: 'Onion', 
    en: 'Onion', 
    hi: 'प्याज़', 
    defaultPrice: 1650, 
    mandi: 'Nashik Mandi (MH)',
    trend: '-₹40',
    range: '₹1,550 - ₹1,720',
    aliases: ['pyaz', 'pyaaj', 'onion', 'kanda', 'प्याज़', 'प्याज', 'कांदा'] 
  },
  { 
    id: 'Cotton', 
    en: 'Cotton', 
    hi: 'कपास', 
    defaultPrice: 6800, 
    mandi: 'Rajkot Mandi (GJ)',
    trend: '+₹150',
    range: '₹6,650 - ₹6,950',
    aliases: ['kapas', 'cotton', 'rui', 'कपास', 'रुई'] 
  },
  { 
    id: 'Gram', 
    en: 'Gram', 
    hi: 'चना', 
    defaultPrice: 5800, 
    mandi: 'Indore Mandi (MP)',
    trend: '+₹60',
    range: '₹5,700 - ₹5,920',
    aliases: ['chana', 'gram', 'chole', 'चना'] 
  },
  { 
    id: 'Maize', 
    en: 'Maize', 
    hi: 'मक्का', 
    defaultPrice: 2050, 
    mandi: 'Chhindwara Mandi (MP)',
    trend: '+₹15',
    range: '₹1,980 - ₹2,100',
    aliases: ['makka', 'maize', 'corn', 'bhutta', 'मक्का'] 
  },
  { 
    id: 'Sugarcane', 
    en: 'Sugarcane', 
    hi: 'गन्ना', 
    defaultPrice: 380, 
    mandi: 'Muzaffarnagar Mill (UP)',
    trend: '+₹10',
    range: '₹370 - ₹395',
    aliases: ['ganna', 'sugarcane', 'iksh', 'गन्ना'] 
  }
];

export const BUYER_DEMANDS = [
  {
    company: 'Patanjali Agro Foods',
    crop: 'Wheat (Sharbati & Mill Quality)',
    cropHindi: 'गेहूं (शरबती व मिल क्वालिटी)',
    quantity: '500 Quintal',
    price: '₹2,300/qtl',
    location: 'Farmgate Pickup (मेरठ क्षेत्र)'
  },
  {
    company: 'McCain Foods India',
    crop: 'Potato (Processing Grade Kufri Chipsona)',
    cropHindi: 'आलू (चिप्सोना ग्रेड)',
    quantity: '1,000 Quintal',
    price: '₹1,350/qtl',
    location: 'आगरा / अलीगढ़'
  },
  {
    company: 'Fortune Agro Industries',
    crop: 'Mustard (High Oil Content)',
    cropHindi: 'सरसों (42% तेल मात्रा)',
    quantity: '300 Quintal',
    price: '₹5,500/qtl',
    location: 'भरतपुर / जयपुर'
  }
];

export const COLD_STORAGES = [
  {
    name: 'Shiv Krishi Cold Storage',
    nameHindi: 'शिव कृषि कोल्ड स्टोरेज',
    distance: '8 km away',
    availableSpace: '320 MT available',
    rate: '₹140/qtl/month',
    temp: '2°C - 4°C controlled'
  }
];

/**
 * Main Pattern Matcher & Agricultural Natural Language Comprehension
 */
export function processOfflineQuery(rawText, currentRoute = '/') {
  if (!rawText || !rawText.trim()) {
    return createEmptyResponse();
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Intent using word pattern classification
  const isSelling = /(bechna|becho|bikri|sell|sale|list|bech|बेचना|बेचो|बिक्री|बेचूं)/i.test(lower);
  const isMandi = /(mandi|bhav|bhao|rate|price|daam|kimat|मंडी|भाव|दाम|कीमत|रेट)/i.test(lower) && !isSelling;
  const isWeather = /(mausam|weather|barish|barsat|rain|spray|keetnashak|hawa|wind|temperature|tapman|dhup|मौसम|बारिश|स्प्रे|तापमान|हवा)/i.test(lower);
  const isColdStorage = /(cold\s*storage|storage|store|godam|warehouse|bhandaran|jagah|कोल्ड\s*स्टोरेज|गोदाम|भंडारण)/i.test(lower);
  const isDisease = /(rog|bimari|disease|keeda|keede|pest|fungus|faphund|peeli|blight|jhulsa|ratua|doctor|dava|medicine|ilaj|उपचार|रोग|कीड़ा|झुलसा|पत्ती|दवा|डॉक्टर|फफूंद)/i.test(lower);
  const isBuyerDemand = /(buyer|buyers|khareedar|patanjali|mccain|fortune|order|demand|thok|kharid|खरीदार|मांग|पतंजलि|थोक)/i.test(lower);
  const isExpert = /(expert|scientist|call|phone|sampark|kisan\s*call\s*center|vaigyanik|सलाह|विशेषज्ञ|कॉल|फोन|वैज्ञानिक)/i.test(lower);
  const isGreeting = /^(namaste|hello|hi|hey|help|madad|kaise|kya kar|नमस्ते|मदद|सहायता|प्रणाम)/i.test(lower);

  // 2. Extract Entities
  const detectedCrop = extractCropEntity(lower);
  const detectedUnit = extractUnitEntity(lower);
  const { quantity, price } = extractNumbers(lower, detectedCrop);

  // 3. Dispatch to pattern handlers

  // HANDLER: Sell Crop
  if (isSelling) {
    return handleSellCropIntent(text, detectedCrop, quantity, detectedUnit, price);
  }

  // HANDLER: Mandi Prices
  if (isMandi) {
    return handleMandiPriceIntent(text, detectedCrop);
  }

  // HANDLER: Weather & Spray Safety Window
  if (isWeather) {
    return handleWeatherIntent(text);
  }

  // HANDLER: Cold Storage
  if (isColdStorage) {
    return handleColdStorageIntent(text, detectedCrop);
  }

  // HANDLER: Crop Disease & First Aid Remedies
  if (isDisease) {
    return handleDiseaseIntent(text, detectedCrop);
  }

  // HANDLER: Buyer Demand & Wholesale
  if (isBuyerDemand) {
    return handleBuyerDemandIntent(text, detectedCrop);
  }

  // HANDLER: Expert & Agronomist Call
  if (isExpert) {
    return handleExpertIntent(text);
  }

  // HANDLER: Greeting & General Help
  if (isGreeting) {
    return handleGreetingHelpIntent(text);
  }

  // Default Fallback: If numbers or crop detected, assume sell or mandi rate
  if (detectedCrop && (quantity !== 50 || price !== detectedCrop.defaultPrice)) {
    return handleSellCropIntent(text, detectedCrop, quantity, detectedUnit, price);
  }

  if (detectedCrop) {
    return handleMandiPriceIntent(text, detectedCrop);
  }

  // General Fallback
  return handleGeneralFallback(text);
}

// ----------------- ENTITY EXTRACTION HELPERS -----------------

function extractCropEntity(lowerText) {
  for (const crop of CROPS_DICTIONARY) {
    if (crop.aliases.some(alias => lowerText.includes(alias))) {
      return crop;
    }
  }
  return CROPS_DICTIONARY[0]; // Default Wheat
}

function extractUnitEntity(lowerText) {
  if (/kilo|kg|किलो/i.test(lowerText)) return 'kg';
  if (/bori|bag|बोरी|थैला/i.test(lowerText)) return 'Bags';
  if (/ton|टन/i.test(lowerText)) return 'Ton';
  return 'Quintal';
}

function extractNumbers(lowerText, crop) {
  const allNumbers = (lowerText.match(/\b\d+(\.\d+)?\b/g) || []).map(Number);
  let quantity = 50;
  let price = crop.defaultPrice;

  // Specific regex matching: quantity with unit
  const qtyMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:quintal|kilo|kg|bori|bag|ton|क्विंटल|किलो|बोरी|टन)/i);
  // Specific regex matching: price with rate/currency
  const priceMatch = lowerText.match(/(?:rupaye|rupees|rs|rate|bhav|भाव|रुपये|₹)?\s*(\d{3,5})\s*(?:rupaye|rupees|rs|rate|bhav|भाव|रुपये|₹)?/i);

  if (qtyMatch) quantity = parseFloat(qtyMatch[1]);
  if (priceMatch && parseFloat(priceMatch[1]) >= 100) price = parseFloat(priceMatch[1]);

  if (!qtyMatch && !priceMatch) {
    if (allNumbers.length === 1) {
      if (allNumbers[0] >= 500) price = allNumbers[0];
      else quantity = allNumbers[0];
    } else if (allNumbers.length >= 2) {
      const n1 = allNumbers[0];
      const n2 = allNumbers[1];
      if (n1 > n2) { price = n1; quantity = n2; }
      else { quantity = n1; price = n2; }
    }
  }

  // Word-based number recognition
  if (lowerText.includes('pachas') || lowerText.includes('पचास')) quantity = 50;
  else if (lowerText.includes('sau') || lowerText.includes('सौ') || lowerText.includes('ek sau')) quantity = 100;
  else if (lowerText.includes('bees') || lowerText.includes('बीस')) quantity = 20;
  else if (lowerText.includes('dus') || lowerText.includes('das') || lowerText.includes('दस')) quantity = 10;
  else if (lowerText.includes('do sau') || lowerText.includes('दो सौ')) quantity = 200;

  return {
    quantity: Math.max(1, Math.round(quantity)),
    price: Math.max(100, Math.round(price))
  };
}

// ----------------- INTENT RESPONSE HANDLERS -----------------

function handleSellCropIntent(rawText, crop, qty, unit, price) {
  const unitHindi = unit === 'Quintal' ? 'क्विंटल' : unit === 'Bags' ? 'बोरी' : unit === 'kg' ? 'किलो' : 'टन';
  return {
    transcript: rawText,
    intent: 'SELL_CROP',
    spokenResponse: `मैंने आपकी ${qty} ${unitHindi} ${crop.hi} की बिक्री ₹${price} के भाव पर तैयार कर दी है। नीचे पुष्टि बटन दबाकर लिस्टिंग पूरी करें।`,
    spokenResponseEn: `Prepared your listing for ${qty} ${unit} of ${crop.en} at ₹${price}. Tap Confirm Listing below.`,
    action: { 
      route: '/sell', 
      label: 'फसल लिस्टिंग पुष्टि करें', 
      labelEn: 'Confirm Listing' 
    },
    crop: crop.en,
    cropHindi: crop.hi,
    quantity: qty,
    unit: unit,
    price: price,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन पैटर्न इंजन द्वारा तैयार किया गया (बिना इंटरनेट)'
  };
}

function handleMandiPriceIntent(rawText, crop) {
  return {
    transcript: rawText,
    intent: 'MANDI_PRICE',
    spokenResponse: `आज ${crop.mandi} में ${crop.hi} का भाव ₹${crop.defaultPrice} प्रति क्विंटल है (${crop.trend})। भाव सीमा ${crop.range} चल रही है।`,
    spokenResponseEn: `Today's ${crop.en} rate at ${crop.mandi} is ₹${crop.defaultPrice}/qtl (${crop.trend}). Range is ${crop.range}.`,
    action: { 
      route: '/mandi', 
      label: 'लाइव मंडी भाव देखें', 
      labelEn: 'View Mandi Prices' 
    },
    crop: crop.en,
    cropHindi: crop.hi,
    quantity: 50,
    unit: 'Quintal',
    price: crop.defaultPrice,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन कैश भाव रिकॉर्ड'
  };
}

function handleWeatherIntent(rawText) {
  return {
    transcript: rawText,
    intent: 'WEATHER',
    spokenResponse: 'आज मौसम आंशिक बादल के साथ 28°C और नमी 62% है। हवा 8 किमी प्रति घंटा शांत है। आज दोपहर 11 बजे से शाम 4 बजे तक कीटनाशक या फफूंदनाशक स्प्रे के लिए सुरक्षित समय है।',
    spokenResponseEn: 'Current weather is 28°C with 62% humidity and calm 8 km/h winds. Safe spray window is open today between 11 AM and 4 PM.',
    action: { 
      route: '/mandi', 
      label: 'मौसम व स्प्रे एडवाइजरी', 
      labelEn: 'Weather & Spray Advisory' 
    },
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन मौसम एडवाइजरी सक्रिय'
  };
}

function handleColdStorageIntent(rawText, crop) {
  const store = COLD_STORAGES[0];
  return {
    transcript: rawText,
    intent: 'COLD_STORAGE',
    spokenResponse: `${store.nameHindi} (${store.distance}) में 320 मीट्रिक टन खाली जगह उपलब्ध है। किराया ₹140 प्रति क्विंटल प्रति माह है। आप तुरंत जगह बुक कर सकते हैं।`,
    spokenResponseEn: `${store.name} (${store.distance}) has 320 MT space available at ₹140/qtl/month. Temperature controlled at 2-4°C.`,
    action: { 
      route: '/storage', 
      label: 'कोल्ड स्टोरेज बुक करें', 
      labelEn: 'Book Cold Storage' 
    },
    crop: crop.en,
    cropHindi: crop.hi,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन वेयरहाउस इन्वेंटरी'
  };
}

function handleDiseaseIntent(rawText, crop) {
  let remedyHint = 'कॉपर ऑक्सीक्लोराइड 50% WP (3 ग्राम प्रति लीटर पानी) का तुरंत छिड़काव करें।';
  let remedyHintEn = 'Spray Copper Oxychloride 50% WP @ 3g/L of water immediately.';

  if (crop.id === 'Wheat') {
    remedyHint = 'पीला रतुआ के लिए प्रोपिकोनाज़ोल 25% EC (टिल्ट) 1 मिली प्रति लीटर पानी की दर से स्प्रे करें।';
    remedyHintEn = 'For Yellow Rust, spray Propiconazole 25% EC (Tilt) @ 1ml/L of water.';
  } else if (crop.id === 'Potato') {
    remedyHint = 'पिछेती झुलसा के लिए मेटालेक्सिल + मैंकोजेब (रिडोमिल) 2.5 ग्राम प्रति लीटर पानी का छिड़काव करें।';
    remedyHintEn = 'For Late Blight, apply Metalaxyl + Mancozeb @ 2.5g/L immediately.';
  }

  return {
    transcript: rawText,
    intent: 'CROP_DISEASE',
    spokenResponse: `पत्ती रोग के लिए प्राथमिक उपचार: ${remedyHint} सटीक निदान के लिए नीचे दिए गए बटन से पत्ती की फोटो स्कैन करें।`,
    spokenResponseEn: `Initial treatment: ${remedyHintEn} For precise diagnosis, tap below to scan your leaf image.`,
    action: { 
      route: '/scanner', 
      label: 'फसल डॉक्टर: पत्ती स्कैन करें', 
      labelEn: 'Scan Crop Leaf' 
    },
    crop: crop.en,
    cropHindi: crop.hi,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन कृषि डॉक्टर प्राथमिक चिकित्सा'
  };
}

function handleBuyerDemandIntent(rawText, crop) {
  const demand = BUYER_DEMANDS[0];
  return {
    transcript: rawText,
    intent: 'BUYER_DEMAND',
    spokenResponse: `वर्तमान में ${demand.company} 500 क्विंटल गेहूं ₹2,300 के भाव पर फार्मगेट पिकअप के साथ खरीद रही है। मैककेन इंडिया को आलू की भी थोक मांग है।`,
    spokenResponseEn: `${demand.company} is actively buying 500 Qtl Wheat at ₹2,300/qtl with farmgate pickup. McCain is also buying potato.`,
    action: { 
      route: '/marketplace', 
      label: 'थोक खरीदार मांग देखें', 
      labelEn: 'View Buyer Demands' 
    },
    crop: crop.en,
    cropHindi: crop.hi,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन खरीदार मांग रिकॉर्ड'
  };
}

function handleExpertIntent(rawText) {
  return {
    transcript: rawText,
    intent: 'EXPERT',
    spokenResponse: 'आप डॉ. प्रिया पटेल (वरिष्ठ पादप रोग विशेषज्ञ) से सीधे परामर्श ले सकते हैं या किसान कॉल सेंटर 1800-180-1551 पर मुफ्त बात कर सकते हैं।',
    spokenResponseEn: 'You can consult Dr. Priya Patel (Senior Pathologist) or call Kisan Helpline 1800-180-1551 for free guidance.',
    action: { 
      route: '/experts', 
      label: 'विशेषज्ञ से बात करें', 
      labelEn: 'Consult Expert' 
    },
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन विशेषज्ञ संपर्क सूची'
  };
}

function handleGreetingHelpIntent(rawText) {
  return {
    transcript: rawText,
    intent: 'GENERAL',
    spokenResponse: 'नमस्ते किसान भाई! मैं किसानलिंक ऑफ़लाइन सहायक हूँ। आप बोलकर या लिखकर फसल बेच सकते हैं, मंडी भाव पूछ सकते हैं, मौसम जांच सकते हैं या कोल्ड स्टोरेज बुक कर सकते हैं।',
    spokenResponseEn: 'Hello! I am KisanLink Offline Assistant. You can chat or speak to sell crops, check mandi rates, check weather, or book cold storage.',
    action: { 
      route: '/mandi', 
      label: 'मंडी भाव व सुविधाएं', 
      labelEn: 'Mandi & Services' 
    },
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    quantity: 50,
    unit: 'Quintal',
    price: 2275,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन पैटर्न सहायक सक्रिय'
  };
}

function handleGeneralFallback(rawText) {
  return {
    transcript: rawText,
    intent: 'GENERAL',
    spokenResponse: 'आप अपनी फसल का नाम, मात्रा और भाव बोल सकते हैं—जैसे "50 क्विंटल गेहूं 2275 रुपये में बेचना है", या "टमाटर का मंडी भाव क्या है"।',
    spokenResponseEn: 'You can say your crop, quantity and rate, like "Sell 50 quintal wheat at 2275", or ask "What is tomato mandi rate?".',
    action: { 
      route: '/sell', 
      label: 'फसल लिस्टिंग बनाएं', 
      labelEn: 'Create Listing' 
    },
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    quantity: 50,
    unit: 'Quintal',
    price: 2275,
    isOfflineProcessed: true,
    offlineNotice: '⚡ ऑफ़लाइन पैटर्न सहायक सक्रिय'
  };
}

function createEmptyResponse() {
  return {
    transcript: '',
    intent: 'GENERAL',
    spokenResponse: 'कृपया अपनी फसल, मात्रा या कोई भी प्रश्न बोलें या टाइप करें।',
    spokenResponseEn: 'Please speak or type your crop, quantity or question.',
    action: { route: '/sell', label: 'फसल लिस्टिंग', labelEn: 'Sell Crop' },
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    quantity: 50,
    unit: 'Quintal',
    price: 2275,
    isOfflineProcessed: true
  };
}
