import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useHealthData } from "../contexts/HealthDataContext";
import { profileService, analysisService, appointmentService } from "../services/api";
import {
  Activity,
  Heart,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  FileText,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Upload,
  Search,
  Sparkles,
  MapPin,
  IdCard,
  User,
  Clock,
  ChevronRight,
  Stethoscope,
  Building2,
  CheckCircle2,
  ScanLine,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Layers,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  Pill,
  Droplet,
  Thermometer,
  Wind,
  QrCode,
  HeartPulse,
  Zap,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";
import { AbhaGatewayModal } from "../components/AbhaGatewayModal";
import { toast } from "sonner";

// Static triage prompt chips for conversational AI
const TRIAGE_CHIPS = [
  {
    title: "Report Interpretation",
    prompt: "My sugar was high in my previous report. Has it improved in my latest September CBC?",
    desc: "Analyzes longitudinal blood sugar progression",
    badge: "Biomarker Compare"
  },
  {
    title: "Penicillin Cross-Allergy",
    prompt: "Can I take amoxicillin or augmentin for my throat infection?",
    desc: "Tests cross-reactivity with confirmed penicillin allergy",
    badge: "Safety Alert"
  },
  {
    title: "Government Scheme Check",
    prompt: "Which government schemes could my family qualify for in Mumbai?",
    desc: "Matches MJPJAY & Ayushman Bharat PM-JAY rules",
    badge: "Welfare RAG"
  },
  {
    title: "Provider Telephonic Search",
    prompt: "Find the nearest cardiologist near Parel, Mumbai and let me call them.",
    desc: "Queries real-time hospital registry with dialer",
    badge: "Live Provider API"
  }
];

// Custom high-definition clinical chart tooltip (Light Theme)
const ClinicalChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
          <p className="font-bold text-slate-300">{label}</p>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Verified
          </span>
        </div>
        <p className="text-base font-black text-white">
          {payload[0].value} <span className="text-xs font-semibold text-slate-400">{data.unit || ""}</span>
        </p>
        <p className="text-[11px] text-slate-400 font-medium">
          Status: <span className="text-emerald-300 font-bold">{data.status || "Within Benchmark"}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    documents,
    hemoglobinHistory,
    glucoseHistory,
    latestVitals,
    recentActivities,
    vaultCounts,
    recordVital
  } = useHealthData();

  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(() => ({
    name: user?.name || "Patient Citizen",
    age: user?.profile?.age || "--",
    gender: user?.profile?.gender || "--",
    blood_group: user?.profile?.blood_group || "--",
    district: user?.district || user?.profile?.district || "India",
    abha_id: user?.profile?.abha_id || "--",
    profile_completion_pct: user?.profile?.profile_completion_pct || 65,
    allergies: user?.profile?.allergies || [],
    conditions: (user?.profile as any)?.conditions || [],
    medications: []
  }));

  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(() => {
    if (user?.id === "rahul_mumbai_demo") {
      return {
        facility: "KEM Hospital & Cardiac Research",
        location: "Parel, Mumbai",
        date: "28 Sep 2026",
        time: "10:30 AM",
        phone: "+91 22 2410 7000",
        specialty: "Cardiovascular Checkup & ECG"
      };
    }
    return null;
  });

  // UI Interactive States
  const [chartMetric, setChartMetric] = useState<"hb" | "glucose">("hb");
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<"all" | "lab" | "imaging" | "prescription">("all");
  const [copiedAbha, setCopiedAbha] = useState(false);

  // Quick Log Modal State
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logKey, setLogKey] = useState<string>("blood_pressure");
  const [logValue, setLogValue] = useState<string>("");
  const [logContext, setLogContext] = useState<string>("Routine Self-Check");
  const [submittingLog, setSubmittingLog] = useState(false);

  useEffect(() => {
    document.title = "Personal Health Dashboard | SevaSetu AI";
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const activeId = user.id;
      try {
        // 1. Fetch live user profile from PostgreSQL
        const res = await profileService.getProfile(activeId);
        if (res?.status === "success" && res.user) {
          const u = res.user;
          const p = u.profile || {};
          
          setProfile({
            name: u.name || user.name || "Patient Citizen",
            age: p.age || u.age || "--",
            gender: u.gender || p.gender || "--",
            blood_group: p.blood_group || u.blood_group || "--",
            district: u.district || p.district || "India",
            abha_id: u.abha_id || p.abha_id || "--",
            profile_completion_pct: u.profile_completion_pct || 75,
            allergies: Array.isArray(u.allergies) ? u.allergies : [],
            conditions: Array.isArray(u.conditions) ? u.conditions : [],
            medications: Array.isArray(u.medications) ? u.medications : []
          });
        }

        // 2. Fetch live appointments for this active user
        const apptRes = await appointmentService.getAppointments(activeId);
        if (apptRes?.appointments && apptRes.appointments.length > 0) {
          const firstAppt = apptRes.appointments[0];
          setUpcomingAppointment({
            facility: firstAppt.facility_name || "Primary Health Centre",
            location: firstAppt.location || "Clinical Wing",
            date: firstAppt.appointment_date ? new Date(firstAppt.appointment_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "Upcoming",
            time: "10:30 AM",
            phone: firstAppt.phone_number || "",
            specialty: firstAppt.symptoms || "Consultation & Follow-up"
          });
        } else {
          setUpcomingAppointment(user.id === "rahul_mumbai_demo" ? {
            facility: "KEM Hospital & Cardiac Research",
            location: "Parel, Mumbai",
            date: "28 Sep 2026",
            time: "10:30 AM",
            phone: "+91 22 2410 7000",
            specialty: "Cardiovascular Checkup & ECG"
          } : null);
        }
      } catch (e) {
        console.warn("Could not load backend profile, using local state.", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleLaunchChat = useCallback((prefillMessage: string) => {
    navigate("/chat", { state: { prefill: prefillMessage } });
  }, [navigate]);

  const handleCopyAbha = useCallback(() => {
    if (profile.abha_id) {
      navigator.clipboard.writeText(profile.abha_id);
      setCopiedAbha(true);
      toast.success("ABHA ID copied to clipboard", {
        description: profile.abha_id
      });
      setTimeout(() => setCopiedAbha(false), 2000);
    }
  }, [profile.abha_id]);

  const handleQuickLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logValue.trim()) {
      toast.error("Please enter a valid vital measurement");
      return;
    }
    setSubmittingLog(true);
    try {
      await recordVital(logKey, logValue.trim(), logContext);
      toast.success("Vital measurement recorded successfully!", {
        description: `${logKey.replace('_', ' ').toUpperCase()}: ${logValue.trim()} recorded in clinical timeline.`
      });
      setLogValue("");
      setLogModalOpen(false);
    } catch (err) {
      toast.error("Could not record vital. Saved locally.");
    } finally {
      setSubmittingLog(false);
    }
  };

  // Dynamic Clinical Triage Status Indicator
  const clinicalStatus = useMemo(() => {
    const bp = latestVitals.bloodPressure;
    const g = latestVitals.glucose;
    const hb = latestVitals.hemoglobin;

    let flagCount = 0;
    const alerts: string[] = [];

    if (g && g !== "--") {
      const gNum = parseFloat(g);
      if (gNum > 125) {
        flagCount++;
        alerts.push("Fasting glucose elevated");
      }
    }
    if (bp && bp !== "--") {
      const match = bp.match(/(\d+)\/(\d+)/);
      if (match) {
        const sys = parseInt(match[1]);
        const dia = parseInt(match[2]);
        if (sys >= 135 || dia >= 88) {
          flagCount++;
          alerts.push("Elevated blood pressure");
        }
      }
    }
    if (hb && hb !== "--") {
      const hbNum = parseFloat(hb);
      if (hbNum < 12.0) {
        flagCount++;
        alerts.push("Hemoglobin below target");
      }
    }

    if (flagCount > 0) {
      return {
        isOptimal: false,
        title: "Clinical Attention Advised",
        badge: `${flagCount} Parameter${flagCount > 1 ? 's' : ''} Flagged`,
        color: "amber",
        summary: alerts.join(" • ") + ". Follow-up consultation recommended."
      };
    }

    return {
      isOptimal: true,
      title: "All Core Biomarkers Within Target",
      badge: "Clinical Status: Stable",
      color: "emerald",
      summary: "Blood pressure, glucose, and oxygen saturation meet clinical benchmarks."
    };
  }, [latestVitals]);

  // Chart trajectories with graceful fallback baseline for demo persona only
  const hbChartData = useMemo(() => {
    if (hemoglobinHistory.length > 0) {
      return hemoglobinHistory.map((h) => ({
        date: h.date,
        value: Number(h.value),
        unit: "g/dL",
        status: h.status
      }));
    }
    if (user?.id === "rahul_mumbai_demo") {
      return [
        { date: "May '26", value: 12.4, unit: "g/dL", status: "Mildly Low" },
        { date: "Jul '26", value: 12.9, unit: "g/dL", status: "Borderline" },
        { date: "Sep '26", value: 13.6, unit: "g/dL", status: "Target Reached" }
      ];
    }
    return [];
  }, [hemoglobinHistory, user?.id]);

  const glucoseChartData = useMemo(() => {
    if (glucoseHistory.length > 0) {
      return glucoseHistory.map((g) => ({
        date: g.date,
        value: Number(g.value),
        unit: "mg/dL",
        status: g.status
      }));
    }
    if (user?.id === "rahul_mumbai_demo") {
      return [
        { date: "May '26", value: 114, unit: "mg/dL", status: "Elevated" },
        { date: "Jul '26", value: 102, unit: "mg/dL", status: "Improving" },
        { date: "Sep '26", value: 92, unit: "mg/dL", status: "Normal Fasting" }
      ];
    }
    return [];
  }, [glucoseHistory, user?.id]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (activityCategoryFilter === "all") return recentActivities.slice(0, 4);
    return recentActivities.filter((act) => act.type === activityCategoryFilter).slice(0, 4);
  }, [recentActivities, activityCategoryFilter]);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 space-y-7 relative z-10">
        
        {/* ========================================================================= */}
        {/* TOP STATUS BREADCRUMB & LOG VITAL QUICK TRIGGER */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2.5 text-slate-500 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-extrabold text-slate-800 uppercase tracking-widest text-[10px]">
              SevaSetu Health Operating System
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 hidden sm:inline font-semibold">National ABDM Health Locker Connected</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all transform-gpu active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Record Vital
            </button>
            <Link
              to="/vault"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/80 shadow-xs transition-all hover:border-blue-300"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Vault Records ({vaultCounts.all})
            </Link>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* 1. HERO IDENTITY COMMAND CENTER (EXECUTIVE WHITE PEARL BANNER) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-slate-50 p-6 sm:p-8 md:p-9 border border-slate-200/90 shadow-md">
          {/* Subtle soft glowing light pools */}
          <div className="absolute top-0 right-0 w-[450px] h-[350px] bg-gradient-to-bl from-blue-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[250px] bg-gradient-to-tr from-emerald-400/10 via-teal-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Patient Identity
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {profile.district}, Maharashtra
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-2xs">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {profile.blood_group} Universal
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  Good Morning,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                    {profile.name}
                  </span>
                </h1>
                
                <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                  Longitudinal health telemetry synchronized with National Digital Health Mission (NDHM). Your clinical biomarkers, diagnostic records, and matched welfare benefits are up to date.
                </p>
              </div>

              {/* Dynamic Clinical Triage Alert Strip (Light Mode) */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3.5 ${
                clinicalStatus.isOptimal 
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-xs" 
                  : "bg-amber-50/80 border-amber-200 text-amber-900 shadow-xs"
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    clinicalStatus.isOptimal ? "bg-emerald-100 text-emerald-700 border border-emerald-300/60" : "bg-amber-100 text-amber-700 border border-amber-300/60"
                  }`}>
                    {clinicalStatus.isOptimal ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="truncate text-xs">
                    <span className="font-black text-slate-900 mr-1.5 tracking-wide">{clinicalStatus.title}:</span>
                    <span className="text-slate-600 font-medium">{clinicalStatus.summary}</span>
                  </div>
                </div>

                <Badge className={`shrink-0 text-[10px] font-black border-none uppercase tracking-wider px-3 py-1 ${
                  clinicalStatus.isOptimal ? "bg-emerald-600 text-white" : "bg-amber-500 text-slate-950"
                }`}>
                  {clinicalStatus.badge}
                </Badge>
              </div>
            </div>

            {/* ABHA WHITE CERAMIC DIGITAL HEALTH CARD */}
            <div className="relative group shrink-0 lg:w-[360px]">
              <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-300/40 via-cyan-300/30 to-emerald-300/40 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative rounded-3xl bg-white p-6 border border-slate-200 shadow-xl space-y-4 overflow-hidden">
                {/* Micro-mesh pattern background */}
                <div className="absolute inset-0 bg-[radial-gradient(#00000006_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                
                {/* Card Top: Government & Card Type */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700">Ayushman Bharat</p>
                      <p className="text-xs font-bold text-slate-900 tracking-tight">Digital Health Card</p>
                    </div>
                  </div>

                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase tracking-wider">
                    ABDM Active
                  </Badge>
                </div>

                {/* Micro Smart Chip Graphic & Contactless Icon */}
                <div className="flex items-center justify-between pt-1 relative z-10">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-400 shadow-xs flex items-center justify-around px-1">
                    <div className="w-0.5 h-full bg-amber-700/40" />
                    <div className="w-0.5 h-full bg-amber-700/40" />
                  </div>
                  <QrCode className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                {/* ABHA Number & Copy Action */}
                <div className="relative z-10 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ABHA Health Address</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-base font-black tracking-widest text-slate-900 group-hover:text-blue-700 transition-colors">
                      {profile.abha_id}
                    </span>
                    <button
                      onClick={handleCopyAbha}
                      title="Copy ABHA Number"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200"
                    >
                      {copiedAbha ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Patient Profile Completion Bar */}
                <div className="relative z-10 pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Profile Strength</span>
                    <span className="text-emerald-600 font-black">{profile.profile_completion_pct}%</span>
                  </div>
                  <Progress value={profile.profile_completion_pct} className="h-2 bg-slate-100" />
                </div>

                {/* Quick Profile Actions */}
                <div className="relative z-10 pt-1 flex gap-2">
                  <button
                    onClick={() => setLogModalOpen(true)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    Record Vital
                  </button>
                  <button
                    onClick={() => setIsAbhaModalOpen(true)}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center transition-colors border border-emerald-200 flex items-center justify-center gap-1 shadow-2xs"
                    title="Verify or Create ABHA Card"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verify ABHA
                  </button>
                  <Link
                    to="/profile"
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold text-center transition-colors border border-slate-200 flex items-center justify-center gap-1"
                  >
                    View ID
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. CORE VITAL SIGNS TELEMETRY HUB (4 MASTERWORK WHITE CARDS) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: CARDIOVASCULAR (BLOOD PRESSURE) */}
          <Link
            to="/vitals"
            className="group relative p-5 rounded-3xl bg-white hover:bg-rose-50/20 border border-slate-200/90 hover:border-rose-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform shadow-2xs">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold uppercase tracking-wider">
                Optimal
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cardiovascular</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight group-hover:text-rose-700 transition-colors">
                {latestVitals.bloodPressure} <span className="text-xs font-semibold text-slate-400">mmHg</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Target: &lt; 120/80 mmHg
              </p>
            </div>
          </Link>

          {/* CARD 2: HEMATOLOGY (HEMOGLOBIN HB) */}
          <Link
            to="/vitals"
            className="group relative p-5 rounded-3xl bg-white hover:bg-emerald-50/20 border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-2xs">
                <Activity className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider">
                Target Reached
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hematology (Hb)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight group-hover:text-emerald-700 transition-colors">
                {latestVitals.hemoglobin} <span className="text-xs font-semibold text-slate-400">g/dL</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Normal Range: 13.0 - 17.5 g/dL
              </p>
            </div>
          </Link>

          {/* CARD 3: METABOLIC (FASTING GLUCOSE) */}
          <Link
            to="/vitals"
            className="group relative p-5 rounded-3xl bg-white hover:bg-blue-50/20 border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold uppercase tracking-wider">
                Normal Fasting
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Metabolic Glucose</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight group-hover:text-blue-700 transition-colors">
                {latestVitals.glucose} <span className="text-xs font-semibold text-slate-400">mg/dL</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Baseline Target: 70 - 100 mg/dL
              </p>
            </div>
          </Link>

          {/* CARD 4: PULMONARY & HEART RATE (SPO2 / PULSE) */}
          <Link
            to="/vitals"
            className="group relative p-5 rounded-3xl bg-white hover:bg-teal-50/20 border border-slate-200/90 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-200 transform-gpu hover:-translate-y-1 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform shadow-2xs">
                <Wind className="w-5 h-5" />
              </div>
              <Badge className="bg-teal-50 text-teal-700 border border-teal-200 text-[9px] font-bold uppercase tracking-wider">
                Full Saturation
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Oxygen & Pulse</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight group-hover:text-teal-700 transition-colors">
                {latestVitals.spo2} <span className="text-xs font-normal text-slate-500">/ {latestVitals.pulse} bpm</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                SpO2 &gt; 95% • Normal Sinus
              </p>
            </div>
          </Link>

        </section>


        {/* ========================================================================= */}
        {/* 3. RAPID ACCESS ACTION DOCK (LIGHT THEME) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          <Link
            to="/analysis"
            className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-150 transform-gpu hover:-translate-y-0.5 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">Upload Diagnostics</p>
              <p className="text-[10px] text-slate-500 truncate">Analyze lab or X-Ray</p>
            </div>
          </Link>

          <button
            onClick={() => setLogModalOpen(true)}
            className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-md transition-all duration-150 transform-gpu hover:-translate-y-0.5 flex items-center gap-3.5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">Record Vitals</p>
              <p className="text-[10px] text-slate-500 truncate">BP, sugar & pulse log</p>
            </div>
          </button>

          <Link
            to="/schemes"
            className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-150 transform-gpu hover:-translate-y-0.5 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">Welfare Schemes</p>
              <p className="text-[10px] text-slate-500 truncate">30+ Bharat health policies</p>
            </div>
          </Link>

          <Link
            to="/health-directory"
            className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all duration-150 transform-gpu hover:-translate-y-0.5 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">Find Centers</p>
              <p className="text-[10px] text-slate-500 truncate">Hospitals & Kendras</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="group p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all duration-150 transform-gpu hover:-translate-y-0.5 flex items-center gap-3.5 col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Consult Seva AI</p>
              <p className="text-[10px] text-blue-100 truncate">Instant triage chat</p>
            </div>
          </Link>

        </section>


        {/* ========================================================================= */}
        {/* 4. MAIN BENTO GRID: LONGITUDINAL TRENDS + SCHEMES + HEALTH VAULT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLUMNS: INTERACTIVE BIOMARKERS & SCHEME INTELLIGENCE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* WIDGET 1: PRECISION LONGITUDINAL BIOMARKER PROGRESSION VISUALIZER */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Longitudinal Clinical Tracking</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Biomarker Progression Across Lab Records
                  </h3>
                </div>

                {/* Metric Selector Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 self-start sm:self-auto">
                  <button
                    onClick={() => setChartMetric("hb")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      chartMetric === "hb"
                        ? "bg-white text-emerald-700 shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Hemoglobin (Hb)
                  </button>
                  <button
                    onClick={() => setChartMetric("glucose")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      chartMetric === "glucose"
                        ? "bg-white text-blue-700 shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Fasting Glucose
                  </button>
                </div>
              </div>

              {/* Interactive Recharts Area Visualizer */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${chartMetric === "hb" ? "bg-emerald-500" : "bg-blue-600"}`} />
                    <span className="font-bold text-slate-700">
                      {chartMetric === "hb" ? "Hemoglobin (Target: 13.0 - 17.5 g/dL)" : "Fasting Blood Sugar (Target: 70 - 100 mg/dL)"}
                    </span>
                  </div>
                  <Badge variant="outline" className={`font-bold text-[10px] ${
                    chartMetric === "hb" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-blue-50 text-blue-700 border-blue-300"
                  }`}>
                    {chartMetric === "hb" ? "Latest: " + latestVitals.hemoglobin : "Latest: " + latestVitals.glucose}
                  </Badge>
                </div>

                <div className="h-[210px] w-full flex items-center justify-center">
                  {(chartMetric === "hb" ? hbChartData : glucoseChartData).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartMetric === "hb" ? hbChartData : glucoseChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="hbGradientLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="glucoseGradientLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: "#CBD5E1" }} />
                        <YAxis
                          domain={chartMetric === "hb" ? [10, 18] : [60, 150]}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<ClinicalChartTooltip />} />
                        <ReferenceLine
                          y={chartMetric === "hb" ? 13.0 : 100}
                          stroke={chartMetric === "hb" ? "#059669" : "#2563eb"}
                          strokeDasharray="4 4"
                          label={{
                            value: chartMetric === "hb" ? "13.0 Normal Min" : "100 mg/dL Target",
                            fill: chartMetric === "hb" ? "#059669" : "#2563eb",
                            fontSize: 10,
                            position: "insideTopRight"
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={chartMetric === "hb" ? "#059669" : "#2563eb"}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill={chartMetric === "hb" ? "url(#hbGradientLight)" : "url(#glucoseGradientLight)"}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Activity className="w-8 h-8 text-slate-300 mb-1.5 stroke-[1.5]" />
                      <p className="text-xs font-bold text-slate-700">No {chartMetric === "hb" ? "Hemoglobin" : "Glucose"} records yet</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                        Upload your diagnostic lab report or record your vital sign to plot your personalized clinical trajectory.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Link to="/analysis" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                          <Upload className="w-3 h-3" />
                          Upload Report
                        </Link>
                        <button onClick={() => setLogModalOpen(true)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                          <Plus className="w-3 h-3" />
                          Record Vital
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary Clinical Parameters Quick Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Pressure</p>
                    <p className="text-base font-black text-slate-900">{latestVitals.bloodPressure}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Optimal Target</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pulse Rhythm</p>
                    <p className="text-base font-black text-slate-900">{latestVitals.pulse}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Resting Sinus</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Oxygen</p>
                    <p className="text-base font-black text-slate-900">{latestVitals.spo2}</p>
                    <p className="text-[10px] text-teal-600 font-bold">Full Saturation</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                    <Wind className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Body Temp</p>
                    <p className="text-base font-black text-slate-900">{latestVitals.temperature}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Afebrile</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                    <Thermometer className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Longitudinally verified across {documents.length} diagnostic records & clinical memories.
                </span>
                <Link to="/vitals" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline">
                  Open Comprehensive Vitals Trajectory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>


            {/* WIDGET 2: BHARAT WELFARE & SCHEME INTELLIGENCE (SOVEREIGN ASSURANCE MATRIX - LIGHT THEME) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 p-6 sm:p-7 text-slate-900 border-2 border-blue-200/80 shadow-md space-y-5">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Bharat Welfare Intelligence</span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      3 Health Policies Potentially Matched
                    </h3>
                  </div>
                </div>
                <Badge className="bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 shadow-xs border border-amber-500/20">
                  Up to ₹5,00,000 Coverage
                </Badge>
              </div>

              <p className="relative z-10 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Based on your profile domicile in <strong>{profile.district}, Maharashtra</strong>, your family qualifies for state and central cashless hospitalization schemes.
              </p>

              <div className="relative z-10 space-y-3">
                
                {/* SCHEME 1: MJPJAY */}
                <div className="p-4 rounded-2xl bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-150 transform-gpu shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)</h4>
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold">Maharashtra State</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">₹5,00,000/family cashless coverage across 1,000+ empaneled hospitals in Maharashtra.</p>
                  </div>
                  <Link 
                    to={`/scheme/${encodeURIComponent("Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)")}`} 
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all text-center shadow-xs active:scale-95"
                  >
                    Check Eligibility
                  </Link>
                </div>

                {/* SCHEME 2: AYUSHMAN BHARAT PM-JAY */}
                <div className="p-4 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-150 transform-gpu shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Ayushman Bharat - PM-JAY</h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">National Scheme</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Universal secondary & tertiary hospitalization in 27,000+ empaneled hospitals across Bharat.</p>
                  </div>
                  <Link 
                    to={`/scheme/${encodeURIComponent("Ayushman Bharat - PM-JAY")}`} 
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all text-center shadow-xs active:scale-95"
                  >
                    View Benefits
                  </Link>
                </div>

                {/* SCHEME 3: AYUSHMAN AROGYA MANDIR */}
                <div className="p-4 rounded-2xl bg-white hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-150 transform-gpu shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Ayushman Arogya Mandir (Mumbai Municipal Ward)</h4>
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold">Primary Care</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Free 14 diagnostic tests and 65 essential medicines within 2.5 km of your locality.</p>
                  </div>
                  <Link 
                    to="/health-directory" 
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all text-center shadow-xs active:scale-95"
                  >
                    Find Center
                  </Link>
                </div>

              </div>
            </div>

          </div>


          {/* RIGHT 4 COLUMNS: HEALTH VAULT, EMERGENCY SOS & CARE NETWORK */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* WIDGET 3: EMERGENCY SOS QUICK HUB (LIGHT THEME) */}
            <div className="relative overflow-hidden rounded-3xl bg-rose-50/80 p-6 border-2 border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-rose-700">Emergency SOS</span>
                </div>
                <Badge className="bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider border-none">
                  Zero Internet Ready
                </Badge>
              </div>

              <div>
                <h4 className="text-lg font-black text-rose-950">Immediate Life-Saving Dispatch</h4>
                <p className="text-xs text-rose-800/80 font-medium mt-1 leading-relaxed">
                  1-tap rapid telephonic ambulance and emergency response for chest pain, stroke & trauma.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a 
                  href="tel:108" 
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-600 text-white font-black hover:bg-rose-700 transition-colors shadow-xs active:scale-95 transform-gpu"
                >
                  <PhoneCall className="w-5 h-5 mb-1" />
                  <span className="text-sm">Call 108</span>
                  <span className="text-[9px] font-medium opacity-90">National Ambulance</span>
                </a>

                <a 
                  href="tel:104" 
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-rose-200 text-rose-900 font-black hover:bg-rose-50 transition-colors shadow-xs active:scale-95 transform-gpu"
                >
                  <PhoneCall className="w-5 h-5 mb-1 text-rose-600" />
                  <span className="text-sm">Call 104</span>
                  <span className="text-[9px] font-medium text-slate-500">Health Help 24x7</span>
                </a>
              </div>

              <Link 
                to="/offline-first-aid" 
                className="w-full py-2.5 px-3 bg-white border border-rose-300 text-rose-800 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                Offline First-Aid Pocketbook (CPR, Snakebite, Burns)
              </Link>
            </div>


            {/* WIDGET 4: HEALTH VAULT OVERVIEW */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  Health Records Vault
                </h3>
                <Link to="/vault" className="text-xs font-bold text-blue-600 hover:underline">
                  Manage ({vaultCounts.all}) →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">{vaultCounts.lab}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lab Reports</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">{vaultCounts.prescription}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prescriptions</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">{vaultCounts.imaging}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Imaging & X-Rays</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">{vaultCounts.discharge + vaultCounts.insurance}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discharge & Cards</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Link 
                  to="/analysis" 
                  className="py-3 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Report
                </Link>
                <Link 
                  to="/vitals" 
                  className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-slate-200"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  View All Vitals
                </Link>
              </div>
            </div>


            {/* WIDGET 5: CARE NETWORK & UPCOMING APPOINTMENT */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Upcoming Clinical Visit
                </h3>
                {upcomingAppointment ? (
                  <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px]">
                    Confirmed
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px]">
                    None Scheduled
                  </Badge>
                )}
              </div>

              {upcomingAppointment ? (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{upcomingAppointment.facility}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {upcomingAppointment.location} • {upcomingAppointment.specialty}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100 text-xs text-slate-700">
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {upcomingAppointment.date} • {upcomingAppointment.time}
                    </span>
                    {upcomingAppointment.phone ? (
                      <a 
                        href={`tel:${upcomingAppointment.phone}`} 
                        className="font-bold text-indigo-700 hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Desk
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center space-y-2">
                  <Calendar className="w-7 h-7 text-slate-300 mx-auto stroke-[1.5]" />
                  <p className="text-xs font-bold text-slate-700">No appointments scheduled</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Connect with government civil hospitals or book an instant tele-consultation.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/appointment"
                      className="inline-flex py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Book Consultation
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <Link 
                  to="/health-directory" 
                  className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors"
                >
                  <span>Find Accredited Cardiologists in Mumbai</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* 5. RECENT HEALTH ACTIVITY STREAM (WITH CATEGORY FILTER TABS) */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Recent Clinical Activity Stream
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Automatically indexed from uploaded diagnostic reports, scans, and verified prescriptions.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setActivityCategoryFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityCategoryFilter === "all" ? "bg-white text-blue-600 font-black shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActivityCategoryFilter("lab")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityCategoryFilter === "lab" ? "bg-white text-emerald-600 font-black shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Lab Tests
              </button>
              <button
                onClick={() => setActivityCategoryFilter("imaging")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityCategoryFilter === "imaging" ? "bg-white text-purple-600 font-black shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                X-Rays & Imaging
              </button>
              <button
                onClick={() => setActivityCategoryFilter("prescription")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityCategoryFilter === "prescription" ? "bg-white text-blue-600 font-black shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Prescriptions
              </button>
            </div>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all duration-150 transform-gpu">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    act.type === 'imaging' ? 'bg-purple-100 text-purple-700' : act.type === 'prescription' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {act.type === 'imaging' ? <ScanLine className="w-5 h-5" /> : act.type === 'prescription' ? <FileText className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                  </div>
                  <div className="text-xs overflow-hidden min-w-0">
                    <p className="font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-slate-500 truncate text-[11px] mt-0.5">{act.detail}</p>
                    <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 uppercase tracking-wider">
                      {act.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">No {activityCategoryFilter !== 'all' ? activityCategoryFilter : ''} activity recorded yet</p>
                  <p className="text-xs text-slate-500 font-medium">Upload a medical report, lab test, or prescription to update your timeline.</p>
                </div>
              </div>
              <Link to="/analysis" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs">
                Upload Document
              </Link>
            </div>
          )}
        </section>


        {/* ========================================================================= */}
        {/* 6. CONVERSATIONAL CLINICAL AI LAUNCHER (TRIAGE CHIPS - LIGHT THEME) */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Conversational Clinical Intelligence</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Ask Seva AI Anything About Your Health
              </h3>
            </div>
            <Link to="/chat" className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline flex items-center gap-1">
              Open Full Chat <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {TRIAGE_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleLaunchChat(chip.prompt)}
                className="text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all duration-150 transform-gpu group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded">
                      {chip.badge}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-black text-sm text-slate-900 group-hover:text-blue-900 mb-1.5 leading-snug">
                    "{chip.prompt}"
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {chip.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Ask AI Now →
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* QUICK LOG VITAL DIALOG (MODAL - LIGHT THEME) */}
      {/* ========================================================================= */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 rounded-3xl p-6 border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Record Vital Measurement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Directly save your clinical vitals into your longitudinal health timeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuickLogSubmit} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Select Parameter
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg" },
                  { key: "glucose", label: "Fasting Sugar", unit: "mg/dL" },
                  { key: "pulse", label: "Pulse Rhythm", unit: "bpm" },
                  { key: "spo2", label: "Oxygen SpO2", unit: "%" },
                  { key: "temperature", label: "Body Temp", unit: "°F" },
                  { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL" }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => setLogKey(item.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      logKey === item.key
                        ? "bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.unit}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Measurement Value
              </label>
              <input
                type="text"
                required
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                placeholder={
                  logKey === "blood_pressure" ? "120/80" :
                  logKey === "glucose" ? "95" :
                  logKey === "pulse" ? "72" :
                  logKey === "spo2" ? "98" :
                  logKey === "temperature" ? "98.6" : "14.2"
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {logKey === "blood_pressure" ? "Enter Systolic/Diastolic in mmHg (e.g. 120/80)" :
                 logKey === "glucose" ? "Enter Fasting Blood Sugar in mg/dL (e.g. 95)" :
                 logKey === "pulse" ? "Enter Heart Rate in bpm (e.g. 72)" :
                 logKey === "spo2" ? "Enter SpO2 Percentage (e.g. 98)" :
                 logKey === "temperature" ? "Enter Oral/Axillary temperature in °F (e.g. 98.6)" :
                 "Enter CBC Hemoglobin in g/dL (e.g. 14.2)"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Clinical Context
              </label>
              <select
                value={logContext}
                onChange={(e) => setLogContext(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="Routine Self-Check">Routine Home Self-Check</option>
                <option value="Clinic Checkup">Clinic / Hospital Visit</option>
                <option value="Post-Medication Followup">Post-Medication Followup</option>
                <option value="Morning Fasting Baseline">Morning Fasting Baseline</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLogModalOpen(false)}
                className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingLog}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                {submittingLog ? "Saving..." : "Save to Timeline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ABDM / ABHA Sovereign Gateway Modal */}
      <AbhaGatewayModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        currentAbhaId={profile.abha_id || "91-8273-4920-1124"}
        userName={profile.name || "Rahul Sharma"}
        userDistrict={profile.district || "Mumbai"}
        onSuccess={(updated) => {
          setProfile((prev: any) => ({
            ...prev,
            abha_id: updated.abha_number,
            abha_address: updated.abha_address
          }));
        }}
      />
    </div>
  );
};

export default Dashboard;
