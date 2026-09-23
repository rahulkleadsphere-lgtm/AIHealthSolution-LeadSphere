import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { 
  Heart, 
  Bot, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  HelpingHand,
  Menu, 
  X, 
  Sparkles, 
  ChevronDown, 
  Mic, 
  Camera, 
  Users, 
  TrendingUp, 
  Search, 
  DownloadCloud, 
  WifiOff,
  Building2,
  Pill,
  Activity,
  FileCheck,
  Layers,
  Lock,
  Database,
  MapPin,
  Volume2,
  Stethoscope,
  BadgeCheck,
  Award,
  Check,
  PhoneCall,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  CheckCheck
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>("all");
  const [activeBentoTab, setActiveBentoTab] = useState<"consult" | "scan" | "schemes">("consult");
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { installPrompt, isInstalled, handleInstall } = usePWAInstall();

  useEffect(() => {
    document.title = "SevaSetu AI | Healthcare Simplified for Bharat";
  }, []);

  const faqItems = [
    { 
      category: "privacy",
      q: "Is my medical data and voice consultation private?", 
      a: "Yes, 100%. SevaSetu AI adheres strictly to the Digital Personal Data Protection (DPDP) Act 2023 and the National Digital Health Mission (NDHM) guidelines. Consultations are analyzed in ephemeral memory with 256-bit encryption and are never sold or shared with commercial entities." 
    },
    { 
      category: "schemes",
      q: "How does the Government Scheme Wizard verify my eligibility?", 
      a: "Our automated wizard indexes over 40+ national and state health welfare programs (including Ayushman Bharat PM-JAY, RSBY, and state-specific trusts). By matching your district, income tier, and diagnosed condition, it computes exact eligibility and gives direct 1-click application links." 
    },
    { 
      category: "accuracy",
      q: "How accurate is the multimodal report interpretation?", 
      a: "Our Vision AI is tuned on clinical diagnostic standards (ICD-10, LOINC) to accurately parse blood parameters, radiological impressions, and doctor handwriting. It converts complex lab jargon into simplified, clear advice in your regional language. It serves as an assistive triage aid, not a clinical replacement for a doctor." 
    },
    { 
      category: "offline",
      q: "Does SevaSetu work without active internet in remote villages?", 
      a: "Yes. Our platform includes a 100% offline First-Aid Pocketbook operating via ServiceWorker caching. It provides instant emergency guidance for cardiac arrest, snake bites, heatstroke, and maternal labor even in zero-network rural zones." 
    },
    { 
      category: "generics",
      q: "How do I find Jan Aushadhi generic medicines near me?", 
      a: "SevaSetu incorporates real-time indexing of 1,900+ Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) generic salts and 10,000+ Kendras nationwide. You can search any branded medicine (e.g. Augmentin, Telma, Glycomet) to immediately see the 70%–90% cheaper generic equivalent and nearby kendra locations." 
    }
  ];

  const filteredFaqs = activeFaqCategory === "all" 
    ? faqItems 
    : faqItems.filter(item => item.category === activeFaqCategory);

  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-900 min-h-screen overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      
      {/* ========================================================= */}
      {/* 0. PREMIUM TOP NAVIGATION BAR                             */}
      {/* ========================================================= */}
      <nav className="fixed top-0 w-full z-[100] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[28px] px-6 py-3.5 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/app-icon.png" 
                alt="SevaSetu AI" 
                className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-blue-100 group-hover:scale-105 transition-transform" 
              />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                SevaSetu<span className="text-blue-600">AI</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-wider text-slate-500">
              <a href="#about" className="hover:text-blue-600 transition-colors">Ecosystem</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#surveillance" className="hover:text-blue-600 transition-colors">District Radar</a>
              <a href="#testimonials" className="hover:text-blue-600 transition-colors">Citizen Voices</a>
              <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
              
              {installPrompt && !isInstalled && (
                <button 
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  Install App
                </button>
              )}

              {/* Language Switcher Pill */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['en', 'hi', 'te', 'or'] as const).map((lang) => (
                  <button 
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                      language === lang 
                        ? "bg-white text-blue-600 shadow-2xs" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to={user ? "/dashboard" : "/login"} 
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-200 active:scale-95 transition-all"
              >
                {user ? "Open Dashboard" : "Get Started"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              <button 
                className="lg:hidden p-2.5 bg-slate-100 text-slate-700 rounded-xl active:scale-90 transition-transform"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] bg-white flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img src="/app-icon.png" alt="SevaSetu AI" className="w-9 h-9 rounded-xl" />
              <span className="text-xl font-black text-slate-900">SevaSetu AI</span>
            </div>
            <button 
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex flex-col gap-5 py-8">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-slate-800">Ecosystem</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-slate-800">How it Works</a>
            <a href="#surveillance" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-slate-800">District Radar</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-slate-800">Citizen Stories</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-slate-800">FAQ</a>
            <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-blue-600">Consult AI</Link>
            <Link to="/schemes" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-emerald-600">Govt Schemes</Link>
            <Link to="/offline-first-aid" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-amber-600">Offline Pocketbook</Link>
          </div>
          
          <div className="space-y-3">
            <Link 
              to={user ? "/dashboard" : "/login"} 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-center text-sm shadow-lg shadow-blue-200 block"
            >
              {user ? "Go to Dashboard" : "Get Started Now"}
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HERO SECTION (PRESERVED & INTEGRATED AS REQUESTED)        */}
      {/* ========================================================= */}
      <section className="pt-28 md:pt-36 pb-16 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 animate-in slide-in-from-left-6 duration-700">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50/80 backdrop-blur-md rounded-full border border-blue-100 text-blue-700 shadow-sm">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bharat Health AI OS v2.0</span>
              </div>
              <Link to="/offline-first-aid" className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-800 text-[10px] font-bold transition-colors">
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>100% Offline First-Aid Mode</span>
              </Link>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Healthcare, <br/>
              <span className="text-blue-600 underline decoration-blue-200 decoration-4 underline-offset-4">Simplified</span> for Bharat.
            </h1>
            
            <p className="text-sm md:text-base lg:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Empowering 800M+ citizens across rural India with conversational symptom analysis, instant government scheme eligibility, and multimodal report scanning in regional languages.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link to="/chat" className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 active:scale-95 transition-all group">
                <MessageSquare className="w-4 h-4" />
                <span>{user ? "Go to Consultation" : "Talk to Seva AI"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/schemes" className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 hover:border-blue-500 hover:text-blue-600 px-7 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Scheme Wizard</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`/avatar-${i}.png`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-500 leading-tight">
                Trusted by <br/>
                <span className="text-slate-900 font-black text-sm">15,000+ Rural Families</span>
              </p>
            </div>
          </div>

          <div className="relative group">
             <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative">
                <img 
                  src="/hero-bg.png" 
                  alt="Rural Healthcare" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
             </div>
             
             {/* Floating Mini Highlight Card */}
             <div className="absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[220px] hidden sm:block">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Schemes Active</span>
                </div>
                <p className="text-sm font-black text-slate-800">Ayushman Bharat PM-JAY</p>
                <p className="text-[10px] text-slate-400 font-medium">₹5 Lakh Cashless Coverage</p>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 1. SOVEREIGN TRUST & NATIONAL ARCHITECTURE TRUST STRIP    */}
      {/* ========================================================= */}
      <section className="py-10 px-4 md:px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            Architected on India's Sovereign Digital Health Stack & Open Clinical Standards
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
            <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">ABDM Compliant</p>
                <p className="text-[10px] font-bold text-slate-400">NHA Ayushman Bharat</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
              <Pill className="w-5 h-5 text-amber-600" />
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">PMBJP Generic</p>
                <p className="text-[10px] font-bold text-slate-400">1,900+ Jan Aushadhi</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">30,273 Facilities</p>
                <p className="text-[10px] font-bold text-slate-400">Sub-50ms Geo Radius</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
              <Lock className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">DPDP Act 2023</p>
                <p className="text-[10px] font-bold text-slate-400">Zero Commercial Sharing</p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all">
              <Globe className="w-5 h-5 text-rose-600" />
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">Multilingual Voice</p>
                <p className="text-[10px] font-bold text-slate-400">Hindi • Telugu • Odia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. THE CORE CLINICAL TRIAD (MASTERWORK BENTO ECOSYSTEM)   */}
      {/* ========================================================= */}
      <section id="about" className="py-24 px-4 md:px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Comprehensive Bharat Care Stack
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Designed for Human Simplicity, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                  Engineered with Clinical Precision.
                </span>
              </h2>
            </div>
            <p className="text-slate-500 font-semibold text-sm max-w-md">
              Each capability solves a life-critical barrier in rural healthcare delivery: linguistic alienation, diagnostic illiteracy, and predatory out-of-pocket medical expenses.
            </p>
          </div>

          {/* Master Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Conversational AI Triage (Spans 8 cols) */}
            <div className="lg:col-span-8 bg-white p-7 sm:p-9 rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Mic className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                    Voice & Multilingual AI
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Natural Symptom Triage in Your Mother Tongue
                  </h3>
                  <p className="text-sm text-slate-500 font-semibold mt-1.5 leading-relaxed max-w-2xl">
                    Speak naturally in Hindi, Telugu, Odia, Marathi, or English. Seva AI converts conversational rural phrasing into structured clinical triage with differential diagnosis and urgency scoring.
                  </p>
                </div>
              </div>

              {/* Interactive Mock Chat Pill */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
                    P
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                    "2 din se tez bukhar hai aur badan dard kar raha hai... kya karun?"
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
                    AI
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs font-medium text-emerald-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">Triage: Moderate (Level 3)</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Monsoon Fever Protocol</span>
                    </div>
                    <p>Paracetamol 650mg is safe. Maintain hydration with ORS. If temperature exceeds 102°F or rashes appear, visit your nearest Civil Hospital for a Dengue platelet test.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link to="/chat" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                  Start Interactive Consultation
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] font-bold text-slate-400">Zero Subscription Fees</span>
              </div>
            </div>

            {/* Bento Card 2: Multimodal Scan Vision (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                    Vision OCR & AI
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Instant Diagnostic Document Scanner
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 leading-relaxed">
                    Snap a photo of blood test panels, doctor prescriptions, or radiology X-rays. Complex Latin terminology is decoded into clear action items.
                  </p>
                </div>
              </div>

              {/* Mini Biomarker Preview Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Hemoglobin (Hb)</span>
                  <span className="text-emerald-600">13.8 g/dL (Normal)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Fasting Glucose</span>
                  <span className="text-blue-600">98 mg/dL (Optimal)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Chest X-Ray</span>
                  <span className="text-slate-500">PA View Clear</span>
                </div>
              </div>

              <Link to="/analysis" className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                Scan Report Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bento Card 3: Jan Aushadhi Generic Savings (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Pill className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    PMBJP Savings
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Generic Medicine Price Comparator
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 leading-relaxed">
                    Instantly replace overpriced branded drugs with certified Pradhan Mantri Jan Aushadhi generic salts at 70% to 90% discount.
                  </p>
                </div>
              </div>

              {/* Price Delta Card */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 line-through">Augmentin 625 Duo: ₹204</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">PMBJP: ₹54</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span>Patient Savings: 74%</span>
                  <span className="text-amber-700">10,000+ Kendras</span>
                </div>
              </div>

              <Link to="/health-directory" className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                Find Jan Aushadhi Kendras
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bento Card 4: Welfare Scheme Wizard (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <HelpingHand className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Sovereign Welfare
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Government Welfare Scheme Wizard
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 leading-relaxed">
                    Check immediate eligibility for Ayushman Bharat (PM-JAY), Janani Suraksha, and state trusts with zero middleman commissions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                <p className="text-xs font-bold text-emerald-950">Ayushman Bharat PM-JAY</p>
                <p className="text-[11px] text-emerald-800 font-medium">₹5,00,000 cashless secondary & tertiary hospital treatment per family/year.</p>
              </div>

              <Link to="/schemes" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                Run Scheme Eligibility Check
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bento Card 5: Offline First-Aid Pocketbook (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <WifiOff className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    100% Offline
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Offline Emergency First-Aid Pocketbook
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 leading-relaxed">
                    Critical trauma protocols cached directly on your phone storage. Works without cellular towers or Wi-Fi connectivity.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
                <p className="text-xs font-bold text-rose-950">Snake Bite & Cardiac Arrest Guides</p>
                <p className="text-[11px] text-rose-800 font-medium">Step-by-step visual resuscitation instructions available offline 24/7.</p>
              </div>

              <Link to="/offline-first-aid" className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                Open Offline Pocketbook
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THE 3-STEP CLINICAL JOURNEY (HOW IT WORKS)             */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 px-4 md:px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Instant 3-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              From Symptom to Sovereign Care in Minutes
            </h2>
            <p className="text-slate-500 font-semibold text-sm sm:text-base">
              No complex forms, no medical jargon, and zero waiting rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Voice or Photo Input",
                desc: "Send a voice recording in Hindi, Telugu, Odia, or English, or snap a photo of any diagnostic blood test or prescription.",
                icon: Mic,
                tag: "Any Dialect",
                accent: "blue"
              },
              {
                step: "02",
                title: "Deep Clinical Synthesis",
                desc: "Our neural triage engine cross-references clinical guidelines, flags abnormal biomarkers, and maps generic medicine substitutes.",
                icon: Bot,
                tag: "Clinical AI",
                accent: "indigo"
              },
              {
                step: "03",
                title: "Verified Action & Welfare",
                desc: "Get an actionable summary with nearest empanelled hospitals, matched government subsidies, and 1-click consultation briefs.",
                icon: ShieldCheck,
                tag: "Direct Access",
                accent: "emerald"
              }
            ].map((st, i) => (
              <div 
                key={i} 
                className="p-8 rounded-[32px] bg-slate-50 border border-slate-200/90 shadow-2xs hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black font-mono text-slate-300 group-hover:text-blue-600 transition-colors">
                      {st.step}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                      {st.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs group-hover:scale-105 transition-transform">
                    <st.icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{st.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Seamless Execution</span>
                  <CheckCheck className="w-4 h-4 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. DISTRICT HEALTH MONITORING & EPIDEMIOLOGY RADAR        */}
      {/* ========================================================= */}
      <section id="surveillance" className="py-24 px-4 md:px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Community Surveillance Network
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              District Epidemiological Protection
            </h2>
            <p className="text-slate-500 font-semibold text-sm sm:text-base">
              Anonymous, aggregated health insights notifying public health officers of seasonal outbreaks before they spread.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Controls & Highlights */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Proactive Disease Outbreak Interception
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Every voice query and report analysis automatically and anonymously contributes to an early-warning telemetry cluster map.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    title: "Predictive Seasonal Spikes",
                    desc: "AI forecasts vector-borne surges like Dengue, Malaria, and Chikungunya weeks ahead of hospitalization peaks.",
                    icon: Zap,
                    accent: "rose"
                  },
                  {
                    title: "Emergency Broadcast Dispatch",
                    desc: "Instant SMS/WhatsApp advisories dispatched to registered panchayats during heatwaves or water contamination.",
                    icon: PhoneCall,
                    accent: "blue"
                  },
                  {
                    title: "Hospital Bed Availability Telemetry",
                    desc: "Sub-50ms query radius over 30,273 public facilities to redirect trauma admissions to capable emergency centers.",
                    icon: Building2,
                    accent: "emerald"
                  }
                ].map((feat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{feat.title}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual Simulation Canvas */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[36px] border border-slate-200/90 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Live District Radar</h4>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Western & Eastern Zones
                </span>
              </div>

              {/* Map Canvas Card */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1200&q=80" 
                  alt="Telemetry Radar" 
                  className="w-full h-full object-cover opacity-40 grayscale"
                />
                
                {/* Radar Beacons */}
                <div className="absolute top-1/3 left-1/3 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 border-2 border-rose-500 animate-pulse flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-rose-600"></div>
                  </div>
                  <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-rose-300 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    Thane / Kalyan: Monsoon Fever
                  </span>
                </div>

                <div className="absolute bottom-1/4 right-1/3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-blue-300 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    Pune: Normal Baseline
                  </span>
                </div>
              </div>

              {/* District Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total Facilities</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">30,273</p>
                  <p className="text-[11px] font-bold text-emerald-600 mt-0.5">National Hospital DB</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400">Query Latency</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">&lt; 50 ms</p>
                  <p className="text-[11px] font-bold text-blue-600 mt-0.5">Qdrant Vector Hybrid</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400">Panchayats Monitored</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">1,240+</p>
                  <p className="text-[11px] font-bold text-purple-600 mt-0.5">Active Surveillance</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. VOICES OF BHARAT (PATIENT & WORKER TESTIMONIALS)        */}
      {/* ========================================================= */}
      <section id="testimonials" className="py-24 px-4 md:px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Verified Clinical Impact
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Voices of Bharat
            </h2>
            <p className="text-slate-500 font-semibold text-sm sm:text-base">
              Real accounts from rural families, community ASHA workers, and public hospital physicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: "Suresh Patil", 
                role: "Farmer, Badlapur, Maharashtra", 
                tag: "Saved ₹1,20,000 on Surgery",
                text: "I was told my cardiac stenting would cost my entire annual crop savings. Seva AI checked my ration card and matched me to Ayushman Bharat PM-JAY. The entire surgery was performed 100% cashless at an empanelled trust hospital.", 
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              },
              { 
                name: "Anita Deshmukh", 
                role: "ASHA Community Worker, Pune Rural", 
                tag: "Assisted 240+ Villagers",
                text: "Explaining complex blood panels to elderly villagers was difficult. Now I snap a photo using SevaSetu, and it gives me immediate Marathi voice summaries that villagers understand and follow without fear.", 
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
              },
              { 
                name: "Dr. Vinay Kulkarni", 
                role: "PHC Medical Officer, Thane District", 
                tag: "Early Dengue Interception",
                text: "The localized surveillance telemetry alerted us to a cluster of thrombocytopenia queries 10 days before standard laboratory registers caught it. We mobilized fogging and hydration drives before it became an epidemic.", 
                avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
              }
            ].map((t, i) => (
              <div 
                key={i} 
                className="p-7 sm:p-8 rounded-[32px] bg-slate-50 border border-slate-200/90 shadow-2xs hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    {t.tag}
                  </span>
                  
                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-200/70">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 border border-white shadow-sm shrink-0">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{t.name}</h4>
                    <p className="text-xs font-semibold text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FREQUENTLY ASKED QUESTIONS (INTERACTIVE ACCORDION)     */}
      {/* ========================================================= */}
      <section id="faq" className="py-24 px-4 md:px-6 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              Help Center & Common Queries
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 font-semibold text-sm">
              Clear, transparent answers regarding privacy, data ownership, scheme eligibility, and clinical accuracy.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Questions" },
              { id: "privacy", label: "Data & Privacy" },
              { id: "schemes", label: "Government Schemes" },
              { id: "accuracy", label: "AI & Clinical Scope" },
              { id: "offline", label: "Offline Mode" },
              { id: "generics", label: "Jan Aushadhi" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFaqCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFaqCategory === cat.id
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 bg-slate-100/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900"
                >
                  <span>{item.q}</span>
                  <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-transform shrink-0 ${
                    openFaq === i ? "rotate-180 text-blue-600 bg-blue-50" : ""
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {openFaq === i && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 mt-1">
                    <p className="pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. SOVEREIGN CROWN CALL TO ACTION                         */}
      {/* ========================================================= */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl space-y-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-blue-300 border border-white/20 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Cost • 100% Sovereign Impact
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Health Sovereignty for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Indian Citizen</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                No paywalls, no predatory advertising, and no data harvesting. Experience personalized clinical guidance in your native tongue today.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link 
                to="/chat" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Start Free Consultation
              </Link>

              <Link 
                to="/schemes" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
              >
                <HelpingHand className="w-4 h-4" />
                Check Govt Schemes
              </Link>
            </div>

            {/* Emergency Hotline Banner */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                National Ambulance: <a href="tel:108" className="text-white hover:underline font-bold">108</a> (Toll-Free 24/7)
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                National Health Helpline: <a href="tel:1075" className="text-white hover:underline font-bold">1075</a>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. MASTERWORK CLINICAL FOOTER                             */}
      {/* ========================================================= */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/app-icon.png" 
                  alt="SevaSetu AI" 
                  className="w-10 h-10 rounded-2xl object-contain shadow-sm" 
                />
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  SevaSetu<span className="text-blue-600">AI</span>
                </span>
              </div>
              <p className="max-w-md text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                Democratizing high-tier clinical intelligence and welfare access across rural Bharat. Multilingual voice triage, offline emergency guides, and Ayushman Bharat synchronization.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ABDM Gateway v2.0
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  256-Bit Encrypted
                </span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">Clinical Platform</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><Link to="/chat" className="hover:text-blue-600 transition-colors">AI Health Consultation</Link></li>
                <li><Link to="/vitals" className="hover:text-blue-600 transition-colors">Vitals & Biometrics Studio</Link></li>
                <li><Link to="/vault" className="hover:text-blue-600 transition-colors">Personal Health Vault</Link></li>
                <li><Link to="/analysis" className="hover:text-blue-600 transition-colors">Diagnostic Vision Scanner</Link></li>
                <li><Link to="/offline-first-aid" className="hover:text-blue-600 transition-colors">Offline Pocketbook</Link></li>
              </ul>
            </div>

            {/* Welfare & Directory Column */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">Bharat Welfare</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><Link to="/schemes" className="hover:text-blue-600 transition-colors">Govt Scheme Wizard</Link></li>
                <li><Link to="/health-directory" className="hover:text-blue-600 transition-colors">Jan Aushadhi Kendras</Link></li>
                <li><Link to="/health-directory" className="hover:text-blue-600 transition-colors">National Hospital Directory</Link></li>
                <li><Link to="/health-calendar" className="hover:text-blue-600 transition-colors">Public Health Calendar</Link></li>
                <li><Link to="/helplines" className="hover:text-blue-600 transition-colors">Emergency Helplines</Link></li>
              </ul>
            </div>

            {/* Legal & Emergency Disclosures */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">Emergency & Safety</h4>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs space-y-1">
                <p className="font-extrabold text-rose-900">National Emergency Dispatch</p>
                <p className="text-rose-700 font-medium">Dial 108 for immediate ambulance dispatch anywhere in India.</p>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed pt-1">
                Educational clinical AI triage aid. Does not substitute for emergency medical diagnosis by licensed physicians.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
            <p>© 2026 SevaSetu Health Systems. Social impact initiative for Bharat.</p>
            <div className="flex items-center gap-6">
              <Link to="/profile" className="hover:text-slate-600 transition-colors">Personal Settings</Link>
              <Link to="/helplines" className="hover:text-slate-600 transition-colors">Support & Helplines</Link>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600 font-bold">All Systems Operational</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
