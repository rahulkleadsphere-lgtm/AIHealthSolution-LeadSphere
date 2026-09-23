import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "or" | "te";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Brand
    "app.name": "SevaSetu AI",
    "app.tagline": "AI Health Assistant",

    // Navigation
    "nav.home": "Home",
    "nav.chat": "Live Chat",
    "nav.reports": "AI Report Hub",
    "nav.schemes": "Govt Schemes",
    "nav.appointments": "Appointments",
    "nav.healthhub": "Health Hub",
    "nav.language": "Regional Language",
    "nav.settings": "Personal Settings",
    "nav.help": "Help Center",
    "nav.install": "Install App",
    
    // UI Elements
    "ui.search.placeholder": "Search symptoms, doctors or health schemes...",
    "ui.emergency": "Emergency",
    "ui.emergency.desc": "Dial 108 immediately for ambulance services",
    "ui.call.now": "Call Now",
    "ui.gold.member": "Gold Member",
    "ui.main.menu": "Main Menu",
    "ui.support.care": "Support & Care",
    "ui.thinking": "Seva AI is thinking...",
    "ui.type.question": "Type your health question here...",
    "ui.listen": "Listen",
    "ui.listening": "Listening...",

    // Header
    "govt.odisha": "Government of Odisha",
    "health.welfare": "Health & Family Welfare",
    
    // Home Page
    "official.portal": "OFFICIAL GOVERNMENT PORTAL",
    "digital.health.assistant": "Your Digital Health Assistant",
    "govt.description": "Government of Odisha - Department of Health & Family Welfare",
    "health.guidance.desc": "Get instant health guidance, vaccination schedules, and preventive care information in your preferred language.",
    "start.health.chat": "Start Health Chat",
    "health.awareness.hub": "Health Awareness Hub",
    "emergency.contact": "Emergency Contact",
    "citizens.helped": "Citizens Helped",
    "health.queries.resolved": "Health Queries Resolved",
    "languages.supported": "Languages Supported",
    "key.features": "Key Features",
    "multilingual.support": "Multilingual Support",
    "multilingual.desc": "Available in English, Hindi, and Odia",
    "ai.health.assistant": "AI Health Assistant",
    "ai.assistant.desc": "24/7 intelligent health guidance",
    "emergency.services": "Emergency Services",
    "emergency.desc": "Quick access to health centers",
    
    // Chat Page
    "health.assistant.chat": "Health Assistant Chat",
    "odisha.health.assistant": "Odisha Health Assistant",
    "type.health.question": "Type your health question here...",
    "get.health.alerts": "Get Health Alerts",
    "quick.links": "Quick Links",
    "health.department": "Health Department",
    "hello.assistant": "Hello! I'm your health assistant. How can I help you today?",
    
    // Footer
    "govt.copyright": "© 2025 Government of Odisha - Health & Family Welfare Department",
    "technical.support": "For technical support: health.support@odisha.gov.in | Emergency: 108",
    
    // Suggestions
    "chat.welcome": "Namaste! I am Seva Assistant. How are you feeling today?",
    "chat.suggest.fever": "I have a fever",
    "chat.suggest.schemes": "Verify schemes",
    "chat.suggest.doctor": "Book doctor"
  },
  
  hi: {
    // Brand
    "app.name": "सेवासेतु AI",
    "app.tagline": "AI स्वास्थ्य सहायक",

    // Navigation
    "nav.home": "मुख्य पृष्ठ",
    "nav.chat": "लाइव चैट",
    "nav.reports": "AI रिपोर्ट हब",
    "nav.schemes": "सरकारी योजनाएं",
    "nav.appointments": "अपॉइंटमेंट",
    "nav.healthhub": "स्वास्थ्य केंद्र",
    "nav.language": "क्षेत्रीय भाषा",
    "nav.settings": "व्यक्तिगत सेटिंग्स",
    "nav.help": "सहायता केंद्र",
    "nav.install": "ऐप इंस्टॉल करें",
    
    // UI Elements
    "ui.search.placeholder": "लक्षण, डॉक्टर या योजनाओं को खोजें...",
    "ui.emergency": "आपातकालीन",
    "ui.emergency.desc": "एम्बुलेंस सेवाओं के लिए तुरंत 108 डायल करें",
    "ui.call.now": "अभी कॉल करें",
    "ui.gold.member": "स्वर्ण सदस्य",
    "ui.main.menu": "मुख्य मेनू",
    "ui.support.care": "सहायता और देखभाल",
    "ui.thinking": "सेवा AI सोच रहा है...",
    "ui.type.question": "यहाँ अपना स्वास्थ्य प्रश्न लिखें...",
    "ui.listen": "सुनें",
    "ui.listening": "सुन रहा हूँ...",

    // Header
    "govt.odisha": "ओडिशा सरकार",
    "health.welfare": "स्वास्थ्य एवं परिवार कल्याण",
    
    // Home Page
    "official.portal": "आधिकारिक सरकारी पोर्टल",
    "digital.health.assistant": "आपका डिजिटल स्वास्थ्य सहायक",
    "govt.description": "ओडिशा सरकार - स्वास्थ्य एवं परिवार कल्याण विभाग",
    "health.guidance.desc": "अपनी पसंदीदा भाषा में तत्काल स्वास्थ्य मार्गदर्शन, टीकाकरण कार्यक्रम और निवारक देखभाल की जानकारी प्राप्त करें।",
    "start.health.chat": "स्वास्थ्य चैट शुरू करें",
    "health.awareness.hub": "स्वास्थ्य जागरूकता केंद्र",
    "emergency.contact": "आपातकालीन संपर्क",
    "citizens.helped": "नागरिकों की सहायता की गई",
    "health.queries.resolved": "स्वास्थ्य प्रश्न हल किए गए",
    "languages.supported": "समर्थित भाषाएं",
    "key.features": "मुख्य विशेषताएं",
    "multilingual.support": "बहुभाषी सहायता",
    "multilingual.desc": "अंग्रेजी, हिंदी और उड़िया में उपलब्ध",
    "ai.health.assistant": "AI स्वास्थ्य सहायक",
    "ai.assistant.desc": "24/7 बुद्धिमान स्वास्थ्य मार्गदर्शन",
    "emergency.services": "आपातकालीन सेवाएं",
    "emergency.desc": "स्वास्थ्य केंद्रों तक त्वरित पहुंच",
    
    // Chat Page
    "health.assistant.chat": "स्वास्थ्य सहायक चैट",
    "odisha.health.assistant": "ओडिशा स्वास्थ्य सहायक",
    "type.health.question": "यहाँ अपना स्वास्थ्य प्रश्न लिखें...",
    "get.health.alerts": "स्वास्थ्य अलर्ट प्राप्त करें",
    "quick.links": "त्वरित लिंक",
    "health.department": "स्वास्थ्य विभाग",
    "hello.assistant": "नमस्ते! मैं आपका स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    
    // Footer
    "govt.copyright": "© 2025 ओडिशा सरकार - स्वास्थ्य एवं परिवार कल्याण विभाग",
    "technical.support": "तकनीकी सहायता के लिए: health.support@odisha.gov.in | आपातकाल: 108",
    
    // Suggestions
    "chat.welcome": "नमस्ते! मैं आपका सेवा सहायक हूँ। आज आप कैसा महसूस कर रहे हैं?",
    "chat.suggest.fever": "मुझे बुखार है",
    "chat.suggest.schemes": "योजनाओं की जांच करें",
    "chat.suggest.doctor": "डॉक्टर बुक करें"
  },
  
  or: {
    // Brand
    "app.name": "ସେବାସେତୁ AI",
    "app.tagline": "AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ",

    // Navigation
    "nav.home": "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    "nav.chat": "ଲାଇଭ୍ ଚାଟ୍",
    "nav.reports": "AI ରିପୋର୍ଟ ହବ୍",
    "nav.schemes": "ସରକାରୀ ଯୋଜନା",
    "nav.appointments": "ନିଯୁକ୍ତି",
    "nav.healthhub": "ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର",
    "nav.language": "ଆଞ୍ଚଳିକ ଭାଷା",
    "nav.settings": "ବ୍ୟକ୍ତିଗତ ସେଟିଂସ",
    "nav.help": "ସାହାଯ୍ୟ କେନ୍ଦ୍ର",
    "nav.install": "ଆପ୍ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ",
    
    // UI Elements
    "ui.search.placeholder": "ଲକ୍ଷଣ, ଡାକ୍ତର କିମ୍ବା ଯୋଜନା ଖୋଜନ୍ତୁ...",
    "ui.emergency": "ଜରୁରୀକାଳୀନ",
    "ui.emergency.desc": "ଆମ୍ବୁଲାନ୍ସ ସେବା ପାଇଁ ତୁରନ୍ତ 108 ଡାଏଲ୍ କରନ୍ତୁ",
    "ui.call.now": "କଲ୍ କରନ୍ତୁ",
    "ui.gold.member": "ଗୋଲ୍ଡ ମେମ୍ବର",
    "ui.main.menu": "ମୁଖ୍ୟ ମେନୁ",
    "ui.support.care": "ସହାୟତା ଓ ଯତ୍ନ",
    "ui.thinking": "ସେବା AI ଚିନ୍ତା କରୁଛି...",
    "ui.type.question": "ଏଠାରେ ଆପଣଙ୍କର ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...",
    "ui.listen": "ଶୁଣନ୍ତୁ",
    "ui.listening": "ଶୁଣୁଛି...",

    // Header
    "govt.odisha": "ଓଡ଼ିଶା ସରକାର",
    "health.welfare": "ସ୍ୱାସ୍ଥ୍ୟ ଓ ପରିବାର କଲ୍ୟାଣ",
    
    // Home Page
    "official.portal": "ସରକାରୀ ପୋର୍ଟାଲ୍",
    "digital.health.assistant": "ଆପଣଙ୍କର ଡିଜିଟାଲ୍ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ",
    "govt.description": "ଓଡ଼ିଶା ସରକାର - ସ୍ୱାସ୍ଥ୍ୟ ଓ ପରିବାର କଲ୍ୟାଣ ବିଭାଗ",
    "health.guidance.desc": "ଆପଣଙ୍କର ପସନ୍ଦିତ ଭାଷାରେ ତୁରନ୍ତ ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ, ଟୀକାକରଣ କାର୍ଯ୍ୟସୂଚୀ ଏବଂ ପ୍ରତିରୋଧମୂଳକ ଯତ୍ନ ସୂଚନା ପାଆନ୍ତୁ।",
    "start.health.chat": "ସ୍ୱାସ୍ଥ୍ୟ ଚାଟ୍ ଆରମ୍ଭ କରନ୍ତୁ",
    "health.awareness.hub": "ସ୍ୱାସ୍ଥ୍ୟ ସଚେତନତା କେନ୍ଦ୍ର",
    "emergency.contact": "ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ",
    "citizens.helped": "ନାଗରିକମାନଙ୍କୁ ସାହାଯ୍ୟ କରାଯାଇଛି",
    "health.queries.resolved": "ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନର ସମାଧାନ",
    "languages.supported": "ସମର୍ଥିତ ଭାଷାଗୁଡ଼ିକ",
    "key.features": "ମୁଖ୍ୟ ବିଶେଷତା",
    "multilingual.support": "ବହୁଭାଷୀ ସମର୍ଥନ",
    "multilingual.desc": "ଇଂରାଜୀ, ହିନ୍ଦୀ ଏବଂ ଉଡ଼ିଆରେ ଉପଲବ୍ଧ",
    "ai.health.assistant": "AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ",
    "ai.assistant.desc": "24/7 ବୁଦ୍ଧିମାନ ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ",
    "emergency.services": "ଜରୁରୀକାଳୀନ ସେବା",
    "emergency.desc": "ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରଗୁଡ଼ିକରେ ଶୀଘ୍ର ପହଞ୍ଚିବା",
    
    // Chat Page
    "health.assistant.chat": "ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ ଚାଟ୍",
    "odisha.health.assistant": "ଓଡ଼ିଶା ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ",
    "type.health.question": "ଏଠାରେ ଆପଣଙ୍କର ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...",
    "get.health.alerts": "ସ୍ୱାସ୍ଥ୍ୟ ସତର୍କତା ପାଆନ୍ତୁ",
    "quick.links": "ଶୀଘ୍ର ଲିଙ୍କ",
    "health.department": "ସ୍ୱାସ୍ଥ୍ୟ ବିଭାଗ",
    "hello.assistant": "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    
    // Footer
    "govt.copyright": "© 2025 ଓଡ଼ିଶା ସରକାର - ସ୍ୱାସ୍ଥ୍ୟ ଓ ପରିବାର କଲ୍ୟାଣ ବିଭାଗ",
    "technical.support": "ବୈଷୟିକ ସହାୟତା ପାଇଁ: health.support@odisha.gov.in | ଜରୁରୀକାଳ: 108",
    
    // Suggestions
    "chat.welcome": "ନମସ୍କାର! ମୁଁ ଆଞ୍ଚଳିକ ସେବା ସହାୟକ। ଆପଣ ଆଜି କିପରି ଅନୁଭବ କରୁଛନ୍ତି?",
    "chat.suggest.fever": "ମୋର ଜ୍ୱର ହେଉଛି",
    "chat.suggest.schemes": "ଯୋଜନା ଯାଞ୍ଚ କରନ୍ତୁ",
    "chat.suggest.doctor": "ଡାକ୍ତର ବୁକ୍ କରନ୍ତୁ"
  },

  te: {
    // Brand
    "app.name": "సేవాసేతు AI",
    "app.tagline": "AI ఆరోగ్య సహాయకుడు",

    // Navigation
    "nav.home": "హోమ్",
    "nav.chat": "లైవ్ చాట్",
    "nav.reports": "AI రిపోర్ట్ హబ్",
    "nav.schemes": "ప్రభుత్వ పథకాలు",
    "nav.appointments": "అపాయింట్‌మెంట్లు",
    "nav.healthhub": "ఆరోగ్య కేంద్రం",
    "nav.language": "ప్రాంతీయ భాష",
    "nav.settings": "వ్యక్తిగత సెట్టింగ్‌లు",
    "nav.help": "సహాయ కేంద్రం",
    "nav.install": "యాప్ ఇన్‌స్టాల్ చేయండి",
    
    // UI Elements
    "ui.search.placeholder": "లక్షణాలు, వైద్యులు లేదా పథకాలను శోధించండి...",
    "ui.emergency": "అత్యవసర పరిస్థితి",
    "ui.emergency.desc": "అంబులెన్స్ సేవల కోసం వెంటనే 108 కు డయల్ చేయండి",
    "ui.call.now": "ఇప్పుడే కాల్ చేయండి",
    "ui.gold.member": "గోల్డ్ మెంబర్",
    "ui.main.menu": "ప్రధాన మెనూ",
    "ui.support.care": "మద్దతు & సంరక్షణ",
    "ui.thinking": "సేవా AI ఆలోచిస్తోంది...",
    "ui.type.question": "మీ ఆరోగ్య ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
    "ui.listen": "వినండి",
    "ui.listening": "వింటోంది...",

    // Header
    "govt.odisha": "ఆరోగ్య & కుటుంబ సంక్షేమం",
    "health.welfare": "ప్రజారోగ్య విభాగం",
    
    // Home Page
    "official.portal": "అధికారిక ఆరోగ్య పోర్టల్",
    "digital.health.assistant": "మీ డిజిటల్ ఆరోగ్య సహాయకుడు",
    "govt.description": "ఆరోగ్య & కుటుంబ సంక్షేమ విభాగం",
    "health.guidance.desc": "మీకు నచ్చిన భాషలో తక్షణ ఆరోగ్య సలహా, టీకా షెడ్యూల్‌లు మరియు సంరక్షణ సమాచారాన్ని పొందండి.",
    "start.health.chat": "ఆరోగ్య చాట్ ప్రారంభించండి",
    "health.awareness.hub": "ఆరోగ్య అవగాహన కేంద్రం",
    "emergency.contact": "అత్యవసర సంప్రదింపు",
    "citizens.helped": "సహాయం పొందిన పౌరులు",
    "health.queries.resolved": "పరిష్కరించబడిన ఆరోగ్య సమస్యలు",
    "languages.supported": "మద్దతు ఉన్న భాషలు",
    "key.features": "ముఖ్య ఫీచర్లు",
    "multilingual.support": "బహుభాషా మద్దతు",
    "multilingual.desc": "ఇంగ్లీష్, హిందీ, తెలుగు మరియు ఒడియాలో అందుబాటులో ఉంది",
    "ai.health.assistant": "AI ఆరోగ్య సహాయకుడు",
    "ai.assistant.desc": "24/7 తెలివైన ఆరోగ్య మార్గదర్శకత్వం",
    "emergency.services": "అత్యవసర సేవలు",
    "emergency.desc": "ఆరోగ్య కేంద్రాలకు శీఘ్ర ప్రవేశం",
    
    // Chat Page
    "health.assistant.chat": "ఆరోగ్య సహాయక చాట్",
    "odisha.health.assistant": "సేవా ఆరోగ్య సహాయకుడు",
    "type.health.question": "మీ ఆరోగ్య ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
    "get.health.alerts": "ఆరోగ్య హెచ్చరికలను పొందండి",
    "quick.links": "త్వరిత లింకులు",
    "health.department": "ఆరోగ్య విభాగం",
    "hello.assistant": "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
    
    // Footer
    "govt.copyright": "© 2025 ఆరోగ్య & కుటుంబ సంక్షేమ విభాగం",
    "technical.support": "సాంకేతిక సహాయం కోసం: health.support@sevasetu.in | అత్యవసరం: 108",
    
    // Suggestions
    "chat.welcome": "నమస్కారం! నేను సేవా అసిస్టెంట్‌ని. ఈ రోజు మీరు ఎలా భావిస్తున్నారు?",
    "chat.suggest.fever": "నాకు జ్వరం ఉంది",
    "chat.suggest.schemes": "పథకాలను సరిచూడండి",
    "chat.suggest.doctor": "డాక్టర్‌ని బుక్ చేయండి"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferred-language") as Language;
    if (savedLang && ["en", "hi", "or", "te"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};