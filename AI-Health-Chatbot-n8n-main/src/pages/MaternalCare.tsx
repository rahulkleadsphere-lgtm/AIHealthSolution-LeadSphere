import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Baby, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquareText, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Sparkles,
  PhoneCall,
  Pill,
  Award
} from "lucide-react";

export const MaternalCare: React.FC = () => {
  const navigate = useNavigate();
  const [activeVisit, setActiveVisit] = useState<number>(1);

  const ancVisits = [
    {
      visit: 1,
      timing: "Within 12 Weeks (1st Trimester)",
      title: "Registration & Baseline Screening",
      focus: "Registration on RCH portal, Mother-Child Protection (MCP) card issuance, baseline complete blood count, blood typing, Rh factor, syphilis/HIV testing, and 1st dose of Td vaccine."
    },
    {
      visit: 2,
      timing: "14 to 26 Weeks (2nd Trimester)",
      title: "Fetal Growth & Anemia Prevention",
      focus: "Blood pressure and urine protein check for early pre-eclampsia detection, initiation of daily Iron-Folic Acid (IFA) tablets (180 days), calcium supplementation, and anomaly ultrasound scan."
    },
    {
      visit: 3,
      timing: "28 to 34 Weeks (3rd Trimester)",
      title: "Gestational Diabetes & Rh Prophylaxis",
      focus: "Fetal presentation and heart rate audit, maternal hemoglobin check (target > 11.0 g/dL), gestational diabetes oral glucose tolerance test (OGTT), and Td 2nd dose."
    },
    {
      visit: 4,
      timing: "36 Weeks to Delivery",
      title: "Institutional Delivery Preparedness",
      focus: "Final birth plan identification of designated government hospital, emergency 108 ambulance contact, blood donor identification, and counseling on exclusive breastfeeding and Kangaroo Mother Care."
    }
  ];

  const maternalSupplements = [
    {
      name: "Iron-Folic Acid (IFA) Tablets",
      dose: "1 Red Tablet Daily for 180 Days",
      composition: "100 mg Elemental Iron + 500 mcg Folic Acid",
      rule: "Consume after a meal with lemon water. Never take alongside milk or tea.",
      icon: Pill
    },
    {
      name: "Calcium & Vitamin D3 Tablets",
      dose: "2 Tablets Daily (1,000 mg Total)",
      composition: "500 mg Elemental Calcium + 250 IU Vit-D3",
      rule: "Separate from IFA by at least 2 hours to avoid competitive absorption blocking.",
      icon: Pill
    },
    {
      name: "Albendazole Deworming",
      dose: "Single Dose (400 mg)",
      composition: "Administered in 2nd Trimester",
      rule: "Eliminates intestinal helminths that deplete maternal iron reserves.",
      icon: ShieldCheck
    }
  ];

  const dangerSigns = [
    "Vaginal bleeding or sudden discharge of clear watery fluid before full term.",
    "Severe persistent headache accompanied by blurred vision, facial swelling, or upper abdominal pain (Pre-eclampsia).",
    "High fever (> 101°F) accompanied by chills or foul-smelling vaginal discharge.",
    "Noticeable decrease or complete cessation of fetal movements over a 12-hour period.",
    "Convulsions, fits, or sudden loss of consciousness."
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
          onClick={() => navigate("/chat?query=Tell%20me%20about%20safe%20delivery%20benefits%20under%20Janani%20Suraksha%20Yojana")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-rose-700" />
          <span>Ask AI Delivery Guide</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/15 backdrop-blur-md rounded-full border border-rose-400/25 text-xs font-bold text-rose-300">
            <Baby className="w-3.5 h-3.5 text-rose-400" />
            <span>National Health Mission • Maternal & Neonatal Health Division</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Safe Motherhood & Newborn Care.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Comprehensive clinical protocols for the 4 mandatory antenatal visits, anemia eradication, institutional delivery incentives, and Kangaroo Mother Care.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Janani Suraksha Yojana Cash Benefit</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-slate-200">Free 108/102 Janani Express Ambulance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Mandatory Antenatal Care (ANC) Visits Timeline */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                The 4 Mandatory Antenatal Checkups (ANC)
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Standard Government of India clinical timetable for healthy pregnancy</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            {ancVisits.map(v => (
              <button
                key={v.visit}
                onClick={() => setActiveVisit(v.visit)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeVisit === v.visit ? "bg-white text-rose-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ANC {v.visit}
              </button>
            ))}
          </div>
        </div>

        {/* Selected ANC Card */}
        {(() => {
          const v = ancVisits.find(item => item.visit === activeVisit) || ancVisits[0];
          return (
            <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded">
                    Antenatal Visit #{v.visit}
                  </span>
                  <h3 className="text-lg font-extrabold text-rose-950 pt-1">{v.title}</h3>
                </div>
                <span className="text-xs font-bold text-rose-900 bg-white px-3 py-1 rounded-xl border border-rose-200 self-start sm:self-auto">
                  {v.timing}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {v.focus}
              </p>
            </div>
          );
        })()}
      </section>

      {/* Maternal Supplementation Grid */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Essential Maternal Micronutrient Regimen</h2>
          <p className="text-xs text-slate-500 font-medium">Provided free at all Primary Health Centres and Anganwadi centres</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {maternalSupplements.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Free at PHC
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {item.name}
                  </h3>
                  <div className="text-xs font-bold text-rose-700">{item.dose}</div>
                  <p className="text-[11px] text-slate-500 font-medium">{item.composition}</p>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {item.rule}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Risk Obstetric Danger Signs */}
      <section className="bg-rose-50/80 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-rose-950">High-Risk Obstetric Danger Signs Mandating 108 Emergency Call</h3>
            <p className="text-xs text-rose-800 font-medium">Do not wait for scheduled visits if any of the following occur:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
          {dangerSigns.map((sign, idx) => (
            <div key={idx} className="p-3.5 bg-white rounded-2xl border border-rose-100 flex items-start gap-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1.5"></span>
              <p className="text-xs text-rose-900 font-medium leading-relaxed">
                {sign}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rose-200">
          <span className="text-xs text-rose-950 font-bold">24x7 Free Ambulance Dispatch for Pregnant Women:</span>
          <a
            href="tel:108"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 108 Immediately</span>
          </a>
        </div>
      </section>

      {/* Consult AI Assistant CTA */}
      <section className="bg-gradient-to-r from-rose-800 via-pink-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-rose-500/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Need Maternal Guidance or Scheme Clarification?</h3>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed font-medium max-w-xl">
            Ask SevaSetu AI about Janani Suraksha Yojana cash vouchers, ultrasound dates, or proper Kangaroo Mother Care techniques.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat?query=Explain%20the%20benefits%20of%20Janani%20Suraksha%20Yojana%20and%20how%20to%20apply")}
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-rose-950 hover:bg-rose-50 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <MessageSquareText className="w-4 h-4 text-rose-800" />
          <span>Consult AI Assistant</span>
        </button>
      </section>

    </div>
  );
};

export default MaternalCare;
