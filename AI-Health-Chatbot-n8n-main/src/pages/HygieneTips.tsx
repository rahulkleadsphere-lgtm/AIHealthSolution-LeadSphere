import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Droplets, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MessageSquareText, 
  ChevronRight, 
  Flame, 
  Sparkles,
  Utensils,
  Bug,
  HeartPulse
} from "lucide-react";

export const HygieneTips: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);

  const handwashSteps = [
    { step: 1, title: "Palm to Palm", desc: "Wet hands with clean water and rub palms vigorously with soap." },
    { step: 2, title: "Back of Hands", desc: "Rub right palm over left dorsum with interlaced fingers and vice versa." },
    { step: 3, title: "Between Fingers", desc: "Interlace fingers palm-to-palm to scrub webs and interdigital spaces." },
    { step: 4, title: "Backs of Fingers", desc: "Opposing palms with fingers interlocked to scrub fingernail ridges." },
    { step: 5, title: "Rotational Thumbs", desc: "Clasp left thumb in right palm and rotate thoroughly, then reverse." },
    { step: 6, title: "Fingertips in Palm", desc: "Rotational rubbing backwards and forwards with clasped fingers in palm." },
    { step: 7, title: "Wrists & Rinsing", desc: "Rub wrists with opposite hand, rinse with running potable water, air dry." }
  ];

  const waterSafetyProtocols = [
    {
      title: "10-Minute Sustained Rolling Boil",
      desc: "Heat water until continuous rolling bubbles erupt and maintain for 10 full minutes to kill bacterial spores, cysts, and enteric viruses.",
      badge: "Gold Standard",
      icon: Flame
    },
    {
      title: "Narrow-Mouthed Storage Vessel",
      desc: "Store boiled water exclusively in covered brass, copper, or food-grade vessels fitted with a tap. Never dip fingers or unwashed cups.",
      badge: "Cross-Contamination Barrier",
      icon: ShieldCheck
    },
    {
      title: "Emergency Halazone / Chlorine Dosing",
      desc: "In flood zones, dissolve 1 standard 0.5 mg chlorine tablet per 5 liters of clear water and wait 30 minutes before consumption.",
      badge: "Emergency Protocol",
      icon: Droplets
    }
  ];

  const monsoonFoodRules = [
    { title: "Boil Milk Thoroughly", desc: "Always bring raw milk to a full boil before consumption." },
    { title: "Wash Vegetables in Salt Water", desc: "Soak leafy greens for 10 minutes in mild saline water to dislodge worm ova." },
    { title: "Reheat Leftovers Rapidly", desc: "Never eat food left uncovered at ambient room temperature for more than 2 hours." },
    { title: "Separate Raw & Cooked Utensils", desc: "Use distinct cutting boards and knives for raw poultry/meat and ready-to-eat salads." }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-10 pb-28 md:pb-16 animate-in fade-in duration-300">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          to="/health-hub" 
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Health Hub</span>
        </Link>

        <button
          onClick={() => navigate("/chat?query=How%20to%20prepare%20WHO%20ORS%20for%20severe%20dehydration")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
          <span>Ask AI Water Guide</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-cyan-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/15 backdrop-blur-md rounded-full border border-cyan-400/25 text-xs font-bold text-cyan-300">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Public Health Engineering & Enteric Disease Defense</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Pure Water & Barrier Sanitation.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Waterborne cholera, typhoid, and acute rotavirus transmission can be stopped through simple microbiologically verified boiling and standardized hand hygiene.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">WHO 7-Step Hand Scrub Technique</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">10-Minute Rolling Boil Standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* Water Safety Protocols */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Safe Domestic Water Purification</h2>
          <p className="text-xs text-slate-500 font-medium">Protect your family from seasonal diarrhea, hepatitis A, and typhoid</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {waterSafetyProtocols.map((protocol, idx) => {
            const Icon = protocol.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {protocol.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                    {protocol.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {protocol.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs font-bold text-cyan-700">
                  Standard Practice
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHO 7-Step Hand Hygiene Technique */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              WHO Standard 7-Step Hand Hygiene Technique
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Scrub hands with soap for at least 20 seconds before preparing food, before feeding children, and after using the latrine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {handwashSteps.map((step) => (
            <div 
              key={step.step}
              onClick={() => setActiveStep(step.step)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeStep === step.step 
                  ? "bg-cyan-50/80 border-cyan-300 shadow-md scale-102"
                  : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-xl bg-cyan-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                  {step.step}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step {step.step}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency ORS Home Recipe Box */}
      <section className="bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-teal-950">Emergency Home ORS Recipe (Oral Rehydration Solution)</h3>
            <p className="text-xs text-teal-800 font-medium">Life-saving hydration when pre-packaged WHO-ORS sachets are unavailable</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-teal-100 space-y-1">
            <span className="text-xs font-bold text-teal-600 block">Ingredient 1: Water</span>
            <p className="text-base font-black text-slate-900">1 Liter Clean Water</p>
            <p className="text-[11px] text-slate-500 font-medium">Boiled and cooled to room temperature</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-teal-100 space-y-1">
            <span className="text-xs font-bold text-teal-600 block">Ingredient 2: Sugar</span>
            <p className="text-base font-black text-slate-900">6 Level Teaspoons Sugar</p>
            <p className="text-[11px] text-slate-500 font-medium">Facilitates intestinal sodium absorption</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-teal-100 space-y-1">
            <span className="text-xs font-bold text-teal-600 block">Ingredient 3: Salt</span>
            <p className="text-base font-black text-slate-900">1/2 Level Teaspoon Salt</p>
            <p className="text-[11px] text-slate-500 font-medium">Restores cellular electrolyte balance</p>
          </div>
        </div>

        <p className="text-xs text-teal-900 font-medium pt-1">
          *Administer in small sips continuously. If child cannot retain fluids or appears drowsy, transport immediately to the nearest PHC or call 108.
        </p>
      </section>

      {/* Consult AI Assistant CTA */}
      <section className="bg-gradient-to-r from-cyan-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-cyan-500/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Have Questions About Safe Food or Water?</h3>
          <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed font-medium max-w-xl">
            Ask SevaSetu AI about water chlorination tablets, managing child diarrhea, or preventing mosquito breeding around your home.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat?query=Tell%20me%20how%20to%20prevent%20waterborne%20typhoid%20and%20diarrhea")}
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-cyan-900 hover:bg-cyan-50 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <MessageSquareText className="w-4 h-4 text-cyan-800" />
          <span>Consult AI Assistant</span>
        </button>
      </section>

    </div>
  );
};

export default HygieneTips;