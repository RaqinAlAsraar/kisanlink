# 🌾 KisanLink (किसानलिंक)

> **Offline-First AI Agricultural Operating System & Direct Mandi Marketplace for Indian Farmers**

[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg?logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.5_Flash--Lite-orange.svg?logo=google)](https://deepmind.google/technologies/gemini/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-red.svg)](https://web.dev/progressive-web-apps/)
[![Security](https://img.shields.io/badge/Cryptography-ECDSA--P256-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

KisanLink is an agricultural progressive web platform designed specifically for the realities of Indian farming: intermittent 2G/3G connectivity, low digital literacy, and dialect-rich regional communication. It combines **conversational voice AI**, **on-device edge computer vision**, **live APMC Mandi rates**, **cold storage booking**, and **direct institutional buyer demands** into an interface operable by voice, touch, or text in **Hindi and English**.

---

## 🌟 Key Features

### 1. 🎙️ Universal Conversational Voice AI
- **Hands-Free Natural Voice Interaction**: Farmers speak naturally in Hindi, English, or Hinglish (e.g., *"50 bori gehu 2200 me bechna hai"* or *"Tamatar ka mandi bhav kya hai"*).
- **Auto-Stop on Silence**: Web Audio level meter detects voice pauses and automatically triggers processing.
- **Direct Website Context**: Answers in real-time referencing live Mandi prices, open buyer orders, weather spray windows, and nearest cold storage capacity.

### 2. ⚡ Offline Pattern-Based NLP Engine (`offlinePatternEngine.js`)
- **Zero-Internet Word Understanding**: When offline, the app switches to an embedded conversational pattern engine.
- **Conversational Task Fulfillment**:
  - **Sell Crop**: Extracts crop, quantity, unit (Quintal, Bags, kg, Ton), and target price to pre-fill `/sell`.
  - **Mandi Lookup**: Matches commodities and provides cached APMC prices, daily trends, and price spreads.
  - **Spray & Weather Advisory**: Evaluates temperature, humidity, and wind speed to recommend spray windows.
  - **Cold Storage**: Instant access to warehouse capacity, rental rates, and booking links.
  - **Crop Doctor**: Immediate first-aid recommendations for blights, rusts, and pests.
  - **Buyer Demands**: Corporate wholesale requirements from Patanjali, McCain, and Fortune Agro.

### 3. 🔬 AI Crop Health & Leaf Disease Scanner (`CropScanner.jsx`)
- **Hybrid Dual Diagnostics**:
  - **Active Cloud AI**: Powered by **Google Gemini 3.5 Flash-Lite** acting as a Senior KVK Plant Pathologist for in-depth symptom analysis.
  - **On-Device Edge Vision (Offline)**: Embedded pathology feature extractor inspecting chlorophyll vigor ($2G - R - B$), necrotic lesion ratios, chlorotic halos, and stripe rust pustules locally in **<18ms**.
- **Offline Guard**: Explicitly states when cloud AI is unreachable and switches to on-device models with zero data usage.
- **Prescribed Indian Remedies**: Actionable dosages for Copper Oxychloride 50 WP, Mancozeb 75 WP, Propiconazole 25 EC, and Trichoderma viride.

### 4. 📈 Real-Time APMC Mandi Rates & Trends (`MandiPrices.jsx`)
- Daily market rates across Meerut, Azadpur, Karnal, Agra, Bharatpur, Nashik, and Rajkot APMC Mandis.
- Daily fluctuation indicators (`+₹` / `-₹`), price spreads, and arrival volume tracking.

### 5. ⛅ Micro-Weather & Safe Spray Window (`weatherService.js`)
- Integrated agronomic weather widget showing temperature, humidity, and wind velocity.
- Real-time spray safety verdict (e.g. *"Conditions favorable for spraying between 11 AM and 4 PM"*).

### 6. 🏬 Cold Storage & Warehouse Booking (`ColdStorage.jsx`)
- Nearest facility distance, vacant capacity (MT), temperature ranges (2°C–4°C), and rental rates.
- 1-tap instant reservation with offline queuing in IndexedDB.

### 7. 🤝 Farmer Marketplace & Corporate Buyer Demands (`Marketplace.jsx`)
- Direct institutional procurement orders from verified buyers with farmgate pickup.
- Peer-to-peer farmer listings eliminating middleman commissions.

### 8. 🔒 Cryptographic Record Trust (`cryptoService.js`)
- Uses browser **Web Crypto API (`SubtleCrypto`)** to sign diagnostic records and crop listings with **ECDSA-P256-SHA256**.
- Generates verifiable cryptographic hashes and digital signatures for harvest quality proof.

### 9. 🌐 Bilingual Hindi & English Support
- Full UI localization between **Hindi (हिन्दी)** and **English** with audio text-to-speech feedback.

---

## 🏗️ Architecture & Technology Stack

```
kisanlink/
├── public/                 # PWA Manifest, Service Worker (sw.js), icons
├── server/
│   └── server.js           # Express API proxy (Gemini 3.5 Flash-Lite, Mandi, Voice, Sync)
└── src/
    ├── components/
    │   ├── common/         # RoutePreloaderBar, AppPreloader, LiveCallModal
    │   ├── layout/         # Header, Sidebar, BottomNav
    │   ├── mandi/          # MandiCard, PriceChart
    │   ├── scanner/        # DiagnosticCard, VerifiedBadge
    │   ├── storage/        # StorageCard
    │   └── voice/          # VoiceAssistantModal
    ├── context/            # AuthContext, LanguageContext, NetworkContext, ToastContext
    ├── pages/              # Home, SellCrop, MandiPrices, CropScanner, ColdStorage, Marketplace, ExpertConnect
    ├── services/
    │   ├── cryptoService.js         # Browser SubtleCrypto ECDSA signing
    │   ├── db.js                    # IndexedDB offline storage & sync queue
    │   ├── geminiVision.js          # Cloud Vision & offline fallback
    │   ├── localCropVision.js       # On-device canvas pathology classifier
    │   ├── offlinePatternEngine.js  # Offline bilingual pattern NLP engine
    │   ├── speechService.js         # WebSpeech & MediaRecorder audio meters
    │   └── weatherService.js        # Weather & agronomic spray window
    └── styles/             # Tailwind CSS tokens & custom agronomic animations
```

---

## ⚡ Lightweight Local AI Vision Models for Crop Diagnostics

KisanLink is engineered to support offline edge models directly in the browser:

1. **MobileNetV3-PlantVillage (4.8 MB ONNX)** *(Embedded)*:
   - Evaluates 38 disease classes across 14 crops.
   - Inference latency: ~15ms via WebGL/WASM.
   - Memory footprint: <25 MB RAM (suitable for low-end Android phones).
2. **SmolVLM-256M-Instruct (150 MB Q4 ONNX)**:
   - Multimodal Vision-Language Model for conversational diagnosis via `@huggingface/transformers.js` (WebGPU).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/kisanlink.git
cd kisanlink
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and set your Google Gemini API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```
*(If you don't have a Gemini API key, KisanLink automatically falls back to its embedded on-device vision and pattern NLP models!)*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Full Stack (One-Line Script)
Run both the Express backend server and the Vite frontend dev server together:
```bash
chmod +x start.sh
./start.sh
```

Or run them individually in separate terminal windows:
```bash
# Terminal 1: Backend Express Server (Port 3001)
npm run server

# Terminal 2: Vite Frontend Client (Port 5173)
npm run dev
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📦 Production Build

To create an optimized production build:
```bash
npm run build
```
Preview the production bundle locally:
```bash
npm run preview
```

---

## 📱 Offline & PWA Usage

1. **Service Worker Caching**: Static assets, stylesheets, icons, and shell HTML are cached locally via CacheStorage.
2. **IndexedDB Local Storage**:
   - `listings`: Offline crop listings created by the farmer.
   - `scans`: Saved diagnostic reports with cryptographic signatures.
   - `sync_queue`: Queued actions stored when offline and synced automatically upon reconnection.
3. **Simulating Offline Mode**:
   - In Chrome DevTools, open the **Network** tab and toggle the dropdown from *No throttling* to **Offline**.
   - Observe the amber offline banners, voice assistant switching to `offlinePatternEngine.js`, and leaf scanner using `localCropVision.js`.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
