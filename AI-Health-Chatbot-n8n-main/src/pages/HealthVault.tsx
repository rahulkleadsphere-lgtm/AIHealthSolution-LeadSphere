import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useHealthData, MedicalDocument } from "../contexts/HealthDataContext";
import {
  FileText,
  Upload,
  Activity,
  Calendar,
  ShieldCheck,
  Search,
  Eye,
  Building2,
  CheckCircle2,
  FolderLock,
  Trash2,
  AlertTriangle,
  Loader2,
  LayoutGrid,
  List,
  ArrowUpDown,
  X,
  ExternalLink,
  Copy,
  Check,
  Download,
  Sparkles,
  Pill,
  Clock,
  FileCheck,
  Layers,
  ArrowRight
} from "lucide-react";
import { PaginationControl } from "@/components/ui/PaginationControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const HealthVault: React.FC = () => {
  const { user } = useAuth();
  const { documents, vaultCounts, clearAllHealthData, deleteDocument } = useHealthData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination, Sort & View Mode States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "title_asc" | "facility_asc">("date_desc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [inspectDoc, setInspectDoc] = useState<MedicalDocument | null>(null);

  // Delete Confirmation Modal States
  const [docToDelete, setDocToDelete] = useState<MedicalDocument | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied State for ABHA
  const [copiedAbha, setCopiedAbha] = useState(false);

  useEffect(() => {
    document.title = "Personal Health Records Vault | SevaSetu AI";
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCopyAbha = () => {
    navigator.clipboard.writeText("91-8273-4920-1124");
    setCopiedAbha(true);
    toast.success("ABHA ID copied to clipboard!");
    setTimeout(() => setCopiedAbha(false), 2500);
  };

  const handleExportVaultIndex = () => {
    const exportData = {
      vault_title: "SevaSetu Personal Health Records Vault",
      abha_id: "91-8273-4920-1124",
      user_id: user?.id || "rahul_mumbai_demo",
      exported_at: new Date().toISOString(),
      total_records: documents.length,
      categories_breakdown: vaultCounts,
      records: documents.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        facility: d.facility,
        date: d.date,
        summary: d.summary,
        biomarkers: d.biomarkers || null,
        abnormalities_count: d.abnormalities?.length || 0
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sevasetu_vault_index_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Health Vault index downloaded successfully!");
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.biomarkers && doc.biomarkers.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "date_desc") return (b.timestamp || 0) - (a.timestamp || 0);
    if (sortBy === "date_asc") return (a.timestamp || 0) - (b.timestamp || 0);
    if (sortBy === "title_asc") return a.title.localeCompare(b.title);
    if (sortBy === "facility_asc") return (a.facility || "").localeCompare(b.facility || "");
    return 0;
  });

  const totalDocs = sortedDocs.length;
  const paginatedDocs = sortedDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Category Configuration
  const categoryConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    lab: { label: "Lab Reports", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    imaging: { label: "Imaging & Scans", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
    prescription: { label: "Prescriptions", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    discharge: { label: "Discharge Summaries", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
    insurance: { label: "Insurance & Cards", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Atmospheric Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-emerald-50/40 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-in fade-in duration-500">

        {/* ========================================================= */}
        {/* 1. EXECUTIVE HERO BANNER & CROWN DECK                     */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden rounded-[36px] bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/60 via-slate-50/30 to-transparent rounded-bl-[160px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              {/* Top Navigation & Status Breadcrumb */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors"
                >
                  Dashboard
                </Link>

                <span className="text-slate-300">/</span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  <FolderLock className="w-3.5 h-3.5 text-blue-600" />
                  Health Records Vault
                </span>

                <div 
                  onClick={handleCopyAbha}
                  className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold cursor-pointer transition-colors"
                  title="Click to copy ABHA ID"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ABHA: 91-8273-4920-1124
                  {copiedAbha ? (
                    <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
                  ) : (
                    <Copy className="w-3 h-3 text-emerald-500 group-hover:text-emerald-700 ml-0.5" />
                  )}
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ABDM Gateway Active
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Personal Health Records <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">Vault</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-semibold mt-2 leading-relaxed max-w-2xl">
                  Sovereign, consent-driven repository for diagnostic lab reports, radiological imaging scans, doctor prescriptions, and hospital discharge summaries.
                </p>
              </div>
            </div>

            {/* Quick Action Deck */}
            <div className="flex flex-wrap lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <Link
                to="/analysis"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-200 active:scale-95 transition-all w-full sm:w-auto"
              >
                <Upload className="w-4 h-4" />
                Upload New Document
              </Link>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/vitals"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:border-blue-500 text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-2xs active:scale-95 transition-all"
                >
                  <Activity className="w-4 h-4 text-blue-600" />
                  Track Vitals
                </Link>

                <button
                  onClick={handleExportVaultIndex}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-2xs active:scale-95 transition-all"
                  title="Export Vault Index as JSON"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Export Index
                </button>

                {documents.length > 0 && (
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="p-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-2xl shadow-2xs active:scale-95 transition-all"
                    title="Reset entire vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. CATEGORY TELEMETRY CARDS (5 DISCIPLINES)              */}
        {/* ========================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              id: "all",
              label: "Total Documents",
              sub: "Verified & ABDM Linked",
              count: vaultCounts.all,
              icon: FileText,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-200"
            },
            {
              id: "lab",
              label: "Lab Reports",
              sub: "CBC, Lipid & Glucose",
              count: vaultCounts.lab,
              icon: Activity,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-200"
            },
            {
              id: "imaging",
              label: "Imaging & Scans",
              sub: "X-Rays, MRIs & CT",
              count: vaultCounts.imaging,
              icon: Sparkles,
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-200"
            },
            {
              id: "prescription",
              label: "Prescriptions",
              sub: "Doctor Regimens & Rx",
              count: vaultCounts.prescription,
              icon: Pill,
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-200"
            },
            {
              id: "discharge",
              label: "Discharge Summaries",
              sub: "Hospital Summaries",
              count: vaultCounts.discharge,
              icon: Building2,
              color: "text-teal-600",
              bg: "bg-teal-50",
              border: "border-teal-200"
            },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20 -translate-y-0.5"
                    : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {cat.label}
                  </span>
                  <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {cat.count}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {cat.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* ========================================================= */}
        {/* 3. VAULT EXPLORER STUDIO (SEARCH, FILTER & VIEW TOGGLE)    */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
              {[
                { id: "all", label: `All (${vaultCounts.all})` },
                { id: "lab", label: `Lab (${vaultCounts.lab})` },
                { id: "imaging", label: `Imaging (${vaultCounts.imaging})` },
                { id: "prescription", label: `Prescriptions (${vaultCounts.prescription})` },
                { id: "discharge", label: `Discharge (${vaultCounts.discharge})` },
                { id: "insurance", label: `Insurance (${vaultCounts.insurance})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === tab.id
                      ? "bg-white text-blue-600 shadow-2xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Side: Sort, View Switcher, Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="facility_asc">Hospital (A-Z)</option>
                </select>
              </div>

              {/* View Switcher: Cards vs Table */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "cards"
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Bento Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Precision Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search test, doctor, hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50/80 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. CONDITIONAL VIEW: BENTO CARDS VS PRECISION TABLE       */}
          {/* ========================================================= */}
          {viewMode === "table" && paginatedDocs.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Document Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Hospital / Source</th>
                    <th className="py-3.5 px-4">Clinical Summary</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedDocs.map((doc) => {
                    const cfg = categoryConfig[doc.category] || { label: doc.category, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" };
                    return (
                      <tr key={doc.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setInspectDoc(doc)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{doc.title}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 truncate max-w-[160px]">
                          {doc.facility}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate font-medium">
                          {doc.summary}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-400 whitespace-nowrap">
                          {doc.date}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectDoc(doc)}
                              className="p-2 bg-white border border-slate-200 hover:border-blue-500 text-blue-600 rounded-xl text-xs font-bold transition-all shadow-2xs hover:bg-blue-50"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocToDelete(doc)}
                              className="p-2 bg-white border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold transition-all shadow-2xs hover:bg-rose-50"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedDocs.map((doc) => {
                const cfg = categoryConfig[doc.category] || { label: doc.category, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" };
                return (
                  <div
                    key={doc.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {doc.date}
                          </span>
                        </div>

                        <button
                          onClick={() => setDocToDelete(doc)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Title & Facility */}
                      <div>
                        <h4
                          onClick={() => setInspectDoc(doc)}
                          className="font-black text-base text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                        >
                          {doc.title}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {doc.facility}
                        </p>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {doc.summary}
                      </p>

                      {/* Biomarkers Pill */}
                      {doc.biomarkers && (
                        <div className="p-2.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-2 text-[11px] font-mono font-bold text-blue-800">
                          <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{doc.biomarkers}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <Link
                        to="/vitals"
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        Track in Vitals
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-2">
                        {doc.fileUrl && doc.fileUrl !== "#" && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 shadow-2xs"
                            title="Open File Attachment"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Button
                          onClick={() => setInspectDoc(doc)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-bold text-xs gap-1.5 h-9 px-3.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Record
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredDocs.length === 0 && (
            <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                <FolderLock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 font-black text-base">
                  {documents.length === 0 ? "Your Health Records Vault is Empty" : "No medical records match your filter"}
                </p>
                <p className="text-xs text-slate-500 font-medium max-w-sm">
                  {documents.length === 0
                    ? "Upload any medical report, blood test, or prescription to securely store and view it here."
                    : "Try adjusting your category filter or search keywords."}
                </p>
              </div>
              {documents.length === 0 && (
                <Link
                  to="/analysis"
                  className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-blue-200"
                >
                  <Upload className="w-4 h-4" />
                  Upload First Document
                </Link>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalDocs > itemsPerPage && (
            <PaginationControl
              currentPage={currentPage}
              totalItems={totalDocs}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="vault records"
            />
          )}

        </section>

        {/* ========================================================= */}
        {/* 5. DOCUMENT INSPECTION MODAL (CLINICAL PARAMETERS LOG)     */}
        {/* ========================================================= */}
        {inspectDoc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setInspectDoc(null)}
          >
            <div
              className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {inspectDoc.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {inspectDoc.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{inspectDoc.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {inspectDoc.facility}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Clinical Summary</span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {inspectDoc.summary}
                </p>
              </div>

              {/* Extracted Biomarkers */}
              {inspectDoc.biomarkers && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Extracted Biomarkers</span>
                  <div className="text-xs font-mono font-bold text-blue-900 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200">
                    {inspectDoc.biomarkers}
                  </div>
                </div>
              )}

              {/* Abnormalities Log */}
              {inspectDoc.abnormalities && inspectDoc.abnormalities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Clinical Parameters Log</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {inspectDoc.abnormalities.map((ab, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900">{ab.name}</span>
                          <span className="text-slate-500 ml-2 font-mono font-bold">{ab.value}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            ab.status === "HIGH" || ab.status === "LOW" || ab.status === "ABNORMAL"
                              ? "bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold"
                          }
                        >
                          {ab.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {inspectDoc.recommendations && inspectDoc.recommendations.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Physician Guidance & Recommendations</span>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 font-medium">
                    {inspectDoc.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Link
                  to="/vitals"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  View in Longitudinal Vitals
                </Link>

                <div className="flex items-center gap-2">
                  {inspectDoc.fileUrl && inspectDoc.fileUrl !== "#" && (
                    <a
                      href={inspectDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Attachment
                    </a>
                  )}
                  <Button
                    type="button"
                    onClick={() => setInspectDoc(null)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. DELETE CONFIRMATION MODAL                             */}
        {/* ========================================================= */}
        {docToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isDeleting && setDocToDelete(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 space-y-5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
                    Permanent Deletion
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    Delete from Health Vault?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    This will permanently remove this record and sync the deletion with your cloud database.
                  </p>
                </div>
              </div>

              {/* Target Document Card Preview */}
              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    {docToDelete.category.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {docToDelete.date}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">
                  {docToDelete.title}
                </p>
                {docToDelete.facility && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {docToDelete.facility}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteDocument(docToDelete.id, docToDelete.title);
                      setDocToDelete(null);
                    } catch (err) {
                      console.error("Delete error:", err);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. RESET ENTIRE VAULT CONFIRMATION MODAL                   */}
        {/* ========================================================= */}
        {isResetConfirmOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isDeleting && setIsResetConfirmOpen(false)}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 space-y-5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
                    Total Vault Reset
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    Reset Entire Health Vault?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    All records, extracted vitals, and diagnostic histories will be permanently wiped.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-xl text-[11px] text-rose-900 leading-relaxed font-medium">
                This will delete all reports from Supabase cloud database and local device storage. You can upload new documents at any time.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await clearAllHealthData();
                      setIsResetConfirmOpen(false);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting DB...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Reset Everything
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HealthVault;
