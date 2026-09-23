import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  PhoneCall, 
  ArrowLeft, 
  Search, 
  Copy, 
  Check, 
  ShieldAlert, 
  HeartPulse, 
  Baby, 
  Brain, 
  AlertTriangle, 
  Sparkles, 
  ExternalLink,
  Info,
  Clock,
  MessageSquareText
} from "lucide-react";

interface HelplineItem {
  name: string;
  number: string;
  type: "medical" | "maternal" | "child" | "mental" | "safety" | "blood";
  typeLabel: string;
  desc: string;
  is24x7: boolean;
  priority?: boolean;
}

const HELPLINE_DIRECTORY: HelplineItem[] = [
  { 
    name: "National Emergency Ambulance Service", 
    number: "108", 
    type: "medical", 
    typeLabel: "Critical Emergency", 
    desc: "24/7 emergency dispatch for road trauma, acute myocardial infarction, severe stroke, respiratory collapse, and hospital transfers.", 
    is24x7: true,
    priority: true
  },
  { 
    name: "National Health Information & Medical Advice", 
    number: "104", 
    type: "medical", 
    typeLabel: "Medical Advice", 
    desc: "Free tele-consultation with registered medical officers, minor symptom triage, and blood bank availability.", 
    is24x7: true,
    priority: true
  },
  { 
    name: "Tele-MANAS National Mental Health Helpline", 
    number: "14416", 
    type: "mental", 
    typeLabel: "Mental Wellness", 
    desc: "Government of India 24/7 multi-lingual confidential psychological counseling for stress, anxiety, depression, and crisis intervention.", 
    is24x7: true,
    priority: true
  },
  { 
    name: "Janani Shishu Suraksha Express (Mother & Baby)", 
    number: "102", 
    type: "maternal", 
    typeLabel: "Maternal Health", 
    desc: "Dedicated free transport for pregnant mothers in labor to institutional delivery facilities, and newborn transport.", 
    is24x7: true
  },
  { 
    name: "Childline Emergency Support", 
    number: "1098", 
    type: "child", 
    typeLabel: "Child Welfare", 
    desc: "National 24-hour free emergency phone service for children in need of medical care, protection, or rescue.", 
    is24x7: true
  },
  { 
    name: "National Emergency Response Support System (ERSS)", 
    number: "112", 
    type: "safety", 
    typeLabel: "Unified Police / Fire", 
    desc: "Pan-India single emergency number integrating Police, Fire, and Medical dispatch teams.", 
    is24x7: true
  },
  { 
    name: "National Women Helpline (Domestic Safety)", 
    number: "1091", 
    type: "safety", 
    typeLabel: "Women's Safety", 
    desc: "Immediate intervention and legal/medical aid for women facing domestic violence, harassment, or distress.", 
    is24x7: true
  },
  { 
    name: "National Blood Transfusion Services", 
    number: "1910", 
    type: "blood", 
    typeLabel: "Blood Availability", 
    desc: "Direct coordination for urgent blood units, rare blood group search, and nearby verified blood banks.", 
    is24x7: true
  },
  { 
    name: "National Poison Information Center (AIIMS)", 
    number: "+91 11 2658 9391", 
    type: "medical", 
    typeLabel: "Toxicology", 
    desc: "Specialized clinical toxicologists at AIIMS New Delhi providing rapid antidote guidance for chemical poisoning and venomous snakebites.", 
    is24x7: true
  }
];

export const Helplines: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (num: string, name: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedNumber(num);
    toast.success(`Copied ${num} (${name}) to clipboard`);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const filteredHelplines = HELPLINE_DIRECTORY.filter(item => {
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

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
          onClick={() => navigate("/chat?query=What%20is%20the%20exact%20protocol%20when%20calling%20108%20for%20an%20emergency")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-rose-700" />
          <span>Emergency AI Guide</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/15 backdrop-blur-md rounded-full border border-rose-400/25 text-xs font-bold text-rose-300">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>National Emergency Medical Helplines • Government of India</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              24/7 Verified Emergency Helplines.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Toll-free emergency dispatch dialers for medical resuscitation, maternal labor transport, mental health support, and poison control.
            </p>
          </div>

          {/* Quick Call Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <a
              href="tel:108"
              className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-between transition-all shadow-lg active:scale-95 group"
            >
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-rose-200 block">Ambulance SOS</span>
                <span className="text-xl font-black">108</span>
              </div>
              <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="tel:104"
              className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-between transition-all shadow-md active:scale-95 group"
            >
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Health Advice</span>
                <span className="text-xl font-black">104</span>
              </div>
              <PhoneCall className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="tel:14416"
              className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-between transition-all shadow-md active:scale-95 group"
            >
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-purple-300 block">Tele-MANAS</span>
                <span className="text-xl font-black">14416</span>
              </div>
              <PhoneCall className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Search & Filter Strip */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search helpline (e.g. Ambulance, Poison, 108, Child, Women)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 shadow-sm"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: "All Numbers" },
              { id: "medical", label: "Medical & Ambulance" },
              { id: "mental", label: "Mental Health" },
              { id: "maternal", label: "Maternal (102)" },
              { id: "safety", label: "Police & Safety" },
              { id: "blood", label: "Blood Bank" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedType === cat.id 
                    ? "bg-rose-600 text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Helplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHelplines.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-3xl border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-5 bg-white ${
                item.priority ? "border-rose-300 ring-2 ring-rose-50" : "border-slate-200/90"
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-100">
                    {item.typeLabel}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" />
                    <span>24x7 Toll-Free</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {item.number}
                  </h3>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(item.number, item.name)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  {copiedNumber === item.number ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={`tel:${item.number.replace(/\s+/g, '')}`}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Operator Call Checklist */}
      <section className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-amber-950">Emergency Caller Checklist: What to Tell the Operator</h3>
            <p className="text-xs text-amber-800 font-medium">Have these 4 pieces of information ready when dialing 108 or 112:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-white rounded-2xl border border-amber-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
            <h4 className="text-xs font-bold text-slate-900">Exact Location & Landmark</h4>
            <p className="text-[11px] text-slate-500 font-medium">Nearest school, temple, highway pillar, or village block.</p>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-amber-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
            <h4 className="text-xs font-bold text-slate-900">Chief Emergency Complaint</h4>
            <p className="text-[11px] text-slate-500 font-medium">e.g. Unconscious, snakebite, chest pain, labor contractions.</p>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-amber-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
            <h4 className="text-xs font-bold text-slate-900">Patient Age & Vital State</h4>
            <p className="text-[11px] text-slate-500 font-medium">Is the patient breathing? Are they conscious and responding?</p>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-amber-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
            <h4 className="text-xs font-bold text-slate-900">Do Not Disconnect</h4>
            <p className="text-[11px] text-slate-500 font-medium">Wait for the dispatcher to confirm vehicle dispatch and ETA.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Helplines;
