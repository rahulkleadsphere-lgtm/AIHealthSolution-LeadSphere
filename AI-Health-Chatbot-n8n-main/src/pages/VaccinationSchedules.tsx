import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Syringe, 
  ArrowLeft, 
  Baby, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquareText, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Info,
  Heart
} from "lucide-react";

interface VaccineDose {
  name: string;
  timing: string;
  diseasesPrevented: string;
  route: string;
  notes: string;
}

interface VaccineCategory {
  id: string;
  title: string;
  badge: string;
  description: string;
  doses: VaccineDose[];
}

const VACCINE_SCHEDULES: VaccineCategory[] = [
  {
    id: "infants",
    title: "Infants (Birth to 1 Year)",
    badge: "Critical Window",
    description: "Core foundation vaccines administered during the most vulnerable neonatal and early infancy months.",
    doses: [
      {
        name: "BCG (Bacillus Calmette–Guérin)",
        timing: "At Birth (within 1 year)",
        diseasesPrevented: "Severe Childhood Tuberculosis & TB Meningitis",
        route: "Intra-dermal (Left Upper Arm)",
        notes: "Small papule forms in 3–4 weeks, leaving a permanent protective scar."
      },
      {
        name: "Hepatitis B Birth Dose",
        timing: "At Birth (within 24 hours)",
        diseasesPrevented: "Perinatal Hepatitis B Chronic Liver Infection",
        route: "Intra-muscular (Anterolateral Thigh)",
        notes: "Crucial within 24 hours to block transmission from mother."
      },
      {
        name: "OPV-0 (Oral Polio Vaccine)",
        timing: "At Birth (within first 15 days)",
        diseasesPrevented: "Poliomyelitis & Acute Flaccid Paralysis",
        route: "Oral (2 drops)",
        notes: "Provides initial mucosal gut immunity."
      },
      {
        name: "Pentavalent (1, 2, 3)",
        timing: "Weeks 6, 10, and 14",
        diseasesPrevented: "Diphtheria, Pertussis (Whooping Cough), Tetanus, Hep-B, Hib Meningitis",
        route: "Intra-muscular (Mid-thigh)",
        notes: "Combines 5 vital protections in 1 shot to minimize injections."
      },
      {
        name: "Rotavirus Vaccine (RVV)",
        timing: "Weeks 6, 10, and 14",
        diseasesPrevented: "Severe Rotaviral Dehydrating Diarrhea",
        route: "Oral (5 drops or 2.5 ml)",
        notes: "Greatly reduces infant hospitalization from acute diarrhea."
      },
      {
        name: "fIPV (Fractional Inactivated Polio)",
        timing: "Weeks 6 and 14",
        diseasesPrevented: "Systemic Poliovirus Invasions",
        route: "Intra-dermal (Right Upper Arm)",
        notes: "Boosts humoral immunity in synergy with oral drops."
      },
      {
        name: "Pneumococcal Conjugate (PCV)",
        timing: "Weeks 6, 14, and Booster at 9 Months",
        diseasesPrevented: "Streptococcus pneumoniae Pneumonia & Sepsis",
        route: "Intra-muscular",
        notes: "Shields against bacterial lung consolidations."
      },
      {
        name: "MR 1st Dose (Measles-Rubella)",
        timing: "Months 9 to 12",
        diseasesPrevented: "Measles (Khusra) and Congenital Rubella Syndrome",
        route: "Subcutaneous (Right Arm)",
        notes: "Accompanied by Vitamin A first dose (100,000 IU)."
      }
    ]
  },
  {
    id: "toddlers",
    title: "Toddlers & Young Children (1 to 5 Years)",
    badge: "Booster Phase",
    description: "Essential reinforcement boosters maintaining sustained antibodies as children expand community interaction.",
    doses: [
      {
        name: "MR 2nd Dose (Measles-Rubella)",
        timing: "Months 16 to 24",
        diseasesPrevented: "Secondary Breakout Measles & Rubella",
        route: "Subcutaneous",
        notes: "Completes lifelong defense against measles outbreaks."
      },
      {
        name: "DPT Booster 1",
        timing: "Months 16 to 24",
        diseasesPrevented: "Diphtheria, Pertussis, Tetanus Re-emergence",
        route: "Intra-muscular (Mid-thigh)",
        notes: "Sustains protective antitoxin titers against whooping cough."
      },
      {
        name: "OPV Booster",
        timing: "Months 16 to 24",
        diseasesPrevented: "Poliovirus Infection",
        route: "Oral (2 drops)",
        notes: "Given simultaneously with DPT booster."
      },
      {
        name: "Vitamin A Doses (2 to 9)",
        timing: "Every 6 Months up to 5 Years",
        diseasesPrevented: "Night Blindness, Keratomalacia & Immune Depletion",
        route: "Oral (200,000 IU each)",
        notes: "Administered biannually during national child health campaigns."
      },
      {
        name: "DPT Booster 2",
        timing: "At 5 to 6 Years",
        diseasesPrevented: "Late Childhood Diphtheria & Tetanus",
        route: "Intra-muscular (Upper Arm)",
        notes: "Required before school entry to preserve herd immunity."
      }
    ]
  },
  {
    id: "adolescents",
    title: "School Age & Adolescents (10 to 16 Years)",
    badge: "School Shield",
    description: "Protection against school-yard trauma, deep soil infections, and cervical oncogenic papillomaviruses.",
    doses: [
      {
        name: "Tetanus & adult Diphtheria (Td 10)",
        timing: "At 10 Years",
        diseasesPrevented: "Deep wound Tetanus and Respiratory Diphtheria",
        route: "Intra-muscular (Deltoid)",
        notes: "Replaces traditional TT to provide dual protection."
      },
      {
        name: "Tetanus & adult Diphtheria (Td 16)",
        timing: "At 16 Years",
        diseasesPrevented: "Traumatic Tetanus into Adulthood",
        route: "Intra-muscular (Deltoid)",
        notes: "Secures ten years of active anti-tetanus titers."
      },
      {
        name: "HPV Vaccine (Human Papillomavirus)",
        timing: "Ages 9 to 14 Years (Girls)",
        diseasesPrevented: "Cervical Cancer & Genital Warts",
        route: "Intra-muscular (2 doses, 6 mos apart)",
        notes: "Over 90% effective in eradicating high-risk oncogenic HPV 16/18."
      }
    ]
  },
  {
    id: "maternal",
    title: "Pregnant Women",
    badge: "Maternal & Neonatal",
    description: "Transplacental antibody transfer protecting both mother and newborn against fatal neonatal tetanus.",
    doses: [
      {
        name: "Td 1 (Tetanus & adult Diphtheria)",
        timing: "Early in Pregnancy (1st Trimester)",
        diseasesPrevented: "Maternal Sepsis & Neonatal Tetanus",
        route: "Intra-muscular (Upper Arm)",
        notes: "Administered as soon as pregnancy is verified."
      },
      {
        name: "Td 2",
        timing: "4 Weeks after Td 1",
        diseasesPrevented: "Complete Neonatal Tetanus Eradication",
        route: "Intra-muscular (Upper Arm)",
        notes: "Transfers maternal IgG across placenta to shield infant for first 3 months."
      },
      {
        name: "Td Booster",
        timing: "If 2 Td doses received in last 3 years",
        diseasesPrevented: "Tetanus & Diphtheria",
        route: "Intra-muscular",
        notes: "Only 1 booster required if interval between pregnancies is under 3 years."
      }
    ]
  },
  {
    id: "seniors",
    title: "Adults & Senior Citizens (60+ Years)",
    badge: "Healthy Aging",
    description: "Specialized adult immunization preventing secondary bacterial pneumonia, shingles, and seasonal flu.",
    doses: [
      {
        name: "Seasonal Influenza (Flu)",
        timing: "Annually (Before Monsoon / Winter)",
        diseasesPrevented: "Severe Viral Pneumonia & Flu Hospitalization",
        route: "Intra-muscular",
        notes: "Crucial for individuals with chronic diabetes, COPD, or asthma."
      },
      {
        name: "Pneumococcal Polysaccharide (PPSV23)",
        timing: "Age 65+ (or 50+ with comorbidity)",
        diseasesPrevented: "Invasive Pneumococcal Lung Disease & Bacteremia",
        route: "Intra-muscular",
        notes: "Provides multi-serotype shield against community-acquired pneumonia."
      },
      {
        name: "Td / Tdap Adult Booster",
        timing: "Every 10 Years",
        diseasesPrevented: "Adult Tetanus from Agricultural or Domestic Injuries",
        route: "Intra-muscular",
        notes: "Ensures unbroken wound protection throughout retirement years."
      }
    ]
  }
];

export const VaccinationSchedules: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("infants");

  const currentCategory = VACCINE_SCHEDULES.find(c => c.id === activeTab) || VACCINE_SCHEDULES[0];

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
          onClick={() => navigate("/chat?query=What%20vaccines%20does%20my%20child%20need%20right%20now")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
          <span>Ask AI About Vaccines</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 backdrop-blur-md rounded-full border border-blue-400/25 text-xs font-bold text-blue-300">
            <Syringe className="w-3.5 h-3.5 text-blue-400" />
            <span>Universal Immunization Programme (UIP) • Government of India</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Lifelong Immunity Timetable.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              All listed childhood vaccines are provided 100% free of charge at every government Primary Health Centre (PHC), Community Health Centre (CHC), and Anganwadi in India.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">12 Fatal Diseases Prevented</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">Free at All Block PHCs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {VACCINE_SCHEDULES.map((cat) => {
          const isSelected = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-102"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Schedule Table & Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {currentCategory.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {currentCategory.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">{currentCategory.description}</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            {currentCategory.doses.length} Recommended Doses
          </span>
        </div>

        {/* Doses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentCategory.doses.map((dose, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {dose.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dose.timing}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 shrink-0">
                    {dose.route}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Protects Against:</span>
                  <p className="text-xs font-bold text-slate-800">{dose.diseasesPrevented}</p>
                </div>

                <div className="text-xs text-slate-600 font-medium leading-relaxed">
                  <span className="font-bold text-slate-700">Clinical Protocol: </span>
                  {dose.notes}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Free at PHCs
                </span>
                <button
                  onClick={() => navigate(`/chat?query=Tell%20me%20about%20the%20${encodeURIComponent(dose.name)}%20vaccine`)}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Ask AI Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mother and Child Tracking Notice */}
      <section className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-950">Important: Mother & Child Protection (MCP) Card</h3>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Always carry your physical MCP card to every vaccination drive. If a scheduled dose is missed due to travel or mild illness, it does not need to be restarted from scratch. Visit your nearest Anganwadi or PHC immediately for catch-up immunization.
          </p>
        </div>
      </section>

      {/* Consult AI Assistant CTA */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Need Help With Your Child's Next Vaccine?</h3>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium max-w-xl">
            Ask SevaSetu AI when your baby is due for their next dose or ask about managing mild post-vaccine fever.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat?query=Help%20me%20calculate%20my%20baby's%20vaccination%20dates")}
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-800 hover:bg-blue-50 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <MessageSquareText className="w-4 h-4 text-blue-700" />
          <span>Check Vaccine Due Date</span>
        </button>
      </section>

    </div>
  );
};

export default VaccinationSchedules;