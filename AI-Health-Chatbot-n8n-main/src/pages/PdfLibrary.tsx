import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Download, 
  FileText, 
  Search, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Languages, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  Filter,
  X,
  MessageSquareText,
  Share2
} from "lucide-react";
import { toast } from "sonner";

interface PdfDocument {
  id: string;
  title: string;
  lang: string;
  langCode: "hi" | "mr" | "or" | "te" | "en";
  size: string;
  category: "emergency" | "preventive" | "maternal" | "immunization" | "nutrition" | "mental";
  categoryLabel: string;
  updated: string;
  pages: number;
  desc: string;
  previewSummary: string;
}

const PDF_COLLECTION: PdfDocument[] = [
  { 
    id: "p1",
    title: "100% Offline Emergency First-Aid Pocketbook", 
    lang: "Hindi (हिंदी)", 
    langCode: "hi",
    size: "2.4 MB", 
    category: "emergency", 
    categoryLabel: "First-Aid",
    updated: "March 2025", 
    pages: 12,
    desc: "Immediate clinical protocols for snakebite management, thermal burns, CPR resuscitation, and poison control.",
    previewSummary: "Step-by-step illustrations for pressure immobilization in snakebites, thermal cooling for 2nd degree burns, chest compression depth standards, and 108 emergency calling script in Hindi."
  },
  { 
    id: "p2",
    title: "Community Safe Water & Enteric Hygiene Manual", 
    lang: "Marathi (मराठी)", 
    langCode: "mr",
    size: "1.8 MB", 
    category: "preventive", 
    categoryLabel: "Sanitation",
    updated: "Jan 2025", 
    pages: 8,
    desc: "10-minute rolling boiling rules, domestic chlorine tablet dosing, and WHO 7-step hand scrubbing techniques.",
    previewSummary: "Microbiological verification standards for drinking water boiling, prevention of monsoon waterborne cholera, and step-by-step home ORS mixing guidelines in Marathi."
  },
  { 
    id: "p3",
    title: "Maternal Health & Institutional Delivery Guide", 
    lang: "Hindi (हिंदी)", 
    langCode: "hi",
    size: "3.2 MB", 
    category: "maternal", 
    categoryLabel: "Maternal Care",
    updated: "Feb 2025", 
    pages: 16,
    desc: "4 mandatory ANC checkups, 180 Iron-Folic Acid tablets, JSY cash assistance, and newborn Kangaroo Mother Care.",
    previewSummary: "Full clinical guidance for high-risk obstetric warning signs, Janani Suraksha Yojana payment claiming steps, and exclusive breastfeeding techniques."
  },
  { 
    id: "p4",
    title: "National UIP Childhood Immunization Timetable", 
    lang: "Odia (ଓଡ଼ିଆ)", 
    langCode: "or",
    size: "1.1 MB", 
    category: "immunization", 
    categoryLabel: "Vaccines",
    updated: "March 2025", 
    pages: 6,
    desc: "Complete schedule from birth BCG/OPV to Pentavalent, Rotavirus, and adolescent Td boosters.",
    previewSummary: "Mother-Child Protection card schedule translation, catch-up vaccination rules, and mild post-vaccine fever management in Odia."
  },
  { 
    id: "p5",
    title: "Shree Anna Indian Millets & Balanced Diet", 
    lang: "English", 
    langCode: "en",
    size: "2.9 MB", 
    category: "nutrition", 
    categoryLabel: "Nutrition",
    updated: "Feb 2025", 
    pages: 14,
    desc: "Nutritional breakdown of Ragi, Bajra, Jowar, and Foxtail millet with low-glycemic meal planning recipes.",
    previewSummary: "ICMR-NIN dietary guidelines, calcium and iron content comparison charts across Indian cereals, and glycemic control recipes for pre-diabetes."
  },
  { 
    id: "p6",
    title: "Tele-MANAS Stress Reduction & Sleep Hygiene", 
    lang: "Marathi (मराठी)", 
    langCode: "mr",
    size: "1.5 MB", 
    category: "mental", 
    categoryLabel: "Mental Wellness",
    updated: "Dec 2024", 
    pages: 10,
    desc: "Pranayama breathwork, 4-7-8 vagal modulation, and national mental health toll-free helpline access (14416).",
    previewSummary: "Clinical autonomic down-regulation protocols, bedtime digital hygiene techniques, and direct contact numbers for regional tele-mental health counselors."
  },
  { 
    id: "p7",
    title: "Maternal Nutrition & High-Risk Pregnancy Warnings", 
    lang: "Telugu (తెలుగు)", 
    langCode: "te",
    size: "2.7 MB", 
    category: "maternal", 
    categoryLabel: "Maternal Care",
    updated: "Jan 2025", 
    pages: 12,
    desc: "Essential maternal micronutrients, calcium-iron spacing rules, and pre-eclampsia warning signs in Telugu.",
    previewSummary: "Telugu translation of Government of India antenatal care standards, Janani Shishu Suraksha Karyakram entitlements, and emergency ambulance access."
  }
];

export const PdfLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PdfDocument | null>(null);

  const handleDownload = (doc: PdfDocument) => {
    // Generate a downloadable text blob representing the clinical guide
    const blobContent = `=====================================================
${doc.title}
Language: ${doc.lang} | Category: ${doc.categoryLabel}
Published by: SevaSetu Health Knowledge Hub
Aligned with: Ministry of Health & Family Welfare (MoHFW)
=====================================================

CLINICAL EXECUTIVE SUMMARY:
${doc.desc}

PROTOCOL SPECIFICATIONS:
${doc.previewSummary}

EMERGENCY DISPATCH CONTACTS:
- Medical Emergency Ambulance: 108
- Free Health Advice Line: 104
- Tele-MANAS Mental Health Support: 14416
- Janani Express Maternal Transport: 102

=====================================================
Verified by SevaSetu AI Clinical Team. For local medical
centers or Jan Aushadhi generic medicines, visit:
http://localhost:5173/health-directory
=====================================================`;

    const blob = new Blob([blobContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.langCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded: ${doc.title} (${doc.lang})`);
  };

  const filteredDocs = PDF_COLLECTION.filter(doc => {
    const matchesCat = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesLang = selectedLang === "all" || doc.langCode === selectedLang;
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.lang.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesLang && matchesSearch;
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
          onClick={() => navigate("/chat?query=Which%20health%20guide%20should%20I%20read%20for%20managing%20blood%20pressure")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-xs hover:bg-indigo-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-indigo-700" />
          <span>Ask AI Recommendations</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/15 backdrop-blur-md rounded-full border border-indigo-400/25 text-xs font-bold text-indigo-300">
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Digital Clinical Brochure Library • Multi-Lingual</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Downloadable Health Guides.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Print-ready clinical booklets, immunization charts, and maternal emergency checklists translated into Hindi, Marathi, Odia, Telugu, and English.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Free PDF Downloads</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">5 Regional Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Multi-Filter Strip */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides by title or keyword (e.g. First-Aid, Millets, Vaccine)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {[
              { code: "all", label: "All Langs" },
              { code: "hi", label: "Hindi" },
              { code: "mr", label: "Marathi" },
              { code: "or", label: "Odia" },
              { code: "te", label: "Telugu" },
              { code: "en", label: "English" }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedLang === l.code ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Topics" },
              { id: "emergency", label: "First-Aid" },
              { id: "preventive", label: "Preventive" },
              { id: "maternal", label: "Maternal" },
              { id: "immunization", label: "Vaccines" },
              { id: "nutrition", label: "Nutrition" },
              { id: "mental", label: "Mental Health" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto">
            Showing {filteredDocs.length} Guides
          </span>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="space-y-6">
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching guides found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Try choosing another language or reset the category filters.</p>
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedLang("all"); setSearchQuery(""); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100">
                      {doc.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      {doc.lang}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5 line-clamp-2">
                      {doc.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.pages} Pages</span>
                    <span>•</span>
                    <span>{doc.updated}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {previewDoc.categoryLabel}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {previewDoc.lang} • {previewDoc.pages} Pages
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {previewDoc.title}
                </h3>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Overview</h4>
                <p className="leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {previewDoc.desc}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Table of Contents & Key Sections</h4>
                <p className="leading-relaxed font-medium bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-indigo-950">
                  {previewDoc.previewSummary}
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  handleDownload(previewDoc);
                  setPreviewDoc(null);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Device</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PdfLibrary;
