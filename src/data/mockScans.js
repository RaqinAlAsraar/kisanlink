// Crop Diagnostic Scans with risk classifications and remedies matching wireframe

export const INITIAL_SCANS = [
  {
    id: 'scan-001',
    disease: 'Early Blight Detected',
    diseaseHindi: 'अगेती झुलसा रोग (Early Blight)',
    crop: 'Tomato Crop',
    cropHindi: 'टमाटर की फसल',
    cropName: 'Tomato',
    riskLevel: 'HIGH RISK',
    riskLevelHindi: 'गंभीर खतरा',
    riskCode: 'high',
    timestamp: 'Scanned Today, 10:30 AM',
    timestampHindi: 'आज सुबह 10:30 बजे स्कैन किया गया',
    badgeText: 'HIGH RISK',
    badgeColor: 'red',
    thumbText: 'Leaf Spot',
    thumbTextHindi: 'पत्ती धब्बा',
    thumbBg: '#385049',
    thumbDot: 'red',
    summary: 'Dark concentric target-board rings with yellow chlorotic halos on lower tomato foliage.',
    summaryHindi: 'टमाटर की निचली पत्तियों पर पीले घेरे के साथ गहरे गोल छल्लेदार धब्बे देखे गए हैं।',
    remedy: [
      'Apply Copper Oxychloride 50% WP @ 3g/litre of water immediately.',
      'Carefully prune and burn heavily infected lower foliage to stop spore propagation.',
      'Switch from sprinkler/overhead watering to drip irrigation to keep leaf canopy dry.',
      'Maintain 2 feet spacing between plants for adequate airflow.'
    ],
    remedyHindi: [
      'कॉपर ऑक्सीक्लोराइड 50% WP को 3 ग्राम प्रति लीटर पानी में मिलाकर तुरंत छिड़काव करें।',
      'बीमारी फैलने से रोकने के लिए अत्यधिक प्रभावित निचली पत्तियों को काटकर नष्ट करें।',
      'पत्तियों को सूखा रखने के लिए फव्वारा सिंचाई की जगह ड्रिप सिंचाई का उपयोग करें।',
      'हवा के संचरण के लिए पौधों के बीच 2 फीट की दूरी बनाए रखें।'
    ],
    hash: '8f43a9b1c7e62d4e8b12f901a5d482c3f1e948a27b60513ec8d71624b593ef01',
    signature: '3045022100e479bc12f45810a4e76a029dbb7189ef03a56dc8319f2014c2b9a10502206bc18f2d',
    signedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'scan-002',
    disease: 'Healthy Crop',
    diseaseHindi: 'स्वस्थ फसल',
    crop: 'Wheat Crop',
    cropHindi: 'गेहूं की फसल',
    cropName: 'Wheat',
    riskLevel: 'LOW RISK',
    riskLevelHindi: 'सुरक्षित',
    riskCode: 'low',
    timestamp: 'Scanned 2 Days Ago',
    timestampHindi: '2 दिन पहले स्कैन किया गया',
    badgeText: 'LOW RISK',
    badgeColor: 'lime',
    thumbText: 'Healthy',
    thumbTextHindi: 'स्वस्थ',
    thumbBg: '#9fd700',
    thumbDot: '#3d5500',
    summary: 'Crop is progressing normally. Maintain current watering schedule.',
    summaryHindi: 'फसल सामान्य रूप से बढ़ रही है। वर्तमान सिंचाई और पोषण चक्र जारी रखें।',
    remedy: [
      'Crown root initiation stage is active; apply first top dressing of Urea (30 kg/acre).',
      'Ensure field is weed-free before canopy closure.',
      'Schedule next irrigation cycle in 10-12 days based on soil moisture probe.'
    ],
    remedyHindi: [
      'जड़ विकास की अवस्था है; यूरिया (30 किग्रा/एकड़) का पहला टॉप ड्रेसिंग छिड़काव करें।',
      'खेत में खरपतवार न होने दें ताकि फसल को पूरा पोषण मिले।',
      'मिट्टी की नमी की जांच कर 10-12 दिनों में अगली सिंचाई करें।'
    ],
    hash: '5a21ef4890c23178b5490fd32194a81bc92e0f47a16b93dc412e8705f19c35b8',
    signature: '3044022019ab76f023c914e6da285f190e8721c5b4e99f018d4512b7a90812e5c1022047a8',
    signedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'scan-003',
    disease: 'Yellow Rust Warning',
    diseaseHindi: 'पीला रतुआ चेतावनी (Yellow Rust)',
    crop: 'Wheat Crop',
    cropHindi: 'गेहूं की फसल',
    cropName: 'Wheat',
    riskLevel: 'MEDIUM RISK',
    riskLevelHindi: 'मध्यम खतरा',
    riskCode: 'medium',
    timestamp: 'Scanned 4 Days Ago',
    timestampHindi: '4 दिन पहले स्कैन किया गया',
    badgeText: 'MEDIUM RISK',
    badgeColor: 'yellow',
    thumbText: 'Rust Stripe',
    thumbTextHindi: 'रतुआ धारी',
    thumbBg: '#eab308',
    thumbDot: '#854d0e',
    summary: 'Powdery yellow-orange pustules arranged in linear stripes on flag leaves.',
    summaryHindi: 'ध्वज पत्तियों पर सीधी धारियों में पीले-नारंगी रंग के चूर्ण जैसे दाने दिखे हैं।',
    remedy: [
      'Spray Propiconazole 25% EC (Tilt) @ 1 ml per litre of water at first symptom onset.',
      'Avoid excess nitrogen fertilizer which promotes dense vegetative humidity.',
      'Monitor surrounding wheat fields for regional stripe rust outbreaks.'
    ],
    remedyHindi: [
      'लक्षण दिखते ही प्रोपिकोनाज़ोल 25% EC (टिल्ट) का 1 मिली प्रति लीटर पानी की दर से छिड़काव करें।',
      'अत्यधिक नाइट्रोजन खाद डालने से बचें जो पत्ती में अत्यधिक नमी बढ़ाता है।',
      'आसपास के गेहूं खेतों में पीला रतुआ के प्रसार पर नजर रखें।'
    ],
    hash: '3d8a920f1b5c478e690a21d583e742c091a47fb8230561e948c2b7190f845a16',
    signature: '3045022100a98c521ef80132b781a94bc20d75f928e19c0581452a819b4022018c4e7019f2',
    signedAt: new Date(Date.now() - 3600000 * 96).toISOString()
  }
];
