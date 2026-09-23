import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useHealthData } from "../contexts/HealthDataContext";
import { useAuth } from "../contexts/AuthContext";
import { analysisService } from "../services/api";
import { compressImage } from "../utils/imageCompressor";
import { toast } from "sonner";
import {
  Activity,
  Heart,
  TrendingUp,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Search,
  ArrowRight,
  Filter,
  Eye,
  Loader2,
  Zap,
  Info,
  ChevronRight,
  Radio,
  FileSearch,
  ScanLine,
  Plus,
  X,
  Check,
  LayoutGrid,
  List,
  Trash2,
  ArrowLeft,
  Thermometer,
  Wind
} from "lucide-react";
import { PaginationControl } from "@/components/ui/PaginationControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Custom Clinical Chart Tooltip for Vitals Page
const VitalsChartTooltip = ({ active, payload, label, unit, metricName }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
          <p className="font-bold text-slate-300">{label}</p>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Clinical Lab
          </span>
        </div>
        <p className="text-base font-black text-white">
          {payload[0].value} <span className="text-xs font-semibold text-slate-400">{unit}</span>
        </p>
        <p className="text-[11px] text-slate-400 font-medium">
          Status: <span className="text-emerald-300 font-bold">{data.status || "Within Benchmark"}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const Vitals: React.FC = () => {
  const { user } = useAuth();
  const {
    hemoglobinHistory,
    glucoseHistory,
    latestVitals,
    imagingScans,
    extractedParameters,
    documents,
    addUploadedDocument,
    clearAllHealthData,
    recordVital
  } = useHealthData();

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchParam, setSearchParam] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination & View Mode for Extracted Parameters
  const [paramPage, setParamPage] = useState<number>(1);
  const [paramViewMode, setParamViewMode] = useState<"grid" | "table">("grid");
  const paramsPerPage = paramViewMode === "grid" ? 9 : 10;

  useEffect(() => {
    setParamPage(1);
  }, [filterCategory, searchParam]);

  // Manual Blood Pressure recording dialog state
  const [isRecordBPOpen, setIsRecordBPOpen] = useState<boolean>(false);
  const [sysInput, setSysInput] = useState<string>("118");
  const [diaInput, setDiaInput] = useState<string>("78");
  const [contextInput, setContextInput] = useState<string>("Resting clinical measurement");
  const [isSubmittingBP, setIsSubmittingBP] = useState<boolean>(false);

  const handleSaveBP = async () => {
    const sys = parseInt(sysInput.trim(), 10);
    const dia = parseInt(diaInput.trim(), 10);

    if (isNaN(sys) || isNaN(dia) || sys < 50 || sys > 260 || dia < 30 || dia > 180) {
      toast.error("Please enter a valid systolic (70-240) and diastolic (40-150) reading.");
      return;
    }

    setIsSubmittingBP(true);
    try {
      const formattedVal = `${sys}/${dia} mmHg`;
      await recordVital("blood_pressure", formattedVal, contextInput.trim() || "Manual resting vital");
      toast.success(`Blood Pressure recorded: ${sys}/${dia} mmHg`);
      setIsRecordBPOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to record blood pressure. Please try again.");
    } finally {
      setIsSubmittingBP(false);
    }
  };

  useEffect(() => {
    document.title = "Vitals & Longitudinal Biomarkers | SevaSetu AI";
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info("Analyzing medical document with Seva AI...");

    try {
      const processedFile = await compressImage(file);
      const isImage = file.type.startsWith("image/");
      const fileNameLower = String(file.name || "").toLowerCase();
      const isLikelyImaging =
        isImage &&
        (fileNameLower.includes("x-ray") ||
          fileNameLower.includes("xray") ||
          fileNameLower.includes("scan") ||
          fileNameLower.includes("radiograph") ||
          fileNameLower.includes("mri"));

      let analysisData: any;
      if (isLikelyImaging) {
        analysisData = await analysisService.analyzeImage(
          processedFile,
          user?.id || "guest_patient"
        );
      } else {
        analysisData = await analysisService.analyzeReport(
          processedFile,
          user?.id || "guest_patient"
        );
      }

      if (!analysisData || analysisData.is_clear === false || analysisData.status === "error") {
        toast.error(
          analysisData?.error ||
            "The uploaded image was not clear or readable. Please retry with a clearer, well-lit photo."
        );
        return;
      }

      // Automatically add to unified dynamic health store
      addUploadedDocument(
        {
          title: analysisData?.title || file.name.replace(/\.[^/.]+$/, ""),
          category: analysisData?.category || (isLikelyImaging ? "imaging" : "lab"),
          facility:
            analysisData?.facility ||
            (isLikelyImaging ? "Radiology Wing" : "City Diagnostic Wing"),
          summary:
            analysisData?.summary ||
            analysisData?.findings ||
            "Document uploaded & vitals recorded."
        },
        analysisData
      );

      toast.success("Document analyzed! Vitals & trajectories updated.");
    } catch (err: any) {
      console.error("Vitals upload error:", err);
      const msg = err?.message || "Could not complete AI analysis. Please try again.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredParams = extractedParameters.filter((param) => {
    if (!param) return false;
    const q = (searchParam || "").toLowerCase().trim();
    const pName = String(param.name || "").toLowerCase();
    const pVal = String(param.value ?? "").toLowerCase();
    const pDoc = String(param.docTitle || "").toLowerCase();
    const pExp = String(param.explanation || "").toLowerCase();

    const matchesSearch =
      !q ||
      pName.includes(q) ||
      pVal.includes(q) ||
      pDoc.includes(q) ||
      pExp.includes(q);

    const s = String(param.status || "").toUpperCase();
    if (filterCategory === "all") return matchesSearch;
    if (filterCategory === "abnormal") {
      return matchesSearch && (s === "HIGH" || s === "LOW" || s === "ABNORMAL");
    }
    if (filterCategory === "normal") {
      return matchesSearch && (s === "NORMAL" || s === "OPTIMAL");
    }
    return matchesSearch;
  });

  const totalParamItems = filteredParams.length;
  const paginatedParams = filteredParams.slice(
    (paramPage - 1) * paramsPerPage,
    paramPage * paramsPerPage
  );

  const getStatusBadgeClass = (status?: string) => {
    const s = String(status || "").toUpperCase();
    if (s === "HIGH" || s === "LOW" || s === "ABNORMAL") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s === "INFO") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const latestHbVal = latestVitals.hemoglobin !== "--" ? latestVitals.hemoglobin.split(" ")[0] : "--";
  const latestGlucoseVal = latestVitals.glucose !== "--" ? latestVitals.glucose.split(" ")[0] : "--";
  const latestBPVal = latestVitals.bloodPressure !== "--" ? latestVitals.bloodPressure.split(" ")[0] : "--";
  const latestPulseVal = latestVitals.pulse !== "--" ? latestVitals.pulse.split(" ")[0] : "--";
  const latestSpO2Val = latestVitals.spo2 !== "--" ? latestVitals.spo2.replace("%", "").trim() : "--";

  // Blood Pressure clinical classification
  let bpStatus = "Optimal Band";
  let bpStatusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (latestBPVal !== "--") {
    const parts = latestBPVal.split("/").map((p) => parseInt(p.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [sys, dia] = parts;
      if (sys < 120 && dia < 80) {
        bpStatus = "Optimal Band";
        bpStatusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (sys <= 129 && dia < 80) {
        bpStatus = "Normal Band";
        bpStatusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (sys <= 139 || dia <= 89) {
        bpStatus = "Pre-Hypertension";
        bpStatusClass = "bg-amber-50 text-amber-700 border-amber-200";
      } else {
        bpStatus = "Stage 1/2 HTN";
        bpStatusClass = "bg-rose-50 text-rose-700 border-rose-200";
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* ATMOSPHERIC BACKGROUND MESH LIGHTS (LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/60 via-cyan-100/40 to-transparent rounded-full blur-[140px] transform-gpu" />
        <div className="absolute top-[35%] -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-emerald-100/50 via-teal-100/30 to-transparent rounded-full blur-[140px] transform-gpu" />
        <div className="absolute bottom-10 right-1/4 w-[650px] h-[650px] bg-gradient-to-tl from-indigo-100/40 via-violet-100/30 to-transparent rounded-full blur-[160px] transform-gpu" />
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 space-y-8 relative z-10">
        
        {/* Hidden File Input for instant upload anywhere on Vitals page */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
        />

        {/* ========================================================================= */}
        {/* HEADER BAR (EXECUTIVE PEARL BANNER) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-slate-50 p-6 sm:p-8 md:p-9 border border-slate-200/90 shadow-md">
          {/* Subtle soft glowing light pools */}
          <div className="absolute top-0 right-0 w-[450px] h-[350px] bg-gradient-to-bl from-blue-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[250px] bg-gradient-to-tr from-emerald-400/10 via-teal-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ABHA: 91-8273-4920-1124
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  Last Updated: {latestVitals.lastUpdated}
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Vitals & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">Biomarker Trajectory</span>
                </h1>
                <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                  Longitudinal clinical tracking extracted from your CBC panels, fasting blood sugar assays, arterial pressure logs, and diagnostic radiology scans.
                </p>
              </div>
            </div>

            {/* Quick Action Control Hub */}
            <div className="flex items-center gap-2.5 flex-wrap relative z-10">
              {documents.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset and clear all records?")) {
                      clearAllHealthData();
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
                  title="Clear all records and start fresh"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset
                </button>
              )}

              <Link
                to="/vault"
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 hover:border-blue-300"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Vault ({documents.length})
              </Link>

              <button
                onClick={() => {
                  if (latestBPVal !== "--" && latestBPVal.includes("/")) {
                    const [s, d] = latestBPVal.split("/");
                    if (s) setSysInput(s.trim());
                    if (d) setDiaInput(d.trim());
                  }
                  setIsRecordBPOpen(true);
                }}
                className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                Record BP
              </button>

              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? "Analyzing..." : "Upload Report / Scan"}
              </button>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 1. CURRENT LIVE VITALS SUMMARY CARDS (6 MASTERWORK CARDS) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* Card 1: Hemoglobin */}
          <div className="group relative p-4 rounded-3xl bg-white hover:bg-blue-50/20 border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hemoglobin</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{latestHbVal}</span>
              {latestHbVal !== "--" && <span className="text-xs font-semibold text-slate-400">g/dL</span>}
            </div>
            <div className="mt-2">
              {latestHbVal !== "--" ? (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                    Number(latestHbVal) >= 13.0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {Number(latestHbVal) >= 13.0 ? "Target Reached" : "Below Target"}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                  Upload CBC
                </span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Ref: 13.0 - 17.5</p>
            </div>
          </div>

          {/* Card 2: Fasting Blood Sugar */}
          <div className="group relative p-4 rounded-3xl bg-white hover:bg-emerald-50/20 border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fasting Sugar</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{latestGlucoseVal}</span>
              {latestGlucoseVal !== "--" && <span className="text-xs font-semibold text-slate-400">mg/dL</span>}
            </div>
            <div className="mt-2">
              {latestGlucoseVal !== "--" ? (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                    Number(latestGlucoseVal) <= 100
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {Number(latestGlucoseVal) <= 100 ? "Normal Fasting" : "Elevated Range"}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                  Upload Sugar
                </span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Ref: 70 - 100</p>
            </div>
          </div>

          {/* Card 3: Blood Pressure */}
          <div className="group relative p-4 rounded-3xl bg-white hover:bg-rose-50/20 border border-slate-200/90 hover:border-rose-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Blood Pressure</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Heart className="w-4 h-4 fill-rose-500/20" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-black text-slate-900 group-hover:text-rose-700 transition-colors">{latestBPVal}</span>
                {latestBPVal !== "--" && <span className="text-xs font-semibold text-slate-400">mmHg</span>}
              </div>
              <div className="mt-2">
                {latestBPVal !== "--" ? (
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${bpStatusClass}`}>
                    {bpStatus}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                    Not Recorded
                  </span>
                )}
                <p className="text-[10px] text-slate-400 mt-1">Ref: &lt; 120/80</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (latestBPVal !== "--" && latestBPVal.includes("/")) {
                  const [s, d] = latestBPVal.split("/");
                  if (s) setSysInput(s.trim());
                  if (d) setDiaInput(d.trim());
                }
                setIsRecordBPOpen(true);
              }}
              className="mt-3 w-full py-1.5 px-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 text-rose-500" />
              {latestBPVal !== "--" ? "Update BP" : "Record BP"}
            </button>
          </div>

          {/* Card 4: Pulse / Heart Rate */}
          <div className="group relative p-4 rounded-3xl bg-white hover:bg-indigo-50/20 border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pulse Rate</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors">{latestPulseVal}</span>
              {latestPulseVal !== "--" && <span className="text-xs font-semibold text-slate-400">bpm</span>}
            </div>
            <div className="mt-2">
              {latestPulseVal !== "--" ? (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Normal Rhythm
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                  Not Recorded
                </span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Ref: 60 - 100</p>
            </div>
          </div>

          {/* Card 5: Blood Oxygen (SpO2) */}
          <div className="group relative p-4 rounded-3xl bg-white hover:bg-teal-50/20 border border-slate-200/90 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Oxygen SpO2</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">{latestSpO2Val}</span>
              {latestSpO2Val !== "--" && <span className="text-xs font-semibold text-slate-400">%</span>}
            </div>
            <div className="mt-2">
              {latestSpO2Val !== "--" ? (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Optimal
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                  Not Recorded
                </span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Ref: 95 - 100%</p>
            </div>
          </div>

          {/* Card 6: Diagnostic Scans & X-Ray */}
          <div className="group relative p-4 rounded-3xl bg-white hover:bg-purple-50/20 border border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Imaging & Scan</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <ScanLine className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1 truncate">
              <span className="text-base font-black text-slate-900 block truncate group-hover:text-purple-700 transition-colors">
                {imagingScans[0]?.modality || (documents.length > 0 ? "No Imaging Scans" : "--")}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 block truncate">
                {imagingScans[0]?.title || "Upload chest X-Ray / CT"}
              </span>
            </div>
            <div className="mt-2">
              {imagingScans.length > 0 ? (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {imagingScans[0]?.status === "NORMAL" ? "Clear Findings" : "Reviewed"}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                  0 Scans Saved
                </span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">{imagingScans.length} Scan(s) Saved</p>
            </div>
          </div>

        </section>


        {/* ========================================================================= */}
        {/* 2. LONGITUDINAL TRAJECTORY CHARTS (HEMOGLOBIN & BLOOD SUGAR) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Hemoglobin Chart Studio */}
          <Card className="rounded-3xl border-slate-200/90 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    Extracted from CBC Panels
                  </span>
                  <CardTitle className="text-lg font-black text-slate-900">
                    Hemoglobin Trajectory (Hb)
                  </CardTitle>
                </div>
                {hemoglobinHistory.length > 0 && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                    {hemoglobinHistory[hemoglobinHistory.length - 1]?.value >= 13.0
                      ? "Normal Target Reached"
                      : "Monitored Trajectory"}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-slate-500">
                Clinical tracking across consecutive uploaded tests. Target threshold: ≥ 13.0 g/dL.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {hemoglobinHistory.length > 0 ? (
                <>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hemoglobinHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="vitalsHbGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis domain={[10, 17]} stroke="#94A3B8" fontSize={11} tickLine={false} unit="g" />
                        <Tooltip content={<VitalsChartTooltip unit="g/dL" metricName="Hemoglobin" />} />
                        <ReferenceLine
                          y={13.0}
                          stroke="#10B981"
                          strokeDasharray="4 4"
                          label={{ value: "13.0 Target Min", fill: "#059669", fontSize: 10, position: "insideTopRight" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#vitalsHbGradient)"
                          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium gap-2">
                    {hemoglobinHistory.map((pt, idx) => (
                      <span key={idx} className={idx === hemoglobinHistory.length - 1 ? "text-emerald-700 font-bold" : ""}>
                        {pt.date}: {pt.value} g/dL ({pt.status})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <Activity className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No Hemoglobin Records Yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Upload a Complete Blood Count (CBC) report to automatically map your Hemoglobin trajectory.
                  </p>
                  <button
                    onClick={handleUploadClick}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload CBC Report
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fasting Glucose Chart Studio */}
          <Card className="rounded-3xl border-slate-200/90 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    Extracted from Metabolic Panels
                  </span>
                  <CardTitle className="text-lg font-black text-slate-900">
                    Fasting Blood Sugar Trajectory
                  </CardTitle>
                </div>
                {glucoseHistory.length > 0 && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                    {glucoseHistory[glucoseHistory.length - 1]?.value <= 100
                      ? "Normalized Progression"
                      : "Monitored Progression"}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-slate-500">
                Fasting plasma glucose readings. Normal fasting target: &lt; 100 mg/dL.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {glucoseHistory.length > 0 ? (
                <>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={glucoseHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="vitalsGlucoseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis domain={[70, 180]} stroke="#94A3B8" fontSize={11} tickLine={false} unit="mg" />
                        <Tooltip content={<VitalsChartTooltip unit="mg/dL" metricName="Fasting Glucose" />} />
                        <ReferenceLine
                          y={100}
                          stroke="#10B981"
                          strokeDasharray="4 4"
                          label={{ value: "100 mg/dL Target", fill: "#059669", fontSize: 10, position: "insideTopRight" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#059669"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#vitalsGlucoseGradient)"
                          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium gap-2">
                    {glucoseHistory.map((pt, idx) => (
                      <span key={idx} className={idx === glucoseHistory.length - 1 ? "text-emerald-700 font-bold" : ""}>
                        {pt.date}: {pt.value} mg/dL ({pt.status})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No Blood Sugar Records Yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Upload a Fasting Blood Glucose report to automatically map your sugar progression.
                  </p>
                  <button
                    onClick={handleUploadClick}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Glucose Test
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>


        {/* ========================================================================= */}
        {/* 3. IMAGING & RADIOLOGY SCANS SECTION (LIGHT THEME) */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
                Diagnostic Radiology
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-purple-600" />
                Medical Imaging, X-Rays & Scans
              </h3>
            </div>
            <Badge variant="outline" className="w-fit text-purple-700 bg-purple-50 border-purple-200 font-bold">
              {imagingScans.length} Imaging Record(s)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imagingScans.map((scan) => (
              <div
                key={scan.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/20 border border-slate-200/80 hover:border-purple-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 uppercase tracking-wider">
                      {scan.modality}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {scan.date}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mt-2">{scan.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                    {scan.findings}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified by Seva AI Vision
                  </span>
                  <Link
                    to="/vault"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    View in Vault →
                  </Link>
                </div>
              </div>
            ))}

            {imagingScans.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                <ScanLine className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">No Medical Imaging Scans Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Upload a chest X-Ray, radiograph, MRI, or CT scan to have Seva AI Vision analyze and record findings here.
                </p>
                <button
                  onClick={handleUploadClick}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload X-Ray / Scan
                </button>
              </div>
            )}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. EXTRACTED CLINICAL PARAMETERS AUDIT LOG */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                Detailed Parameter Audit
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                All Extracted Lab Values & Reference Ranges
              </h3>
            </div>

            {/* Filter Pills, View Toggle & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "all", label: `All (${extractedParameters.length})` },
                  { id: "abnormal", label: "High / Low Alerts" },
                  { id: "normal", label: "Normal Only" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterCategory === tab.id
                        ? "bg-white text-blue-600 shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle: Grid vs Clinical Table */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setParamViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    paramViewMode === "grid"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setParamViewMode("table")}
                  className={`p-1.5 rounded-lg transition-all ${
                    paramViewMode === "table"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Clinical Audit Table"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search parameter..."
                  value={searchParam}
                  onChange={(e) => setSearchParam(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-48 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Clinical Audit Table vs Cards Grid */}
          {paramViewMode === "table" && paginatedParams.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Parameter / Biomarker</th>
                    <th className="py-3 px-4">Result Value</th>
                    <th className="py-3 px-4">Clinical Band</th>
                    <th className="py-3 px-4">Clinical Significance</th>
                    <th className="py-3 px-4">Source Document</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedParams.map((param) => (
                    <tr key={param.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{param.name || "Biomarker"}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{String(param.value ?? "--")}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`${getStatusBadgeClass(param.status)} text-[10px] font-black uppercase`}>
                          {param.status || "NORMAL"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm">{param.explanation || "Clinical observation recorded."}</td>
                      <td className="py-3 px-4 font-medium text-slate-500 truncate max-w-[150px]">{param.docTitle || "Medical Record"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-400 whitespace-nowrap">{param.date || "Recent"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedParams.map((param) => (
                <div
                  key={param.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/15 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider truncate max-w-[180px]">
                        {String(param.docTitle || "Medical Record")}
                      </span>
                      <Badge variant="outline" className={`${getStatusBadgeClass(param.status)} text-[10px] font-black uppercase`}>
                        {param.status || "NORMAL"}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{param.name || "Biomarker"}</h4>
                    <p className="text-xl font-black text-slate-900 my-1">{String(param.value ?? "--")}</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {param.explanation || "Clinical observation recorded."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>{param.date || "Recent"}</span>
                    <span className="text-blue-600 font-bold">Recorded</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredParams.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <FileSearch className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">
                {extractedParameters.length === 0 ? "No Clinical Parameters Extracted Yet" : "No matching parameters found"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                {extractedParameters.length === 0
                  ? "Upload any lab report or diagnostic panel to automatically parse lab values and clinical reference bands."
                  : "Try adjusting your filter or search query."}
              </p>
              {extractedParameters.length === 0 && (
                <button
                  onClick={handleUploadClick}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload First Report
                </button>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          <PaginationControl
            currentPage={paramPage}
            totalItems={totalParamItems}
            itemsPerPage={paramsPerPage}
            onPageChange={setParamPage}
            itemLabel="parameters"
          />
        </section>

        {/* ========================================================================= */}
        {/* RECORD BLOOD PRESSURE MODAL DIALOG (WHITE THEME) */}
        {/* ========================================================================= */}
        {isRecordBPOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                    <Heart className="w-5 h-5 fill-rose-500/20" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Record Blood Pressure</h3>
                    <p className="text-xs text-slate-500">Systolic & Diastolic arterial pressure</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecordBPOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Systolic (SYS)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="70"
                        max="240"
                        value={sysInput}
                        onChange={(e) => setSysInput(e.target.value)}
                        placeholder="118"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400">mmHg</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Optimal: &lt; 120</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Diastolic (DIA)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="40"
                        max="150"
                        value={diaInput}
                        onChange={(e) => setDiaInput(e.target.value)}
                        placeholder="78"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400">mmHg</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Optimal: &lt; 80</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Context / Note
                  </label>
                  <input
                    type="text"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="e.g. Resting morning measurement, Clinic consult"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900 leading-relaxed font-medium">
                    This reading syncs directly to your digital health timeline and immediately updates your longitudinal tracking cards.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordBPOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingBP}
                  onClick={handleSaveBP}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingBP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isSubmittingBP ? "Recording..." : "Save Reading"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Vitals;
