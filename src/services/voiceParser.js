// Voice-to-JSON Parser for Hinglish and Indian Regional dialects

export const CROPS = [
  { id: 'Wheat', en: 'Wheat', hi: 'गेहूं', defaultPrice: 2275, aliases: ['gehu', 'gehun', 'wheat', 'kanak', 'gehoon', 'गेहूं', 'गेहू'] },
  { id: 'Tomato', en: 'Tomato', hi: 'टमाटर', defaultPrice: 1800, aliases: ['tamatar', 'tomato', 'टमाटर'] },
  { id: 'Paddy', en: 'Paddy', hi: 'धान', defaultPrice: 3100, aliases: ['dhan', 'paddy', 'chawal', 'rice', 'धान', 'चावल'] },
  { id: 'Potato', en: 'Potato', hi: 'आलू', defaultPrice: 1250, aliases: ['aloo', 'aalu', 'potato', 'आलू'] },
  { id: 'Mustard', en: 'Mustard', hi: 'सरसों', defaultPrice: 5450, aliases: ['sarson', 'sarso', 'mustard', 'rai', 'सरसों', 'राई'] },
  { id: 'Onion', en: 'Onion', hi: 'प्याज़', defaultPrice: 1650, aliases: ['pyaz', 'pyaaj', 'onion', 'kanda', 'प्याज़', 'प्याज', 'कांदा'] },
  { id: 'Cotton', en: 'Cotton', hi: 'कपास', defaultPrice: 6800, aliases: ['kapas', 'cotton', 'rui', 'कपास', 'रुई'] },
  { id: 'Gram', en: 'Gram', hi: 'चना', defaultPrice: 5800, aliases: ['chana', 'gram', 'chole', 'चना'] },
  { id: 'Maize', en: 'Maize', hi: 'मक्का', defaultPrice: 2050, aliases: ['makka', 'maize', 'corn', 'bhutta', 'मक्का'] },
  { id: 'Sugarcane', en: 'Sugarcane', hi: 'गन्ना', defaultPrice: 380, aliases: ['ganna', 'sugarcane', 'गन्ना'] }
];

export function parseCropSpeech(transcript) {
  if (!transcript) return null;
  const lower = transcript.toLowerCase();

  // 1. Detect Crop
  let matchedCrop = null;
  for (const crop of CROPS) {
    if (crop.aliases.some(alias => lower.includes(alias))) {
      matchedCrop = crop;
      break;
    }
  }

  const selectedCrop = matchedCrop || CROPS[0]; // Default Wheat

  // 2. Detect Unit
  let unit = 'Quintal';
  if (/kilo|kg|किलो/i.test(lower)) {
    unit = 'kg';
  } else if (/bori|bag|बोरी/i.test(lower)) {
    unit = 'Bags';
  } else {
    unit = 'Quintal';
  }

  // 3. Extract Numbers
  const allNumbers = (lower.match(/\b\d+(\.\d+)?\b/g) || []).map(Number);
  
  let quantity = 50;
  let price = selectedCrop.defaultPrice;

  // Specific regex matching: quantity with unit
  const qtyWithUnitMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:quintal|kilo|kg|bori|bag|ton|man|क्विंटल|किलो|बोरी)/i);
  // Specific regex matching: price with currency
  const priceWithUnitMatch = lower.match(/(?:rupaye|rupees|rs|rate|bhav|भाव|रुपये|₹)?\s*(\d{3,5})\s*(?:rupaye|rupees|rs|rate|bhav|भाव|रुपये|₹)?/i);

  if (qtyWithUnitMatch) {
    quantity = parseFloat(qtyWithUnitMatch[1]);
  }

  if (priceWithUnitMatch && parseFloat(priceWithUnitMatch[1]) >= 100) {
    price = parseFloat(priceWithUnitMatch[1]);
  }

  // If specific matches didn't capture both, use number separation
  if (allNumbers.length === 1) {
    const singleNum = allNumbers[0];
    if (singleNum >= 600) {
      price = singleNum;
    } else {
      quantity = singleNum;
    }
  } else if (allNumbers.length >= 2) {
    const n1 = allNumbers[0];
    const n2 = allNumbers[1];
    if (!qtyWithUnitMatch && !priceWithUnitMatch) {
      if (n1 > n2) {
        price = n1;
        quantity = n2;
      } else {
        quantity = n1;
        price = n2;
      }
    } else if (qtyWithUnitMatch && !priceWithUnitMatch) {
      const remaining = allNumbers.find(n => n !== quantity && n >= 100);
      if (remaining) price = remaining;
    } else if (!qtyWithUnitMatch && priceWithUnitMatch) {
      const remaining = allNumbers.find(n => n !== price && n <= 1000);
      if (remaining) quantity = remaining;
    }
  } else {
    // Word numbers like पचास (50), सौ (100), बीस (20)
    if (lower.includes('pachas') || lower.includes('पचास')) quantity = 50;
    else if (lower.includes('sau') || lower.includes('सौ')) quantity = 100;
    else if (lower.includes('bees') || lower.includes('बीस')) quantity = 20;
    else if (lower.includes('dus') || lower.includes('das') || lower.includes('दस')) quantity = 10;
  }

  return {
    crop: selectedCrop.en,
    cropHindi: selectedCrop.hi,
    cropId: selectedCrop.id,
    quantity: Math.max(1, Math.round(quantity)),
    unit: unit,
    price: Math.max(100, Math.round(price)),
    rawTranscript: transcript
  };
}
