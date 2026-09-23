import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Heart, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Clock, 
  ArrowRight, 
  MessageSquareText, 
  ChevronRight, 
  Stethoscope, 
  FileText,
  Eye,
  Zap,
  TrendingDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PreventiveCare: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<"all" | "young" | "adult" | "senior">("all");

  const coreGuidelines = [
    {
      title: "Cardiovascular & Blood Pressure Defense",
      desc: "Maintain resting BP under 120/80 mmHg with under 2,000mg sodium daily and 30 mins brisk walking.",
      impact: "Reduces stroke & heart attack risk by 45%",
      icon: Heart,
      tag: "Cardiology",
      steps: ["Limit table salt to under 1 tsp per day", "Walk 5,000–8,000 steps daily", "Check BP bi-weekly if over 35"]
    },
    {
      title: "Metabolic & Blood Glucose Shield",
      desc: "Intercept pre-diabetes through whole grains, unpolished millets, and a 12-hour overnight digestive fast.",
      impact: "Reverses pre-diabetic insulin resistance",
      icon: Activity,
      tag: "Metabolism",
      steps: ["Replace white rice with ragi or foxtail millet", "Avoid refined sugar & sweet beverages", "Audit fasting sugar every 6 months"]
    },
    {
      title: "Circadian Rest & Stress Downregulation",
      desc: "7 to 8 hours of uninterrupted sleep to clear neural metabolic waste and normalize cortisol output.",
      impact: "Restores cellular repair & immune vigilance",
      icon: Zap,
      tag: "Neuro-Immunity",
      steps: ["Turn off screens 60 minutes before bedtime", "Consistent sleep-wake times 7 days a week", "10 minutes of deep breath relaxation"]
    },
    {
      title: "Toxin Elimination & Organ Protection",
      desc: "Zero tobacco and alcohol consumption to arrest chronic hepatic steatosis and oncological risks.",
      impact: "Eliminates #1 preventable cause of cancer",
      icon: TrendingDown,
      tag: "Oncology Defense",
      steps: ["Avoid all forms of beedi, gutkha, and tobacco", "Drink 2.5–3 liters of potable water daily", "Support family members in tobacco cessation"]
    }
  ];

  const screeningSchedules = [
    {
      ageGroup: "young",
      ageLabel: "Young Adults (18–35 Years)",
      tests: [
        { name: "Blood Pressure & Resting Pulse", frequency: "Every 1–2 Years", target: "< 120/80 mmHg" },
        { name: "Complete Blood Count (Hb)", frequency: "Annual (Women) / 2 Yrs", target: "Hb > 12.0 g/dL" },
        { name: "Body Mass Index (BMI)", frequency: "Every 6 Months", target: "18.5 – 22.9 kg/m² (Asian)" }
      ]
    },
    {
      ageGroup: "adult",
      ageLabel: "Mid-Adults (36–55 Years)",
      tests: [
        { name: "Fasting Blood Sugar & HbA1c", frequency: "Annual Screening", target: "Fasting < 100 mg/dL, HbA1c < 5.7%" },
        { name: "Lipid Profile (Cholesterol & Triglycerides)", frequency: "Every 2 Years", target: "LDL < 100 mg/dL, TG < 150 mg/dL" },
        { name: "Cervical / Breast Exam (Women)", frequency: "Every 3 Years", target: "Early detection screening" },
        { name: "Liver & Kidney Function Tests (LFT/KFT)", frequency: "Every 2 Years", target: "Baseline organ evaluation" }
      ]
    },
    {
      ageGroup: "senior",
      ageLabel: "Senior Citizens (56+ Years)",
      tests: [
        { name: "Monthly Blood Pressure & Heart Rate", frequency: "Monthly Home Audit", target: "< 130/80 mmHg" },
        { name: "Ophthalmic & Cataract Screening", frequency: "Annual Checkup", target: "Retinal check for diabetic retinopathy" },
        { name: "Bone Mineral Density (DEXA / Calcium)", frequency: "Every 2–3 Years", target: "Osteoporosis prevention" },
        { name: "Prostate / Colon Screening", frequency: "Annual Consult", target: "Early oncological evaluation" }
      ]
    }
  ];

  const filteredScreenings = selectedAgeGroup === "all" 
    ? screeningSchedules 
    : screeningSchedules.filter(s => s.ageGroup === selectedAgeGroup);

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
          onClick={() => navigate("/chat?query=Give%20me%20a%20personalized%20preventive%20healthcare%20checklist%20based%20on%20my%20age")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
          <span>Ask AI Checklist</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 backdrop-blur-md rounded-full border border-emerald-400/25 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>National Health Mission • Preventive Healthcare Framework</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Intercept Illness Before It Begins.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Up to 80% of cardiovascular disease, type 2 diabetes, and seasonal epidemics are preventable through standardized primary habits and timely diagnostic screening.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">ICMR-NIN Lifestyle Protocols</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">Age-Specific Checkup Timelines</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars of Prevention */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Four Pillars of Primary Prevention</h2>
            <p className="text-xs text-slate-500 font-medium">Daily actionable safeguards with verified clinical outcomes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coreGuidelines.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={i} 
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {pillar.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Clinical Impact</span>
                    <p className="text-xs font-bold text-emerald-950">{pillar.impact}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Daily Protocol</span>
                    {pillar.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Standard of Care</span>
                  <button
                    onClick={() => navigate(`/chat?query=Tell%20me%20more%20about%20${encodeURIComponent(pillar.title)}`)}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Ask AI Guide</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Routine Screening Audit by Age Group */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Recommended Routine Diagnostic Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Timetable for lab audits and clinical checks across life stages</p>
          </div>

          {/* Age Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setSelectedAgeGroup("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAgeGroup === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Ages
            </button>
            <button
              onClick={() => setSelectedAgeGroup("young")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAgeGroup === "young" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              18–35
            </button>
            <button
              onClick={() => setSelectedAgeGroup("adult")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAgeGroup === "adult" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              36–55
            </button>
            <button
              onClick={() => setSelectedAgeGroup("senior")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAgeGroup === "senior" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              56+
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredScreenings.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{group.ageLabel}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.tests.map((test, tIdx) => (
                  <div key={tIdx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{test.name}</h4>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                        {test.frequency}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Target:</span>
                      <span className="font-bold text-slate-700">{test.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consult AI Assistant CTA */}
      <section className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Need a Custom Preventive Health Assessment?</h3>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium max-w-xl">
            Input your age, family history, and lifestyle in the AI chat to generate a personalized health audit checklist.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat?query=Please%20conduct%20a%20preventive%20health%20audit%20for%20me")}
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <MessageSquareText className="w-4 h-4 text-emerald-800" />
          <span>Start Health Audit</span>
        </button>
      </section>

    </div>
  );
};

export default PreventiveCare;