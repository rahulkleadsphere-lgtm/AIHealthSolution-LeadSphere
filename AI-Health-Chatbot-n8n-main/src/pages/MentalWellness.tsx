import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Brain, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquareText, 
  ChevronRight, 
  Zap, 
  Heart, 
  Moon,
  Wind
} from "lucide-react";

export const MentalWellness: React.FC = () => {
  const navigate = useNavigate();
  const [activeExercise, setActiveExercise] = useState<"478" | "box" | "anulom">("478");

  const breathingTechniques = {
    "478": {
      title: "4-7-8 Relaxing Breath (Vagal Nerve Down-Regulation)",
      purpose: "Slows racing heart rate, relieves panic, and induces parasympathetic deep relaxation.",
      steps: [
        "Inhale quietly through your nose for a count of 4 seconds.",
        "Hold your breath comfortably for a count of 7 seconds.",
        "Exhale completely through your mouth with a gentle whoosh for 8 seconds.",
        "Repeat for 4 full cycles morning and evening."
      ],
      timing: "4s Inhale • 7s Hold • 8s Exhale"
    },
    "box": {
      title: "Box Breathing (Tactical Focus & Anxiety Reset)",
      purpose: "Used by emergency first responders to regain cognitive control under severe stress.",
      steps: [
        "Inhale deeply through your nose for 4 seconds.",
        "Hold your breath with full lungs for 4 seconds.",
        "Exhale smoothly through your nose for 4 seconds.",
        "Hold your breath with empty lungs for 4 seconds.",
        "Repeat for 3 to 5 minutes."
      ],
      timing: "4s Inhale • 4s Hold • 4s Exhale • 4s Hold"
    },
    "anulom": {
      title: "Anulom-Vilom (Alternate Nostril Rhythmic Breathing)",
      purpose: "Harmonizes left and right brain hemispheres and reduces sympathetic nervous tension.",
      steps: [
        "Close right nostril with right thumb; inhale deeply through left nostril.",
        "Close left nostril with ring finger; exhale smoothly through right nostril.",
        "Inhale through right nostril, close right, and exhale through left nostril.",
        "Continue this rhythmic alternation for 5 to 10 minutes."
      ],
      timing: "Slow Rhythmic 5s Cycles"
    }
  };

  const sleepGuidelines = [
    {
      title: "60-Minute Screen Curfew",
      desc: "Blue light emitted from smartphones and television suppresses melatonin secretion, delaying deep slow-wave sleep.",
      icon: Moon
    },
    {
      title: "Fixed Circadian Schedule",
      desc: "Waking up and going to bed at the exact same hour every day entrains your body's master circadian pacemaker in the hypothalamus.",
      icon: Clock
    },
    {
      title: "Afternoon Caffeine Boundary",
      desc: "Caffeine has a half-life of 5 to 7 hours; avoid tea, coffee, and energy drinks after 3:00 PM to preserve sleep depth.",
      icon: Zap
    },
    {
      title: "Cool & Dark Sleep Environment",
      desc: "Core body temperature needs to drop by 1°C to initiate restorative delta sleep. Keep bedroom well-ventilated and dark.",
      icon: Wind
    }
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
          onClick={() => navigate("/chat?query=Guide%20me%20through%20a%205-minute%20stress%20reduction%20exercise")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-purple-600" />
          <span>Ask AI Calm Session</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-purple-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 backdrop-blur-md rounded-full border border-purple-400/25 text-xs font-bold text-purple-300">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Tele-MANAS & Clinical Neuro-Psychology Framework</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Mindfulness & Stress Regulation.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Practical, physiological techniques to down-regulate sympathetic cortisol, conquer anxiety, and restore restorative delta sleep architecture.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Tele-MANAS Helpline: 14416 (24/7 Toll-Free)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <Wind className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-200">Pranayama Autonomic Modulation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Breathwork Station */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Physiological Breathwork Station
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Select a protocol to inspect step-by-step parasympathetic modulation</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveExercise("478")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeExercise === "478" ? "bg-white text-purple-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              4-7-8 Relaxing
            </button>
            <button
              onClick={() => setActiveExercise("box")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeExercise === "box" ? "bg-white text-purple-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Box Breathing
            </button>
            <button
              onClick={() => setActiveExercise("anulom")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeExercise === "anulom" ? "bg-white text-purple-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Anulom-Vilom
            </button>
          </div>
        </div>

        {/* Active Breathing Protocol Card */}
        <div className="bg-purple-50/50 rounded-3xl border border-purple-100 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-purple-950">
                {breathingTechniques[activeExercise].title}
              </h3>
              <p className="text-xs text-purple-800 font-medium mt-0.5">
                {breathingTechniques[activeExercise].purpose}
              </p>
            </div>
            <span className="text-xs font-black text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200 self-start sm:self-auto shrink-0">
              {breathingTechniques[activeExercise].timing}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {breathingTechniques[activeExercise].steps.map((step, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-purple-100/80 flex items-start gap-3 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Circadian Rest & Sleep Architecture */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Evidence-Based Sleep Hygiene</h2>
          <p className="text-xs text-slate-500 font-medium">Standards to restore 7–8 hours of uninterrupted nocturnal recovery</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sleepGuidelines.map((guideline, idx) => {
            const Icon = guideline.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {guideline.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {guideline.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-purple-600">
                  Recommended Protocol
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* National Tele-MANAS Dedicated Card */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800/40">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-purple-200">
            <PhoneCall className="w-3.5 h-3.5 text-purple-300" />
            <span>Government of India National Mental Health Initiative</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Tele-MANAS 24/7 Helpline: 14416</h3>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-medium max-w-xl">
            Completely free, confidential psychological counseling available in 20+ Indian languages (Hindi, Odia, Telugu, Marathi, Tamil, Bengali, and English).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <a
            href="tel:14416"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Dial 14416 (Toll-Free)</span>
          </a>
          <button
            onClick={() => navigate("/chat?query=I%20am%20feeling%20overwhelmed%20and%20anxious%20can%20you%20help%20me")}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-white/20 flex items-center justify-center gap-2"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Chat With Seva AI</span>
          </button>
        </div>
      </section>

    </div>
  );
};

export default MentalWellness;
