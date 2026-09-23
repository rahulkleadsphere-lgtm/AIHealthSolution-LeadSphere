import React from "react";
import { toast } from "sonner";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Globe, CheckCircle2, Volume2, Sparkles, Languages } from "lucide-react";

const LanguageSettings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { name: "English", native: "English", code: "en" as Language },
    { name: "Hindi", native: "हिन्दी", code: "hi" as Language },
    { name: "Telugu", native: "తెలుగు", code: "te" as Language },
    { name: "Odia", native: "ଓଡିଆ", code: "or" as Language }
  ];

  const handleLanguageChange = (code: Language, name: string) => {
    setLanguage(code);
    toast.success(`Language changed to ${name}`);
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto w-full space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 backdrop-blur-md">
          <Languages className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Regional Empowerment</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter text-slate-800">
          Your Health in Your <span className="text-blue-600 italic underline decoration-blue-100 decoration-8 underline-offset-4">Language</span>.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl font-semibold leading-relaxed">
          Select the language you are most comfortable with. Our AI assistant will adapt its terminology and voice guidance.
        </p>
      </section>

      {/* Language Selection Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {languages.map((lang) => (
          <button 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code, lang.name)}
            className={`group relative flex flex-col items-start p-8 rounded-[40px] transition-all duration-500 border-2 active:scale-95 text-left ${
              language === lang.code 
                ? "bg-white border-blue-600 shadow-2xl shadow-blue-100 -translate-y-2" 
                : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            {language === lang.code && (
              <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
              language === lang.code ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
            }`}>
              <Globe className="w-7 h-7" />
            </div>

            <h3 className={`text-2xl font-black tracking-tighter mb-1 ${
              language === lang.code ? "text-slate-800" : "text-slate-500"
            }`}>
              {lang.native}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{lang.name}</p>
          </button>
        ))}
      </section>

      {/* Voice & Accessibility Bento */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black uppercase tracking-[0.3em] text-slate-400">Voice & AI Controls</h2>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black tracking-tight text-slate-800">Voice Guidance</h4>
              </div>
              <div className="w-14 h-8 bg-emerald-100 rounded-full p-1 relative flex items-center cursor-pointer shadow-inner">
                <div className="absolute right-1 w-6 h-6 bg-emerald-600 rounded-full shadow-lg"></div>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">AI will speak instructions and health insights in {languages.find(l => l.code === language)?.name}.</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black tracking-tight text-slate-800">Auto-Translation</h4>
              </div>
              <div className="w-14 h-8 bg-blue-100 rounded-full p-1 relative flex items-center cursor-pointer shadow-inner">
                <div className="absolute right-1 w-6 h-6 bg-blue-600 rounded-full shadow-lg"></div>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">Automatically translate medical reports and AI chat responses in real-time.</p>
          </div>
        </div>
      </section>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[48px] text-white shadow-2xl shadow-blue-100 relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-black tracking-tighter">Ready to start?</h3>
            <p className="font-semibold text-blue-100 max-w-sm">Experience the platform in your chosen language now.</p>
          </div>
          <Link to="/chat" className="px-10 py-5 bg-white text-blue-600 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all hover:bg-blue-50 flex items-center gap-3">
            Back to Health Chat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;

// Helper to fix the ArrowRight import error if any
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
