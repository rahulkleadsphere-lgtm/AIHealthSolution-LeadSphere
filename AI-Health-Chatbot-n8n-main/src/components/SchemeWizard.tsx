import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  PhoneCall, 
  Users, 
  Coins, 
  HeartHandshake 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EligibleScheme {
  id: string;
  name: string;
  coverage: string;
  state: string;
  summary: string;
  documents: string[];
  helpline: string;
  applyUrl: string;
}

export const SchemeWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState("All-India");
  const [age, setAge] = useState<number>(35);
  const [rationCard, setRationCard] = useState("BPL");
  const [income, setIncome] = useState("under_1lakh");
  const [condition, setCondition] = useState("general");
  const [results, setResults] = useState<EligibleScheme[] | null>(null);

  const calculateEligibility = () => {
    const matches: EligibleScheme[] = [];

    // 1. Ayushman Bharat PM-JAY (Central)
    if (rationCard === "BPL" || rationCard === "AAY" || income === "under_1lakh" || income === "1_to_3lakh") {
      matches.push({
        id: "pmjay",
        name: "Ayushman Bharat (PM-JAY)",
        coverage: "₹5,00,000 Cashless Hospitalization per Family",
        state: "National / Central Govt",
        summary: "World's largest health assurance scheme providing free secondary and tertiary care in 28,000+ empanelled hospitals across India.",
        documents: ["Aadhaar Card", "Ration Card (BPL/AAY)", "Mobile Linked to Aadhaar"],
        helpline: "14555",
        applyUrl: "https://setu.pmjay.gov.in"
      });
    }

    // 2. Senior Citizens 70+ (Universal Ayushman Vay Vandana)
    if (age >= 70) {
      matches.push({
        id: "senior_70",
        name: "Ayushman Vay Vandana Scheme (Senior Citizens 70+)",
        coverage: "₹5,00,000 Dedicated Top-up Coverage",
        state: "National / Central Govt",
        summary: "Universal healthcare coverage for all citizens aged 70 and above, regardless of family income or economic status.",
        documents: ["Aadhaar Card showing age 70+", "Active Mobile Number"],
        helpline: "14555",
        applyUrl: "https://beneficiary.nha.gov.in"
      });
    }

    // 3. State Specific: Odisha BSKY / Biju Swasthya Kalyan
    if (state === "Odisha" || state === "All-India") {
      if (rationCard === "BPL" || rationCard === "AAY" || income === "under_1lakh") {
        matches.push({
          id: "bsky",
          name: "Biju Swasthya Kalyan Yojana (BSKY - Odisha)",
          coverage: "₹10,00,000 (Women) / ₹5,00,000 (General)",
          state: "Odisha State",
          summary: "Flagship health scheme covering secondary and tertiary healthcare in premier private and govt hospitals for NFSA/SFSA cardholders.",
          documents: ["BSKY Smart Health Card / NFSA Ration Card", "Aadhaar Card"],
          helpline: "104",
          applyUrl: "https://bsky.odisha.gov.in"
        });
      }
    }

    // 4. State Specific: Maharashtra MJPJAY
    if (state === "Maharashtra" || state === "All-India") {
      if (rationCard === "BPL" || rationCard === "AAY" || income === "under_1lakh" || income === "1_to_3lakh") {
        matches.push({
          id: "mjpjay",
          name: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
          coverage: "₹5,00,000 Cashless Cover for 1,356 Procedures",
          state: "Maharashtra",
          summary: "Provides cashless medical & surgical treatment through empanelled hospitals for yellow, orange ration card holders.",
          documents: ["Yellow/Orange Ration Card", "Aadhaar / Voter ID", "Doctor Recommendation"],
          helpline: "1800-120-8040",
          applyUrl: "https://www.jeevandayee.gov.in"
        });
      }
    }

    // 5. State Specific: AP / Telangana Aarogyasri
    if (state === "Andhra Pradesh" || state === "Telangana" || state === "All-India") {
      matches.push({
        id: "aarogyasri",
        name: "Dr. YSR Aarogyasri / Telangana Aarogyasri",
        coverage: "₹5,00,000 Cashless Medical & Surgical Coverage",
        state: "Andhra Pradesh & Telangana",
        summary: "End-to-end cashless treatment for lower and middle income families holding Rice / White ration cards.",
        documents: ["White Ration Card", "Aadhaar Card", "Income Certificate"],
        helpline: "104",
        applyUrl: "https://aarogyasri.telangana.gov.in"
      });
    }

    // 6. State Specific: Tamil Nadu CMCHIS
    if (state === "Tamil Nadu" || state === "All-India") {
      if (income === "under_1lakh" || rationCard === "BPL" || rationCard === "AAY") {
        matches.push({
          id: "cmchis",
          name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS - Tamil Nadu)",
          coverage: "₹5,00,000 Cashless Hospitalization per Family/Year",
          state: "Tamil Nadu",
          summary: "Cashless coverage for 1,090 surgical & medical procedures including tertiary care in both govt and private empanelled hospitals.",
          documents: ["Smart Ration Card", "Aadhaar Card", "Village Administrative Officer (VAO) Income Certificate"],
          helpline: "1800-425-3993",
          applyUrl: "https://cmchistn.com"
        });
      }
    }

    // 7. State Specific: Rajasthan MAAY (Chiranjeevi)
    if (state === "Rajasthan" || state === "All-India") {
      matches.push({
        id: "maay",
        name: "Mukhyamantri Ayushman Arogya Yojana (MAAY - Chiranjeevi)",
        coverage: "₹25,00,000 Universal Family Health Insurance",
        state: "Rajasthan",
        summary: "India's highest state health cover providing cashless hospitalization up to ₹25 Lakhs per family across empanelled hospitals.",
        documents: ["Jan Aadhaar Card", "Aadhaar Card"],
        helpline: "181",
        applyUrl: "https://health.rajasthan.gov.in"
      });
    }

    // 8. State Specific: West Bengal Swasthya Sathi
    if (state === "West Bengal" || state === "All-India") {
      matches.push({
        id: "swasthya_sathi",
        name: "Swasthya Sathi Scheme (West Bengal)",
        coverage: "₹5,00,000 Smart Card Cashless Cover",
        state: "West Bengal",
        summary: "Universal basic health coverage issued in the name of the female head of the family, covering secondary and tertiary care.",
        documents: ["Swasthya Sathi Smart Card / Khadya Sathi Card", "Aadhaar Card"],
        helpline: "1800-345-5384",
        applyUrl: "https://swasthyasathi.gov.in"
      });
    }

    // 9. State Specific: Karnataka AB-ArK
    if (state === "Karnataka" || state === "All-India") {
      matches.push({
        id: "ab_ark",
        name: "Ayushman Bharat - Arogya Karnataka (AB-ArK)",
        coverage: "₹5,00,000 (BPL) / 30% Subsidy (APL)",
        state: "Karnataka",
        summary: "Integrated health assurance scheme providing catastrophic illness treatment across government and private network hospitals.",
        documents: ["Aadhaar Card", "BPL/NFSA Ration Card"],
        helpline: "104",
        applyUrl: "https://arogya.karnataka.gov.in"
      });
    }

    // 10. State Specific: Uttar Pradesh MMJAY
    if (state === "Uttar Pradesh" || state === "All-India") {
      if (rationCard === "BPL" || rationCard === "AAY" || income === "under_1lakh") {
        matches.push({
          id: "mmjay",
          name: "Mukhyamantri Jan Arogya Yojana (MMJAY - Uttar Pradesh)",
          coverage: "₹5,00,000 Cashless Cover for Deprived Families",
          state: "Uttar Pradesh",
          summary: "Covers vulnerable families left out of SECC 2011 lists with identical benefits to PM-JAY across UP hospitals.",
          documents: ["Aadhaar Card", "Antyodaya / BPL Ration Card"],
          helpline: "1800-1800-4444",
          applyUrl: "https://sec.up.gov.in"
        });
      }
    }

    // 11. State Specific: Gujarat MAA Yojana
    if (state === "Gujarat" || state === "All-India") {
      matches.push({
        id: "maa_yojana",
        name: "Mukhyamantri Amrutam (MAA & MA Vatsalya - Gujarat)",
        coverage: "₹5,00,000 - ₹10,00,000 Tertiary Care Cover",
        state: "Gujarat",
        summary: "Tertiary cashless treatment for catastrophic illnesses like cardiovascular surgeries, neurosurgery, burns, and cancer.",
        documents: ["MAA Card", "Aadhaar Card", "Income Certificate (<₹4 Lakh)"],
        helpline: "1800-233-1022",
        applyUrl: "https://magujarat.in"
      });
    }

    // 12. Maternity Condition
    if (condition === "maternity") {
      matches.push({
        id: "jsy",
        name: "Janani Suraksha Yojana (JSY & PMMVY)",
        coverage: "₹1,400 - ₹5,000 Direct Cash Benefit + Free Delivery",
        state: "National / State Combined",
        summary: "Safe motherhood intervention promoting institutional delivery in rural areas with direct benefit transfer to mother's bank account.",
        documents: ["Mother and Child Protection (MCP) Card", "Bank Account Linked to Aadhaar"],
        helpline: "104",
        applyUrl: "https://pmmvy.wcd.gov.in"
      });
    }

    // 13. Chronic Dialysis Condition
    if (condition === "dialysis") {
      matches.push({
        id: "dialysis_prog",
        name: "Pradhan Mantri National Dialysis Programme (PMNDP)",
        coverage: "100% Free Hemodialysis Sessions",
        state: "National Public Health Initiative",
        summary: "Provides life-saving, free hemodialysis services at District and Sub-District Hospitals for BPL renal patients.",
        documents: ["Nephrologist Prescription", "BPL Ration Card", "Aadhaar Card"],
        helpline: "108",
        applyUrl: "https://nhm.gov.in"
      });
    }

    setResults(matches);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Bharat Welfare Engine</span>
            <h3 className="text-lg md:text-xl font-black text-slate-800">Smart Scheme Eligibility Wizard</h3>
          </div>
        </div>
        {step < 4 ? (
          <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Step {step} of 3
          </span>
        ) : (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Check Again
          </button>
        )}
      </div>

      {/* STEP 1: Location & Age */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800">1. Select Your Resident State</h4>
            <p className="text-xs text-slate-500 font-medium">State-sponsored health cards vary across states.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {["All-India", "Odisha", "Maharashtra", "Tamil Nadu", "Rajasthan", "Karnataka", "West Bengal", "Uttar Pradesh", "Gujarat", "Andhra Pradesh", "Telangana"].map((s) => (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-left truncate ${
                    state === s
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">2. Beneficiary Age: <span className="text-blue-600 font-black">{age} years</span></h4>
              {age >= 70 && (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-[10px]">
                  Eligible for 70+ Ayushman Card!
                </Badge>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="95"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-200 active:scale-95 transition-all"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Economic & Ration Card Status */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800">3. Household Ration Card Type</h4>
            <p className="text-xs text-slate-500 font-medium">Used to determine automatic social security inclusion.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { id: "AAY", label: "Antyodaya (AAY / Poorest)" },
                { id: "BPL", label: "BPL / Priority (PHH)" },
                { id: "APL", label: "General / APL Card" },
                { id: "NONE", label: "No Ration Card" }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRationCard(r.id)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                    rationCard === r.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-bold text-slate-800">4. Annual Household Income</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: "under_1lakh", label: "Less than ₹1,20,000 / year" },
                { id: "1_to_3lakh", label: "₹1,20,000 to ₹3,00,000 / year" },
                { id: "above_3lakh", label: "Above ₹3,00,000 / year" }
              ].map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setIncome(inc.id)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                    income === inc.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {inc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-200 active:scale-95 transition-all"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Medical Condition & Vulnerability */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800">5. Any Specific Health Condition?</h4>
            <p className="text-xs text-slate-500 font-medium">Certain special programmes offer 100% free care for specific conditions.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: "general", label: "General Care / Regular Illness", desc: "Fever, surgery, infections, accidents" },
                { id: "maternity", label: "Maternity & Motherhood", desc: "Pregnant mother, safe childbirth, newborn care" },
                { id: "dialysis", label: "Chronic Dialysis / Renal Care", desc: "Kidney disease requiring recurring dialysis" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-1.5 ${
                    condition === c.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <span className="font-bold text-xs">{c.label}</span>
                  <span className={`text-[10px] ${condition === c.id ? "text-blue-100" : "text-slate-400"}`}>{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={calculateEligibility}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-7 py-3 rounded-xl text-xs font-black shadow-xl shadow-blue-200 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Calculate My Schemes
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results Display */}
      {step === 4 && results && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-black text-sm text-emerald-900">
                  Great news! You qualify for {results.length} Government Health Schemes.
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Based on: {state} resident • {rationCard} Ration Status • {condition.toUpperCase()} care
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((sch) => (
              <div key={sch.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-bold">
                      {sch.state}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" /> {sch.helpline}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 leading-snug">{sch.name}</h4>
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-900 font-bold text-xs flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{sch.coverage}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{sch.summary}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Documents:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sch.documents.map((doc, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={sch.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
