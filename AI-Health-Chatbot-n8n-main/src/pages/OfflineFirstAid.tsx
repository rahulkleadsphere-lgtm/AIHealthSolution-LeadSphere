import React, { useState, useEffect } from "react";
import { FIRST_AID_PROTOCOLS, EMERGENCY_CONTACTS, FirstAidProtocol } from "../data/firstAidData";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  WifiOff, 
  HeartPulse, 
  Flame, 
  Sun, 
  Activity, 
  ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = {
  ShieldAlert,
  Sun,
  Flame,
  HeartPulse,
  Activity
};

const OfflineFirstAid: React.FC = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<FirstAidProtocol>(FIRST_AID_PROTOCOLS[0]);

  useEffect(() => {
    document.title = "Offline Emergency First-Aid Pocketbook | SevaSetu AI";
  }, []);

  const langKey = ["en", "hi", "te", "or"].includes(language) ? language : "en";

  const filteredProtocols = FIRST_AID_PROTOCOLS.filter((p) => {
    const title = (p.title[langKey] || p.title.en).toLowerCase();
    const type = p.emergency_type.toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || type.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-28 md:pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">100% Offline Ready</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <WifiOff className="w-6 h-6 text-red-500" />
            Emergency First-Aid Pocketbook
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Verified life-saving medical protocols. Works anywhere, even with zero cellular data or internet.
          </p>
        </div>

        {/* 108 Fast Dialer Button */}
        <a
          href="tel:108"
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-200 active:scale-95 transition-all"
        >
          <PhoneCall className="w-5 h-5 animate-pulse" />
          <span>Call 108 Ambulance</span>
        </a>
      </div>

      {/* Emergency Contacts Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {EMERGENCY_CONTACTS.map((c) => (
          <a
            key={c.number}
            href={`tel:${c.number}`}
            className="p-3.5 bg-white border border-slate-200/80 hover:border-blue-400 rounded-2xl flex flex-col justify-between gap-2 shadow-sm transition-all hover:shadow-md active:scale-95 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">{c.name}</span>
              <PhoneCall className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-blue-600 tracking-tight">{c.number}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{c.desc.split(" ")[0]}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emergency (e.g., snake bite, burn, cpr, heat stroke, bleeding)..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Protocol Navigator & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Protocol Selector List */}
        <div className="lg:col-span-4 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Critical Protocols</p>
          {filteredProtocols.map((p) => {
            const Icon = iconMap[p.icon] || ShieldAlert;
            const isSelected = selectedProtocol.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProtocol(p)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                    : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs truncate">{p.title[langKey] || p.title.en}</p>
                    <p className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{p.emergency_type}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-black px-1.5 py-0 uppercase tracking-wider shrink-0 ${
                    isSelected
                      ? "border-white/30 text-white"
                      : p.severity === "CRITICAL"
                      ? "border-red-200 text-red-600 bg-red-50"
                      : "border-amber-200 text-amber-600 bg-amber-50"
                  }`}
                >
                  {p.severity}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Protocol Deep-Dive Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <Badge className="bg-red-50 text-red-600 border border-red-200 font-bold mb-2">
                {selectedProtocol.emergency_type} • {selectedProtocol.severity}
              </Badge>
              <h2 className="text-xl md:text-2xl font-black text-slate-800">
                {selectedProtocol.title[langKey] || selectedProtocol.title.en}
              </h2>
            </div>
            <a
              href={`tel:${selectedProtocol.helpline}`}
              className="flex items-center gap-2 text-xs font-black text-red-600 bg-red-50 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              Dial {selectedProtocol.helpline}
            </a>
          </div>

          {/* Immediate DO's */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Immediate Life-Saving Steps (DO THIS):
            </h3>
            <div className="space-y-2.5">
              {(selectedProtocol.immediate_dos[langKey] || selectedProtocol.immediate_dos.en).map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strict DONT's */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Dangerous Actions (STRICTLY AVOID):
            </h3>
            <div className="space-y-2.5">
              {(selectedProtocol.strict_donts[langKey] || selectedProtocol.strict_donts.en).map((warn, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm font-semibold text-red-900 leading-relaxed">{warn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineFirstAid;
