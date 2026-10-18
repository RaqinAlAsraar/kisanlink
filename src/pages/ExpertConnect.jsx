import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UserCheck, Phone, MessageSquare, AlertTriangle, ShieldCheck, MapPin, Calendar, Clock, Check, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { speakText, stopSpeech } from '../services/speechService';
import LiveCallModal from '../components/common/LiveCallModal';

const EXPERTS = [
  {
    id: 'exp-1',
    name: 'Dr. Virendra Kumar',
    nameHindi: 'डॉ. वीरेन्द्र कुमार',
    title: 'Senior Plant Pathologist',
    titleHindi: 'वरिष्ठ पादप रोग विशेषज्ञ',
    org: 'Krishi Vigyan Kendra (KVK) Meerut',
    orgHindi: 'कृषि विज्ञान केंद्र (KVK) मेरठ',
    specialty: 'Fungal Blights, Rusts & Integrated Pest Management',
    specialtyHindi: 'झुलसा रोग, रतुआ एवं समन्वित कीट प्रबंधन',
    experience: '18 Years Experience',
    experienceHindi: '18 वर्षों का अनुभव',
    phone: '+91 94123 45678',
    availableHours: '9:00 AM - 6:00 PM',
    availableHoursHindi: 'सुबह 9:00 - शाम 6:00',
    rating: 4.9,
    reviews: 142
  },
  {
    id: 'exp-2',
    name: 'Dr. Sunita Sharma',
    nameHindi: 'डॉ. सुनीता शर्मा',
    title: 'District Horticulture Officer',
    titleHindi: 'जिला उद्यान अधिकारी',
    org: 'State Department of Agriculture, UP',
    orgHindi: 'कृषि विभाग, उत्तर प्रदेश सरकार',
    specialty: 'Solanaceous Crops (Tomato, Potato, Chilli) & Drip Fertigation',
    specialtyHindi: 'सब्जी फसलें (टमाटर, आलू, मिर्च) एवं ड्रिप सिंचाई',
    experience: '14 Years Experience',
    experienceHindi: '14 वर्षों का अनुभव',
    phone: '+91 98371 89012',
    availableHours: '10:00 AM - 5:00 PM',
    availableHoursHindi: 'सुबह 10:00 - शाम 5:00',
    rating: 4.8,
    reviews: 98
  },
  {
    id: 'exp-3',
    name: 'Er. Rajeshwar Pal',
    nameHindi: 'इंजी. राजेश्वर पाल',
    title: 'Soil & Organic Agronomist',
    titleHindi: 'मृदा एवं जैविक कृषि विशेषज्ञ',
    org: 'Sardar Vallabhbhai Patel University of Ag & Tech',
    orgHindi: 'सरदार वल्लभभाई पटेल कृषि एवं प्रौद्योगिकी विश्वविद्यालय',
    specialty: 'Bio-fungicides, Trichoderma & Crop Nutrition',
    specialtyHindi: 'जैविक फफूंदनाशी, ट्राइकोडर्मा एवं फसल पोषण',
    experience: '11 Years Experience',
    experienceHindi: '11 वर्षों का अनुभव',
    phone: '+91 97190 23456',
    availableHours: '8:00 AM - 7:00 PM',
    availableHoursHindi: 'सुबह 8:00 - शाम 7:00',
    rating: 4.7,
    reviews: 76
  }
];

export default function ExpertConnect() {
  const location = useLocation();
  const escalatedScan = location.state?.scan;
  const { lang, t } = useLanguage();
  const { showToast } = useToast();

  const [activeCallContact, setActiveCallContact] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [playingExpertId, setPlayingExpertId] = useState(null);

  const handleReadoutAll = () => {
    if (isPlayingAll) {
      stopSpeech();
      setIsPlayingAll(false);
      return;
    }

    setIsPlayingAll(true);
    const text = lang === 'hi'
      ? `कृषि विशेषज्ञ हेल्पलाइन: हमारे पास तीन प्रमाणित विशेषज्ञ उपलब्ध हैं। पहले डॉ. वीरेन्द्र कुमार, वरिष्ठ पादप रोग विशेषज्ञ, झुलसा व कीट प्रबंधन। दूसरे डॉ. सुनीता शर्मा, सब्जी फसल विशेषज्ञ। तीसरे इंजी. राजेश्वर पाल, जैविक खाद एवं फसल पोषण विशेषज्ञ। कॉल करने के लिए किसी भी विशेषज्ञ पर टैप करें।`
      : `Agronomist Directory: Certified experts are available. Dr. Virendra Kumar for plant diseases, Dr. Sunita Sharma for vegetable crops, and Er. Rajeshwar Pal for soil nutrition. Tap to call or chat on WhatsApp.`;
    
    speakText(text, lang === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => setIsPlayingAll(false), 9000);
  };

  const handleReadoutExpert = (exp) => {
    if (playingExpertId === exp.id) {
      stopSpeech();
      setPlayingExpertId(null);
      return;
    }

    setPlayingExpertId(exp.id);
    const text = lang === 'hi'
      ? `${exp.nameHindi}, ${exp.titleHindi}, ${exp.orgHindi}। विशेषज्ञता: ${exp.specialtyHindi}। उपलब्ध समय: ${exp.availableHoursHindi}। संपर्क: ${exp.phone}`
      : `${exp.name}, ${exp.title} at ${exp.org}. Specialty: ${exp.specialty}. Available ${exp.availableHours}. Phone: ${exp.phone}`;
    
    speakText(text, lang === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => setPlayingExpertId(null), 5000);
  };

  const handleCallExpert = (expert) => {
    const displayName = lang === 'hi' ? expert.nameHindi : expert.name;
    const displayTitle = lang === 'hi' ? expert.titleHindi : expert.title;
    const displayOrg = lang === 'hi' ? expert.orgHindi : expert.org;

    setActiveCallContact({
      name: displayName,
      title: displayTitle,
      org: displayOrg,
      phone: expert.phone,
      avatarLetter: displayName.split(' ')[1]?.[0] || 'D',
      greeting: lang === 'hi'
        ? `नमस्ते! मैं ${displayName} बोल रहा हूँ। आपकी फसल में कीट, फफूंद या झुलसा का क्या प्रभाव है? बताइए मैं समाधान सुझाता हूँ।`
        : `Hello! This is ${displayName}. I am here to help you treat your crop diseases and protect your harvest.`
    });

    showToast({
      title: lang === 'hi' ? "विशेषज्ञ से कॉल जुड़ रही है" : "Connecting to Agronomist",
      message: `${displayName} (${displayTitle})`,
      type: 'phone'
    });
  };

  const handleWhatsAppClick = (expert) => {
    const displayName = lang === 'hi' ? expert.nameHindi : expert.name;
    showToast({
      title: lang === 'hi' ? "व्हाट्सएप चैट शुरू हुई" : "WhatsApp Chat Initiated",
      message: `${displayName} (+91...)`,
      type: 'chat'
    });
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header */}
      <div className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9fd70025] text-[#3d5500] mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? "सरकारी केवीके एवं कृषि विश्वविद्यालय नेटवर्क" : "Govt KVK & University Extension Network"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#272c1a] tracking-tight">
            {lang === 'hi' ? "कृषि विशेषज्ञ से सीधा संपर्क" : "One-Tap Agronomist & Expert Consultation"}
          </h2>
          <p className="text-xs md:text-sm text-[#446158] mt-1">
            {lang === 'hi' 
              ? "फसल संकट, कीट और रोग प्रबंधन के लिए प्रमाणित कृषि वैज्ञानिकों एवं प्लांट डॉक्टरों से तुरंत जुड़ें।" 
              : "Connect immediately with certified agronomists and plant doctors for crop crisis management."}
          </p>
        </div>

        {/* Audio Listen Button with Sound Wave Animations */}
        <button
          onClick={handleReadoutAll}
          className={`btn-lime text-xs md:text-sm font-bold flex items-center justify-center gap-2 px-5 py-3 shadow-md shrink-0 cursor-pointer interactive-tap w-full md:w-auto ${
            isPlayingAll ? 'ring-4 ring-[#9fd70040]' : ''
          }`}
          title="Listen to Experts List"
        >
          {isPlayingAll ? (
            <div className="flex items-center gap-0.5 text-[#272c1a] h-4">
              <span className="sound-bar" />
              <span className="sound-bar" />
              <span className="sound-bar" />
            </div>
          ) : (
            <Volume2 className="w-4 h-4 fill-[#272c1a]" />
          )}
          <span>{lang === 'hi' ? (isPlayingAll ? "आवाज चल रही है..." : "विशेषज्ञ सूची सुनें") : (isPlayingAll ? "Playing..." : "Listen to Experts")}</span>
        </button>
      </div>

      {/* Escalated Scan Context Banner (If arrived from High Risk AI Scanner) */}
      {escalatedScan && (
        <div className="bg-[#272c1a] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-elevated border-2 border-red-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pop-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                {lang === 'hi' ? "सक्रिय फसल आपात स्थिति" : "Active Crop Emergency Case"}
              </span>
              <h3 className="text-base font-extrabold text-[#fffeef]">
                {escalatedScan.disease} ({escalatedScan.crop})
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                {escalatedScan.summary}
              </p>
            </div>
          </div>

          <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shrink-0 animate-pulse">
            {escalatedScan.riskLevel}
          </span>
        </div>
      )}

      {/* Expert Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPERTS.map((expert) => {
          const isPlayingThis = playingExpertId === expert.id;
          return (
            <div
              key={expert.id}
              className="bg-white border border-[#44615820] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4 hover:border-[#9fd700]/70"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#446158] text-[#9fd700] flex items-center justify-center font-black text-lg shadow-sm">
                    {lang === 'hi' ? (expert.nameHindi.split(' ')[1]?.[0] || expert.nameHindi[0]) : (expert.name.split(' ')[1]?.[0] || 'D')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#9fd70025] text-[#3d5500] text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#3d5500]" />
                      <span>{lang === 'hi' ? "सत्यापित केवीके विशेषज्ञ" : "Verified KVK Expert"}</span>
                    </span>
                    <button
                      onClick={() => handleReadoutExpert(expert)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer interactive-tap ${
                        isPlayingThis ? 'bg-[#9fd700] text-[#272c1a]' : 'text-[#446158] hover:text-[#272c1a] hover:bg-[#fffeef]'
                      }`}
                      title="Listen details"
                    >
                      {isPlayingThis ? (
                        <div className="flex items-center gap-0.5 h-3">
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                        </div>
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-[#272c1a]">
                  {lang === 'hi' ? expert.nameHindi : expert.name}
                </h3>
                <p className="text-xs font-bold text-[#446158]">
                  {lang === 'hi' ? expert.titleHindi : expert.title}
                </p>
                <p className="text-[11px] text-[#44615880] font-medium">
                  {lang === 'hi' ? expert.orgHindi : expert.org}
                </p>

                <div className="bg-[#fffeef] border border-[#44615815] rounded-2xl p-3 my-3 text-xs space-y-1">
                  <p className="font-bold text-[#272c1a]">
                    <span>{lang === 'hi' ? "विशेषज्ञता क्षेत्र: " : "Domain: "}</span>
                    <span className="font-medium text-[#446158]">
                      {lang === 'hi' ? expert.specialtyHindi : expert.specialty}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#446158] pt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {lang === 'hi' ? `उपलब्ध समय: ${expert.availableHoursHindi}` : `Available: ${expert.availableHours}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Contact Links with Live Call Modal trigger */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#44615815]">
                <button
                  type="button"
                  onClick={() => handleCallExpert(expert)}
                  className="btn-lime text-xs font-black py-2.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm interactive-tap"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'hi' ? "कॉल करें" : "Call Expert"}</span>
                </button>

                <a
                  href={`https://wa.me/${expert.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    lang === 'hi' 
                      ? `नमस्ते ${expert.nameHindi}, मैं किसानलिंक ऐप से अपनी फसल परामर्श के लिए संपर्क कर रहा हूँ।` 
                      : `Namaste ${expert.name}, I am seeking agronomic advice for my crop via KisanLink.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsAppClick(expert)}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer interactive-tap"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'hi' ? "व्हाट्सएप" : "WhatsApp"}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Phone Call Modal */}
      <LiveCallModal
        isOpen={!!activeCallContact}
        onClose={() => setActiveCallContact(null)}
        contact={activeCallContact}
      />
    </div>
  );
}
