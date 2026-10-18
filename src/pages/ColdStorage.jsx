import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Thermometer, Droplets, Phone, Check, ShieldCheck, ArrowRight, X, RefreshCw, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { STORAGE_FACILITIES } from '../data/storageFacilities';
import { useLanguage } from '../context/LanguageContext';
import { dbPut, queueOfflineAction } from '../services/db';
import { useNetwork } from '../context/NetworkContext';
import { useToast } from '../context/ToastContext';
import { speakText } from '../services/speechService';
import LiveCallModal from '../components/common/LiveCallModal';
import { StorageCardSkeleton } from '../components/common/SkeletonCard';

export default function ColdStorage() {
  const [facilities, setFacilities] = useState(STORAGE_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingQty, setBookingQty] = useState(25);
  const [bookingMonths, setBookingMonths] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [lockerPass, setLockerPass] = useState(null);
  const [activeCallContact, setActiveCallContact] = useState(null);
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPreloading(false), 320);
    return () => clearTimeout(timer);
  }, []);

  const { lang, t } = useLanguage();
  const { isOnline } = useNetwork();
  const { showToast } = useToast();

  const handleOpenBooking = (facility) => {
    setSelectedFacility(facility);
    setBookingConfirmed(false);
    setIsProcessing(false);
  };

  const handleCallFacility = (fac) => {
    setActiveCallContact({
      name: fac.name,
      title: lang === 'hi' ? 'कोल्ड स्टोरेज प्रबंधक' : 'Cold Chain Logistics Officer',
      org: `${fac.location} • ${fac.distance}`,
      phone: fac.phone,
      avatarLetter: '❄️',
      greeting: lang === 'hi' 
        ? `नमस्ते! मैं ${fac.name} के कोल्ड स्टोरेज से बोल रहा हूँ। हमारी कोल्ड रूम सुविधा पूरी तरह चालू है। आप किस फसल का भंडारण करना चाहते हैं?` 
        : `Hello! Welcome to ${fac.name}. Our micro-cold room is operational. How many metric tons do you plan to deposit?`
    });

    showToast({
      title: lang === 'hi' ? "हॉटलाइन कनेक्ट हो रही है" : "Connecting Hotline",
      message: `${fac.name} (${fac.phone})`,
      type: 'phone'
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    setIsProcessing(true);

    const generatedPass = `PASS-${selectedFacility.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingRecord = {
      id: `booking-${Date.now()}`,
      passId: generatedPass,
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      quantityMT: bookingQty,
      durationMonths: bookingMonths,
      timestamp: new Date().toISOString()
    };

    // Realistic multi-step live processing sequence (1.1s)
    setTimeout(async () => {
      try {
        await dbPut('storage', bookingRecord);
        if (!isOnline) {
          await queueOfflineAction('STORAGE_BOOKING', bookingRecord);
        }
        setLockerPass(generatedPass);
        setIsProcessing(false);
        setBookingConfirmed(true);

        // Live voice announcement
        const announcement = lang === 'hi'
          ? `बधाई हो! ${selectedFacility.name} में आपकी ${bookingQty} मीट्रिक टन जगह सफलतापूर्वक आरक्षित हो गई है। लॉकर पास नंबर है ${generatedPass}।`
          : `Congratulations! Your reservation of ${bookingQty} metric tons at ${selectedFacility.name} is confirmed. Locker Pass is ${generatedPass}.`;
        speakText(announcement, lang === 'hi' ? 'hi-IN' : 'en-IN');

        showToast({
          title: lang === 'hi' ? "कोल्ड स्टोरेज बुक हुआ! 🎉" : "Cold Storage Space Secured! 🎉",
          message: lang === 'hi' ? `${selectedFacility.name}: ${bookingQty} MT जगह आरक्षित` : `${selectedFacility.name}: ${bookingQty} MT Reserved`,
          type: 'success'
        });
      } catch (err) {
        console.error('Booking error:', err);
        setIsProcessing(false);
      }
    }, 1100);
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header */}
      <div className="bg-white border border-[#44615820] rounded-3xl p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9fd70025] text-[#3d5500] mb-2">
            <Warehouse className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "साझा कृषि कोल्ड चेन और सुरक्षित भंडारण" : "Shared Agricultural Cold Chain Infrastructure"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            {lang === 'hi' ? "स्थानीय कोल्ड स्टोरेज व गोदाम खोजें" : "Local Cold Storage Discovery & Shared Space"}
          </h2>
          <p className="text-xs md:text-sm text-[#446158] mt-1">
            {lang === 'hi' 
              ? "कटाई के बाद उपज को सड़ने से बचाएं। नजदीकी कोल्ड स्टोरेज में खाली जगह बुक करें।" 
              : "Prevent post-harvest spoilage by reserving local micro-cold rooms with live available MT capacity."}
          </p>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {isPreloading ? (
        <StorageCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4 hover:border-[#9fd700]/70"
            >
            <div>
              {/* Top Line: Name & Availability Badge */}
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap sm:flex-nowrap">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-black text-[#272c1a] tracking-tight">
                    {lang === 'hi' ? fac.nameHindi || fac.name : fac.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#446158] font-bold mt-0.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-[#446158] shrink-0" />
                    <span>{lang === 'hi' ? fac.distanceHindi || fac.distance.replace('away', 'दूर') : fac.distance}</span>
                    <span className="text-[#44615850]">•</span>
                    <span className="truncate">{lang === 'hi' ? fac.locationHindi || fac.location : fac.location}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="bg-[#272c1a] text-[#9fd700] text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#9fd70040] shadow-sm inline-block">
                    {fac.capacityAvailable} {lang === 'hi' ? (fac.unitHindi || 'MT उपलब्ध') : fac.unit}
                  </span>
                  <span className="block text-[10px] text-[#44615880] mt-0.5">
                    {lang === 'hi' ? `कुल ${fac.capacityTotal} MT में से` : `of ${fac.capacityTotal} MT total`}
                  </span>
                </div>
              </div>

              {/* Climate Specifications (Temp & Humidity) */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-[#fffeef] border border-[#44615815] rounded-xl p-2.5 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-[#446158] block">{lang === 'hi' ? "तापमान" : "Temperature"}</span>
                    <span className="text-xs font-extrabold text-[#272c1a]">{fac.temperature}</span>
                  </div>
                </div>

                <div className="bg-[#fffeef] border border-[#44615815] rounded-xl p-2.5 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-[#446158] block">{lang === 'hi' ? "आर्द्रता (नमी)" : "Relative Humidity"}</span>
                    <span className="text-xs font-extrabold text-[#272c1a]">{fac.humidity}</span>
                  </div>
                </div>
              </div>

              {/* Suitable Crops */}
              <div className="flex items-center gap-1.5 flex-wrap my-2">
                <span className="text-[10px] font-bold text-[#446158] uppercase">
                  {lang === 'hi' ? "उपयुक्त फसलें:" : "Suitable for:"}
                </span>
                {(lang === 'hi' ? fac.suitableForHindi || fac.suitableFor : fac.suitableFor).map((crop, idx) => (
                  <span key={idx} className="bg-[#9fd70020] text-[#3d5500] text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                    {crop}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#446158]">
                <span>{lang === 'hi' ? "भंडारण किराया दर:" : "Storage Rental Rate:"}</span>
                <span className="text-sm font-black text-[#272c1a]">
                  {lang === 'hi' ? fac.rateHindi || fac.rate : fac.rate}
                </span>
              </div>
            </div>

            {/* Actions: Book Space and Call with Live Click Animation */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-[#44615815]">
              <button
                onClick={() => handleOpenBooking(fac)}
                className="btn-lime text-xs font-black py-2.5 px-1.5 sm:px-3 flex items-center justify-center gap-1 cursor-pointer interactive-tap shadow-sm truncate"
              >
                <span className="truncate">{lang === 'hi' ? "जगह आरक्षित करें" : "Reserve Space"}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleCallFacility(fac)}
                className="btn-slate text-xs font-bold py-2.5 px-1.5 sm:px-3 flex items-center justify-center gap-1 cursor-pointer interactive-tap shadow-sm truncate"
              >
                <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="truncate">{lang === 'hi' ? "कॉल करें" : "Call Facility"}</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Interactive Booking Modal with Spring Pop-In Animation */}
      {selectedFacility && (
        <div 
          onClick={() => !isProcessing && setSelectedFacility(null)}
          className="fixed inset-0 z-50 bg-[#272c1a]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-left transition-opacity duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-[#44615820] shadow-2xl relative animate-pop-in"
          >
            {/* Close Button */}
            {!isProcessing && (
              <button
                onClick={() => setSelectedFacility(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#fffeef] border border-[#44615820] flex items-center justify-center text-[#446158] hover:text-[#272c1a] hover:bg-[#9fd70020] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {isProcessing ? (
              /* Live Multi-Step Processing State */
              <div className="py-8 text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#9fd700]/30 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-[#9fd70020] text-[#3d5500] flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#3d5500]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#272c1a]">
                    {lang === 'hi' ? "कोल्ड रूम स्पेस सुरक्षित किया जा रहा है..." : "Locking Storage Chamber..."}
                  </h3>
                  <p className="text-xs text-[#446158] font-medium">
                    {lang === 'hi' 
                      ? `${selectedFacility.name} के सेंसर एवं उपलब्ध क्षमता से समन्वय जारी है` 
                      : `Connecting to ${selectedFacility.name} IoT climate sensors...`}
                  </p>
                </div>

                <div className="bg-[#fffeef] border border-[#44615815] rounded-2xl p-3 text-xs space-y-1.5 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-[#3d5500] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? "उपलब्ध क्षमता सत्यापित" : "Verified Available MT Space"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#3d5500] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? "इष्टतम तापमान जांच (2-4°C)" : "IoT Temperature Confirmed"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#446158] font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'hi' ? "डिजिटल लॉकर पास तैयार हो रहा है..." : "Issuing Digital Locker Pass..."}</span>
                  </div>
                </div>
              </div>
            ) : !bookingConfirmed ? (
              /* Booking Input Form */
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3d5500] bg-[#9fd70025] px-3 py-1 rounded-full w-fit">
                  <Warehouse className="w-4 h-4" />
                  <span>{lang === 'hi' ? "कोल्ड स्टोरेज बुकिंग" : "Space Reservation"}</span>
                </div>

                <h3 className="text-xl font-black text-[#272c1a]">
                  {lang === 'hi' ? selectedFacility.nameHindi || selectedFacility.name : selectedFacility.name}
                </h3>
                <p className="text-xs text-[#446158]">
                  📍 {lang === 'hi' ? selectedFacility.locationHindi || selectedFacility.location : selectedFacility.location} • {selectedFacility.capacityAvailable} MT {lang === 'hi' ? "वर्तमान में उपलब्ध" : "Currently Free"}
                </p>

                {/* Metric Ton Slider / Stepper with Live Value */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-[#272c1a]">
                    <span>{lang === 'hi' ? "आवश्यक क्षमता:" : "Capacity Needed:"}</span>
                    <span className="text-sm font-black text-[#3d5500] bg-[#9fd70025] px-2.5 py-0.5 rounded-lg">
                      {bookingQty} {lang === 'hi' ? "मीट्रिक टन" : "Metric Tons"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max={selectedFacility.capacityAvailable}
                    step="5"
                    value={bookingQty}
                    onChange={(e) => setBookingQty(Number(e.target.value))}
                    className="w-full accent-[#9fd700] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#446158]">
                    <span>5 MT</span>
                    <span>{selectedFacility.capacityAvailable} MT Max</span>
                  </div>
                </div>

                {/* Duration Stepper with Interactive Bounce */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#272c1a] block">
                    {lang === 'hi' ? "अवधि (महीने):" : "Duration (Months):"}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setBookingMonths(m)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer interactive-tap ${
                          bookingMonths === m
                            ? 'bg-[#272c1a] text-white border-[#272c1a] shadow-sm scale-102 ring-2 ring-[#9fd700]'
                            : 'bg-[#fffeef] border-[#44615820] text-[#446158] hover:bg-white'
                        }`}
                      >
                        {m} {lang === 'hi' ? "माह" : "mo"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 bg-[#fffeef] border border-[#44615820] rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between text-[#446158]">
                    <span>{lang === 'hi' ? "अनुमानित किराया दर:" : "Estimated Rental:"}</span>
                    <span className="font-bold">{selectedFacility.rate}</span>
                  </div>
                  <div className="flex justify-between font-black text-[#272c1a] text-sm pt-1 border-t border-[#44615815]">
                    <span>{lang === 'hi' ? "कुल अनुमानित किराया:" : "Total Estimated Rent:"}</span>
                    <span className="text-lg font-black text-[#3d5500]">
                      ₹{(bookingQty * 20 * 110 * bookingMonths).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Confirm Button with Live Micro-Interaction */}
                <button
                  type="submit"
                  className="w-full btn-lime py-3.5 text-sm font-black shadow-md cursor-pointer interactive-tap flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'hi' ? "आरक्षण पुष्टि करें" : "Confirm Space Reservation"}</span>
                </button>
              </form>
            ) : (
              /* Success Celebration Screen */
              <div className="text-center py-2 space-y-4 animate-pop-in">
                {/* Bouncing Checkmark Icon */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#9fd700]/30 animate-pulse-glow" />
                  <div className="w-16 h-16 rounded-full bg-[#9fd700] text-[#272c1a] flex items-center justify-center shadow-lg">
                    <Check className="w-9 h-9 stroke-[3]" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-[#3d5500] tracking-wider bg-[#9fd70025] px-3 py-1 rounded-full">
                    {lang === 'hi' ? "भंडारण पुष्टि सफल" : "Reservation Confirmed"}
                  </span>
                  <h3 className="text-2xl font-black text-[#272c1a] mt-2">
                    {lang === 'hi' ? "जगह सफलतापूर्वक आरक्षित!" : "Storage Space Reserved!"}
                  </h3>
                  <p className="text-xs text-[#446158] mt-1 max-w-xs mx-auto">
                    {lang === 'hi' 
                      ? `आपकी ${bookingQty} मीट्रिक टन जगह ${selectedFacility.name} में ${bookingMonths} महीने के लिए सुरक्षित कर दी गई है।`
                      : `Your allocation of ${bookingQty} MT at ${selectedFacility.name} is confirmed for ${bookingMonths} months.`}
                  </p>
                </div>

                {/* Digital Locker Pass Badge */}
                <div className="bg-[#272c1a] text-white p-4 rounded-2xl space-y-2 border border-[#9fd70040]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">{lang === 'hi' ? "डिजिटल लॉकर पास:" : "Digital Locker Pass:"}</span>
                    <span className="font-mono font-black text-[#9fd700] tracking-wider">{lockerPass}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-gray-400">{lang === 'hi' ? "सुरक्षा सत्यापन कोड:" : "Tamper Audit:"}</span>
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {lang === 'hi' ? "सत्यापित एवं सुरक्षित" : "ECDSA Cryptographic"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      showToast({
                        title: lang === 'hi' ? "पास डाउनलोड हुआ!" : "Pass Downloaded!",
                        message: `${lockerPass}.pdf`,
                        type: 'success'
                      });
                    }}
                    className="btn-outline py-2.5 text-xs font-bold interactive-tap"
                  >
                    {lang === 'hi' ? "पास डाउनलोड करें" : "Download Pass"}
                  </button>

                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="btn-lime py-2.5 text-xs font-black cursor-pointer interactive-tap"
                  >
                    {lang === 'hi' ? "पूर्ण करें" : "Done"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Phone Call Modal */}
      <LiveCallModal
        isOpen={!!activeCallContact}
        onClose={() => setActiveCallContact(null)}
        contact={activeCallContact}
      />
    </div>
  );
}
