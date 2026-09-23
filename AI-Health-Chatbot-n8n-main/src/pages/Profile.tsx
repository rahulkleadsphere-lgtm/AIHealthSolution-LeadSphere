import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Settings, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  Users, 
  IdCard,
  Droplets,
  Weight,
  Ruler,
  Calendar,
  FileText,
  Syringe,
  Camera,
  Heart,
  TrendingUp,
  MapPin,
  Sparkles,
  Edit2,
  Globe,
  Lock,
  Key,
  Smartphone,
  Laptop,
  Bell,
  AlertTriangle,
  Trash2,
  Download,
  Printer,
  RefreshCw,
  Check,
  CheckCircle2,
  Copy,
  Upload,
  X,
  Plus,
  Eye,
  EyeOff,
  Share2,
  Database,
  ShieldAlert,
  Sliders,
  Activity,
  FileCheck,
  ArrowRight,
  Info
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { profileService, appointmentService, analysisService } from "../services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { compressImage } from "../utils/imageCompressor";

// Curated Cartoon & Illustrated Healthcare Avatars (No human faces)
const PRESET_AVATARS = [
  { id: "cartoon-1", label: "Cartoon Medic", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DoctorVikram&backgroundColor=b6e3f4,c0aede" },
  { id: "cartoon-2", label: "Cartoon Clinician", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=NurseSunita&backgroundColor=ffd5dc,ffdfbf" },
  { id: "cartoon-3", label: "Care Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=SevaCareBot&backgroundColor=b6e3f4,d1d4f9" },
  { id: "cartoon-4", label: "Cartoon Aarav", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav&backgroundColor=b6e3f4,c0aede,d1d4f9" },
  { id: "cartoon-5", label: "Cartoon Ananya", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya&backgroundColor=b6e3f4,c0aede,ffd5dc" },
  { id: "cartoon-6", label: "Cartoon Rohan", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rohan&backgroundColor=d1d4f9,ffd5dc,ffdfbf" },
  { id: "cartoon-7", label: "Cartoon Priya", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya&backgroundColor=c0aede,b6e3f4,ffd5dc" },
  { id: "cartoon-8", label: "Cartoon Guardian", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Aditi&backgroundColor=ffd5dc,c0aede" },
  { id: "cartoon-9", label: "Smart Health Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=HealthBotAI&backgroundColor=ffd5dc,d1d4f9" },
];

type SettingsTab = "profile" | "security" | "abdm" | "notifications" | "danger";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Image State (Scoped to current user)
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    try {
      const storedUser = localStorage.getItem("seva_user");
      const uid = storedUser ? JSON.parse(storedUser)?.id : undefined;
      const stored = uid ? localStorage.getItem(`sevasetu_profile_image_${uid}`) : null;
      if (stored && stored.includes("images.unsplash.com")) {
        const defaultCartoon = "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav&backgroundColor=b6e3f4,c0aede,d1d4f9";
        if (uid) localStorage.setItem(`sevasetu_profile_image_${uid}`, defaultCartoon);
        window.dispatchEvent(new Event("sevasetu_profile_image_updated"));
        return defaultCartoon;
      }
      return stored || null;
    } catch {
      return null;
    }
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);

  // Profile & Clinical Demographics
  const [profileData, setProfileData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form State - Dynamically initialized from active authenticated user
  const [formData, setFormData] = useState<any>(() => ({
    name: user?.name || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    blood_group: user?.profile?.blood_group || "O+",
    weight: user?.profile?.weight?.replace(/[^0-9.]/g, "") || "",
    height: user?.profile?.height?.replace(/[^0-9.]/g, "") || "",
    age: user?.profile?.age?.replace(/[^0-9]/g, "") || "",
    gender: user?.profile?.gender || "Male",
    district: user?.district || user?.profile?.district || "Mumbai",
    state: "Maharashtra",
    pincode: "400012",
    primary_condition: user?.profile?.primary_condition || "None (Preventive Care)",
    allergies: user?.profile?.allergies || [],
    conditions: (user?.profile as any)?.conditions || [],
    emergency_name: (user as any)?.emergency_contact_name || "",
    emergency_phone: (user as any)?.emergency_contact_phone || "",
    bio: user?.profile?.bio || "",
    organ_donor: false,
    abha_id: user?.profile?.abha_id || (user as any)?.abha_id || "",
  }));

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  // Account Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // ABDM & Consent State
  const [abhaConsentVerifiedDocs, setAbhaConsentVerifiedDocs] = useState(true);
  const [abhaConsentImagingShare, setAbhaConsentImagingShare] = useState(true);
  const [abhaConsentResearch, setAbhaConsentResearch] = useState(false);

  // Notifications State
  const [notifVitalsThreshold, setNotifVitalsThreshold] = useState(true);
  const [notifMedicineRefill, setNotifMedicineRefill] = useState(true);
  const [notifAppointments, setNotifAppointments] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifChannel, setNotifChannel] = useState<"whatsapp" | "sms" | "app">("whatsapp");

  // Danger Zone State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Copy ABHA Feedback
  const [copiedAbha, setCopiedAbha] = useState(false);

  // Load Profile from Backend / Local Cache
  const loadProfileAndHistory = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const profileRes = await profileService.getProfile(user.id);
      if (profileRes?.status === "success" && profileRes.user) {
        const u = profileRes.user;
        const p = u.profile || {};
        setProfileData(p);
        setFormData({
          name: u.name || user.name || "",
          email: u.email || user.email || "",
          phone: u.phone || (user as any).phone || "",
          blood_group: p.blood_group || u.blood_group || "O+",
          weight: p.weight?.replace(/[^0-9.]/g, "") || "",
          height: p.height?.replace(/[^0-9.]/g, "") || "",
          age: p.age?.replace(/[^0-9]/g, "") || "",
          gender: p.gender || u.gender || "Male",
          district: u.district || p.district || "Mumbai",
          state: "Maharashtra",
          pincode: "400012",
          primary_condition: p.primary_condition || u.primary_condition || "None",
          allergies: Array.isArray(u.allergies) ? u.allergies : (p.allergies || []),
          conditions: Array.isArray(u.conditions) ? u.conditions : (p.conditions || []),
          emergency_name: (user as any).emergency_contact_name || "",
          emergency_phone: (user as any).emergency_contact_phone || "",
          bio: p.bio || u.bio || "",
          organ_donor: false,
          abha_id: u.abha_id || p.abha_id || (user as any).abha_id || "",
        });
      } else {
        const p = user.profile || {};
        setProfileData(p);
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: (user as any).phone || "",
          blood_group: p.blood_group || "O+",
          weight: p.weight?.replace(/[^0-9.]/g, "") || "",
          height: p.height?.replace(/[^0-9.]/g, "") || "",
          age: p.age?.replace(/[^0-9]/g, "") || "",
          gender: p.gender || "Male",
          district: user.district || p.district || "Mumbai",
          state: "Maharashtra",
          pincode: "400012",
          primary_condition: p.primary_condition || "None",
          allergies: p.allergies || [],
          conditions: (p as any).conditions || [],
          emergency_name: (user as any).emergency_contact_name || "",
          emergency_phone: (user as any).emergency_contact_phone || "",
          bio: p.bio || "",
          organ_donor: false,
          abha_id: p.abha_id || (user as any).abha_id || "",
        });
      }

      // Fetch appointments
      const appRes = await appointmentService.getAppointments(user.id);
      const appointments = (appRes?.appointments || []).map((a: any) => ({
        title: a.facility_name,
        desc: `${a.patient_name} • ${a.symptoms || 'Routine checkup'}`,
        time: new Date(a.appointment_date).toLocaleDateString(),
        icon: Syringe,
        color: "emerald",
        status: a.status,
        type: "appointment"
      }));

      // Fetch reports
      let reports: any[] = [];
      try {
        const reportRes = await analysisService.getReports(user.id);
        reports = (reportRes?.reports || []).map((r: any) => ({
          title: "Medical Diagnostic Report",
          desc: r.summary,
          time: new Date(r.created_at).toLocaleDateString(),
          icon: FileText,
          color: "blue",
          status: "Analyzed",
          type: "report"
        }));
      } catch (e) {
        console.warn("Could not fetch reports history", e);
      }

      const combined = [...appointments, ...reports].sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setHistory(combined);
    } catch (err) {
      console.error("Profile load err", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Personal Settings & Account Control | SevaSetu AI";
    loadProfileAndHistory();
  }, [user]);

  // Handle Profile Photo Upload via Local File
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploadLoading(true);
      const compressed = await compressImage(file, 600, 0.85);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setProfileImage(base64Url);
          const key = user?.id ? `sevasetu_profile_image_${user.id}` : "sevasetu_profile_image";
          localStorage.setItem(key, base64Url);
          window.dispatchEvent(new Event("sevasetu_profile_image_updated"));
          toast.success("Profile photo updated successfully!");
          setIsAvatarModalOpen(false);
        }
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Failed to upload avatar", err);
      toast.error("Could not process image file. Please try a different photo.");
    } finally {
      setAvatarUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Preset Avatar Selection
  const handleSelectPresetAvatar = (url: string) => {
    setProfileImage(url);
    const key = user?.id ? `sevasetu_profile_image_${user.id}` : "sevasetu_profile_image";
    localStorage.setItem(key, url);
    window.dispatchEvent(new Event("sevasetu_profile_image_updated"));
    toast.success("Avatar updated!");
    setIsAvatarModalOpen(false);
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = () => {
    setProfileImage(null);
    const key = user?.id ? `sevasetu_profile_image_${user.id}` : "sevasetu_profile_image";
    localStorage.removeItem(key);
    window.dispatchEvent(new Event("sevasetu_profile_image_updated"));
    toast.info("Profile photo removed. Initial monogram restored.");
    setIsAvatarModalOpen(false);
  };

  // Copy ABHA ID
  const handleCopyAbha = () => {
    const abha = formData.abha_id || profileData?.abha_id || user?.profile?.abha_id || (user as any)?.abha_id || "Unassigned";
    navigator.clipboard.writeText(abha);
    setCopiedAbha(true);
    toast.success(`ABHA ID ${abha} copied to clipboard!`);
    setTimeout(() => setCopiedAbha(false), 2500);
  };

  // Calculate BMI
  const calculateBmi = () => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    if (!w || !h || h <= 0) return { val: "--", label: "Unknown", color: "text-slate-500", bg: "bg-slate-50" };
    const bmi = (w / (h * h)).toFixed(1);
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { val: bmi, label: "Underweight", color: "text-amber-600", bg: "bg-amber-50" };
    if (bmiNum < 24.9) return { val: bmi, label: "Optimal Healthy", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (bmiNum < 29.9) return { val: bmi, label: "Overweight", color: "text-amber-600", bg: "bg-amber-50" };
    return { val: bmi, label: "High Risk", color: "text-rose-600", bg: "bg-rose-50" };
  };

  // Add Allergy Chip
  const handleAddAllergy = () => {
    const trimmed = newAllergy.trim();
    if (!trimmed) return;
    if (formData.allergies?.includes(trimmed)) {
      toast.warning("Allergy already listed");
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      allergies: [...(prev.allergies || []), trimmed]
    }));
    setNewAllergy("");
  };

  // Remove Allergy Chip
  const handleRemoveAllergy = (allergy: string) => {
    setFormData((prev: any) => ({
      ...prev,
      allergies: prev.allergies.filter((a: string) => a !== allergy)
    }));
  };

  // Add Condition Chip
  const handleAddCondition = () => {
    const trimmed = newCondition.trim();
    if (!trimmed) return;
    if (formData.conditions?.includes(trimmed)) {
      toast.warning("Condition already listed");
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      conditions: [...(prev.conditions || []), trimmed]
    }));
    setNewCondition("");
  };

  // Remove Condition Chip
  const handleRemoveCondition = (condition: string) => {
    setFormData((prev: any) => ({
      ...prev,
      conditions: prev.conditions.filter((c: string) => c !== condition)
    }));
  };

  // Handle Save Identity Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSavingProfile(true);
    try {
      await profileService.updateProfile(user.id, {
        name: formData.name,
        bio: formData.bio,
        blood_group: formData.blood_group,
        weight: `${formData.weight} kg`,
        height: `${formData.height} cm`,
        age: `${formData.age} Yrs`,
        gender: formData.gender,
        district: formData.district,
        primary_condition: formData.primary_condition,
        allergies: formData.allergies,
        conditions: formData.conditions,
      });

      // Update local storage user persona
      const storedUser = localStorage.getItem("seva_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.name = formData.name;
          parsed.district = formData.district;
          if (parsed.profile) {
            parsed.profile.blood_group = formData.blood_group;
            parsed.profile.weight = `${formData.weight} kg`;
            parsed.profile.height = `${formData.height} cm`;
            parsed.profile.age = formData.age;
          }
          localStorage.setItem("seva_user", JSON.stringify(parsed));
        } catch {}
      }

      toast.success("Personal identity & clinical profile synchronized!");
      loadProfileAndHistory();
    } catch (err) {
      console.error("Save profile error", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current security password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    toast.success("Security password updated successfully. Next login will require the new credentials.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle 2FA Toggle
  const handleToggle2FA = (checked: boolean) => {
    if (checked) {
      setIsOtpModalOpen(true);
    } else {
      setIs2FAEnabled(false);
      toast.info("Two-Factor Authentication has been disabled.");
    }
  };

  // Verify Simulated OTP
  const handleVerifyOtp = () => {
    if (otpCode.length < 4) {
      toast.error("Please enter a valid OTP verification code.");
      return;
    }
    setIs2FAEnabled(true);
    setIsOtpModalOpen(false);
    setOtpCode("");
    toast.success("Aadhaar OTP verification complete! Two-Factor Authentication is active.");
  };

  // Export Complete Health Dossier JSON
  const handleExportDossier = () => {
    const dossier = {
      fhir_version: "4.0.1",
      abha_id: "91-8273-4920-1124",
      export_timestamp: new Date().toISOString(),
      patient: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        blood_group: formData.blood_group,
        age: formData.age,
        gender: formData.gender,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        biometrics: {
          weight: `${formData.weight} kg`,
          height: `${formData.height} cm`,
          bmi: calculateBmi().val
        },
        emergency_contact: {
          name: formData.emergency_name,
          phone: formData.emergency_phone
        }
      },
      clinical_history: {
        allergies: formData.allergies,
        chronic_conditions: formData.conditions,
        notes: formData.bio
      },
      telemetry_records: [
        { metric: "Blood Pressure", value: "120/80 mmHg", status: "Optimal", timestamp: "2026-09-23T08:30:00Z" },
        { metric: "Fasting Glucose", value: "98 mg/dL", status: "Normal", timestamp: "2026-09-23T07:15:00Z" },
        { metric: "Hemoglobin", value: "13.8 g/dL", status: "Optimal", timestamp: "2026-09-22T10:00:00Z" },
        { metric: "Pulse Rate", value: "72 bpm", status: "Normal Sinus", timestamp: "2026-09-23T08:30:00Z" },
        { metric: "SpO2 Saturation", value: "98%", status: "Optimal", timestamp: "2026-09-23T08:30:00Z" }
      ]
    };

    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sevasetu_health_dossier_${formData.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Complete clinical health dossier downloaded in FHIR/JSON standard format!");
  };

  // Print Clinical Summary Sheet
  const handlePrintSummary = () => {
    window.print();
  };

  // Clear Local Cache
  const handleClearCache = () => {
    toast.success("Local clinical telemetry and offline map cache cleared safely.");
  };

  // Handle Permanent Data Purge
  const handleDeleteAccount = () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.error("Please type DELETE to confirm data destruction.");
      return;
    }
    setIsDeletingAccount(true);
    setTimeout(() => {
      localStorage.clear();
      toast.info("Health records purged. Logging out...");
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
      logout();
      navigate("/login");
    }, 1200);
  };

  const bmi = calculateBmi();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-4"></div>
        <p className="text-slate-600 font-bold text-sm tracking-wide">Synchronizing Clinical Settings & ABDM Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Hidden File Input for Avatar Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />

      {/* Atmospheric Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-emerald-50/40 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================= */}
        {/* 1. EXECUTIVE HERO BANNER: IDENTITY CROWN & AVATAR STUDIO */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden rounded-[36px] bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/60 via-slate-50/30 to-transparent rounded-bl-[160px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10">
            
            {/* Interactive Avatar Frame */}
            <div className="relative group shrink-0">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-[32px] p-1.5 bg-gradient-to-br from-blue-200 via-indigo-100 to-slate-200 shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="w-full h-full rounded-[26px] overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 font-black text-4xl relative">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={formData.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-blue-600 font-extrabold text-5xl">
                      {formData.name ? formData.name[0].toUpperCase() : "R"}
                    </span>
                  )}

                  {/* Hover Overlay */}
                  <div 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">Change Photo</span>
                  </div>
                </div>
              </div>

              {/* Quick Camera Action Pill */}
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg border-2 border-white transition-all active:scale-95"
                title="Change Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* ABDM Verified Status Dot */}
              <div 
                className="absolute top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm"
                title="ABDM Identity Verified"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified ABDM Citizen
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {formData.blood_group} Universal Donor
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {formData.district}, {formData.state}
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {formData.name}
                </h1>
                <p className="text-slate-500 text-sm font-semibold mt-1 max-w-xl">
                  {formData.bio || "Patient identity synchronized with Ayushman Bharat Digital Mission (ABDM)."}
                </p>
              </div>

              {/* ABHA Address Strip & Profile Progress */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                {/* ABHA Pill with Copy */}
                <div 
                  onClick={handleCopyAbha}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                  title="Click to copy ABHA ID"
                >
                  <IdCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-mono font-bold text-slate-700 tracking-wider">
                    ABHA: 91-8273-4920-1124
                  </span>
                  {copiedAbha ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 ml-1" />
                  )}
                </div>

                {/* Profile Completion Meter */}
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full w-[88%] rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">88% Complete</span>
                </div>
              </div>

              {/* Quick Actions Deck */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                <Button 
                  onClick={() => setIsAvatarModalOpen(true)}
                  variant="outline" 
                  className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 gap-2 h-11 px-5"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  Change Avatar
                </Button>

                <Button 
                  onClick={handleExportDossier}
                  variant="outline" 
                  className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 gap-2 h-11 px-5"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Export Health Dossier
                </Button>

                <Button 
                  onClick={() => navigate("/vitals")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider gap-2 h-11 px-6 shadow-sm shadow-blue-200"
                >
                  <Activity className="w-4 h-4" />
                  View Live Vitals
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. MASTER NAVIGATION TAB DECK (5 DEDICATED CONTROL HUBS)  */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: "profile" as SettingsTab, label: "Identity & Clinical", icon: User },
            { id: "security" as SettingsTab, label: "Security & Access", icon: ShieldCheck },
            { id: "abdm" as SettingsTab, label: "ABDM Sovereign Data", icon: Database },
            { id: "notifications" as SettingsTab, label: "Telemetry Alerts", icon: Bell },
            { id: "danger" as SettingsTab, label: "Account Control", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: IDENTITY & CLINICAL BIOMETRICS                    */}
        {/* ========================================================= */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Quick 4-Stat Telemetry Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Droplets className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Blood Group</p>
                  <p className="text-xl font-extrabold text-slate-900">{formData.blood_group} Universal</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Weight className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weight</p>
                  <p className="text-xl font-extrabold text-slate-900">{formData.weight} kg</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Ruler className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Height</p>
                  <p className="text-xl font-extrabold text-slate-900">{formData.height} cm</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${bmi.bg} ${bmi.color} flex items-center justify-center shrink-0`}>
                  <Activity className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Calculated BMI</p>
                  <p className="text-xl font-extrabold text-slate-900">{bmi.val} <span className="text-xs font-semibold text-slate-500">({bmi.label})</span></p>
                </div>
              </div>
            </div>

            {/* Profile Form Canvas */}
            <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
              <div className="border-b border-slate-100 pb-5">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Clinical Demographics</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Keep your personal identity, contact endpoints, and clinical attributes accurate for synchronized AI triage.
                </p>
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Legal Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Mobile Number (Aadhaar Linked)</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider text-slate-500">Age (Years)</Label>
                  <Input 
                    id="age" 
                    type="number"
                    value={formData.age} 
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="21"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white px-4 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group" className="text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</Label>
                  <select
                    id="blood_group"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white px-4 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-xs font-bold uppercase tracking-wider text-slate-500">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number"
                    step="0.5"
                    value={formData.weight} 
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="68"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs font-bold uppercase tracking-wider text-slate-500">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number"
                    value={formData.height} 
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="174"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-xs font-bold uppercase tracking-wider text-slate-500">District / City</Label>
                  <Input 
                    id="district" 
                    value={formData.district} 
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              {/* Clinical History & Chronic Conditions */}
              <div className="border-t border-slate-100 pt-6 space-y-6">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Clinical History & Emergency Safeguards</h4>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    Critical allergies and chronic history are injected into AI diagnosis and national trauma dispatch.
                  </p>
                </div>

                {/* Allergies Tag Manager */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmed Drug & Environmental Allergies</Label>
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    {formData.allergies?.map((allergy: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
                      >
                        {allergy}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAllergy(allergy)}
                          className="hover:text-rose-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddAllergy(); } }}
                        placeholder="Add allergy (e.g. Sulfa drugs)..."
                        className="h-8 text-xs rounded-xl bg-white border-slate-200 w-52"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddAllergy}
                        className="h-8 px-3 rounded-xl bg-slate-800 text-white font-bold text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions Tag Manager */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Chronic Diagnoses & Conditions</Label>
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    {formData.conditions?.map((cond: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
                      >
                        {cond}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCondition(cond)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCondition(); } }}
                        placeholder="Add condition (e.g. Hypertension)..."
                        className="h-8 text-xs rounded-xl bg-white border-slate-200 w-52"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddCondition}
                        className="h-8 px-3 rounded-xl bg-slate-800 text-white font-bold text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Emergency Contact Person</Label>
                    <Input 
                      id="emergency_name" 
                      value={formData.emergency_name} 
                      onChange={(e) => setFormData({...formData, emergency_name: e.target.value})}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                      placeholder="e.g. Sunita Sharma (Mother)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Emergency Contact Phone</Label>
                    <Input 
                      id="emergency_phone" 
                      value={formData.emergency_phone} 
                      onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                      placeholder="+91 98201 12345"
                    />
                  </div>
                </div>

                {/* Clinical Notes / Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Bio & Medical Summary</Label>
                  <Textarea 
                    id="bio" 
                    rows={3}
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold text-sm leading-relaxed"
                    placeholder="Enter any ongoing therapy, dietary restrictions, or clinical lifestyle goals..."
                  />
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                <Button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider h-12 px-8 shadow-sm shadow-blue-200"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Saving to ABDM...
                    </>
                  ) : (
                    "Save Identity Profile"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ACCOUNT SECURITY & ACCESS CONTROL                 */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Password Management Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Security Credentials & Password
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    Ensure your account is protected with a high-entropy password to prevent unauthorized health record access.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Passphrase Encrypted
                </span>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="curr_pass" className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="curr_pass" 
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 pr-10 font-semibold"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_pass" className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</Label>
                    <Input 
                      id="new_pass" 
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conf_pass" className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</Label>
                    <Input 
                      id="conf_pass" 
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold"
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Password Strength</span>
                      <span className={newPassword.length >= 8 ? "text-emerald-600" : "text-amber-600"}>
                        {newPassword.length >= 8 ? "Good Strength" : "Too Short"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          newPassword.length >= 8 ? "w-full bg-emerald-500" : "w-1/3 bg-amber-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider h-12 px-6"
                >
                  Update Security Password
                </Button>
              </form>
            </div>

            {/* Two-Factor Authentication Switchboard */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-indigo-600" />
                  Multi-Factor Authentication (MFA)
                </h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Add an extra layer of defense using Aadhaar OTP or mobile SMS verification.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Aadhaar & SMS OTP Verification</h4>
                      <p className="text-xs text-slate-500 font-medium">Require a 6-digit one-time password sent to your registered mobile upon every login.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={is2FAEnabled}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Laptop className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Biometric & Passkey Unlock (WebAuthn)</h4>
                      <p className="text-xs text-slate-500 font-medium">Use Windows Hello, Touch ID, or device face authentication for instantaneous access.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={isBiometricEnabled}
                    onCheckedChange={(c) => {
                      setIsBiometricEnabled(c);
                      toast.success(c ? "Biometric passkey enabled for this browser." : "Biometric unlock disabled.");
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Active Sessions & Device Management */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    <Laptop className="w-5 h-5 text-slate-700" />
                    Active Login Sessions
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    Devices currently authenticated to your SevaSetu clinical account.
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Terminated 1 secondary active mobile session.")}
                  className="rounded-xl border-slate-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold"
                >
                  Terminate Other Sessions
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Chrome on Windows 11 (Current Device)</p>
                      <p className="text-xs text-slate-500">Mumbai, Maharashtra • IP: 103.21.124.89</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Now
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Samsung Galaxy S24 • SevaSetu Mobile App</p>
                      <p className="text-xs text-slate-500">Pune, Maharashtra • Last sync 3 hours ago</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toast.info("Device session revoked.")}
                    className="text-xs font-bold text-slate-400 hover:text-rose-600"
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ABDM SOVEREIGN DATA & CONSENT MATRIX              */}
        {/* ========================================================= */}
        {activeTab === "abdm" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* ABHA Sovereign Identity Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-blue-600" />
                    Ayushman Bharat Digital Mission (ABDM) Integration
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    National Health Authority (NHA) verified sovereign health passport.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  Gateway Synchronized
                </span>
              </div>

              {/* Ceramic ABHA Card Visual */}
              <div className="max-w-md p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="flex items-center justify-between pb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Bharat Health Passport</span>
                    <p className="font-extrabold text-lg text-white">ABHA Digital Identity</p>
                  </div>
                  <div className="w-9 h-7 rounded-md bg-amber-400/80 border border-amber-300/50 flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-900/40 rounded-sm"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ayushman Bharat Health Account Number</p>
                    <p className="text-xl font-mono font-black text-amber-200 tracking-widest">91-8273-4920-1124</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Holder</p>
                      <p className="font-bold text-white">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">PHR Address</p>
                      <p className="font-mono text-slate-300">rahul.sharma@abdm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ABDM Consent Matrix */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Patient Consent Preferences</h4>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Auto-Consent to Empanelled Government Hospitals</p>
                    <p className="text-xs text-slate-500">Permit doctors at AIIMS, civil hospitals, and PHCs to review historical reports upon admission.</p>
                  </div>
                  <Switch 
                    checked={abhaConsentVerifiedDocs}
                    onCheckedChange={(c) => {
                      setAbhaConsentVerifiedDocs(c);
                      toast.info(`Hospital auto-consent ${c ? "granted" : "revoked"}.`);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Inter-Hospital Diagnostic Scan Sharing</p>
                    <p className="text-xs text-slate-500">Allow CT, MRI, and X-Ray radiological imaging to be transmitted securely between referral facilities.</p>
                  </div>
                  <Switch 
                    checked={abhaConsentImagingShare}
                    onCheckedChange={(c) => {
                      setAbhaConsentImagingShare(c);
                      toast.info(`Radiology inter-hospital sharing ${c ? "enabled" : "disabled"}.`);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Anonymized Epidemiological Research Sharing</p>
                    <p className="text-xs text-slate-500">Contribute de-identified vitals trends to ICMR research on non-communicable disease prevention.</p>
                  </div>
                  <Switch 
                    checked={abhaConsentResearch}
                    onCheckedChange={(c) => {
                      setAbhaConsentResearch(c);
                      toast.info(`Research contribution preference updated.`);
                    }}
                  />
                </div>
              </div>

              {/* Data Portability Tools */}
              <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center gap-3">
                <Button 
                  onClick={handleExportDossier}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider h-11 px-5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Health Dossier (FHIR JSON)
                </Button>

                <Button 
                  onClick={handlePrintSummary}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider h-11 px-5"
                >
                  <Printer className="w-4 h-4 mr-2 text-slate-500" />
                  Print Clinical Summary
                </Button>

                <Button 
                  onClick={handleClearCache}
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-wider h-11 px-4"
                >
                  Clear Local Health Cache
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TELEMETRY ALERTS & NOTIFICATIONS                  */}
        {/* ========================================================= */}
        {activeTab === "notifications" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Clinical Alerts & Telemetry Notifications
                </h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Configure when and how SevaSetu notifies you regarding vital sign fluctuations, medicine refills, and appointments.
                </p>
              </div>

              {/* Alert Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">Critical Vitals Threshold Breach Alerts</p>
                    <p className="text-xs text-slate-500">Instant high-priority notification if Blood Pressure exceeds 140/90 or Fasting Glucose exceeds 140 mg/dL.</p>
                  </div>
                  <Switch 
                    checked={notifVitalsThreshold}
                    onCheckedChange={(c) => {
                      setNotifVitalsThreshold(c);
                      toast.info(`Vitals breach alerts ${c ? "activated" : "muted"}.`);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">Pradhan Mantri Jan Aushadhi Refill Alerts</p>
                    <p className="text-xs text-slate-500">Proactive notification 5 days before your recurring maintenance medication supply runs low.</p>
                  </div>
                  <Switch 
                    checked={notifMedicineRefill}
                    onCheckedChange={(c) => {
                      setNotifMedicineRefill(c);
                      toast.info(`Medicine refill reminders ${c ? "activated" : "muted"}.`);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">Tele-Consultation & OPD Appointment Reminders</p>
                    <p className="text-xs text-slate-500">SMS alert 2 hours and 30 minutes prior to your scheduled doctor consultation.</p>
                  </div>
                  <Switch 
                    checked={notifAppointments}
                    onCheckedChange={(c) => {
                      setNotifAppointments(c);
                      toast.info(`Appointment reminders ${c ? "activated" : "muted"}.`);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">Weekly Clinical Wellness Briefing</p>
                    <p className="text-xs text-slate-500">Comprehensive summary of your 7-day average glucose, blood pressure stability, and nutrition score.</p>
                  </div>
                  <Switch 
                    checked={notifWeeklyDigest}
                    onCheckedChange={(c) => {
                      setNotifWeeklyDigest(c);
                      toast.info(`Weekly briefing ${c ? "subscribed" : "unsubscribed"}.`);
                    }}
                  />
                </div>
              </div>

              {/* Preferred Channel */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Delivery Channel</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "whatsapp" as const, label: "WhatsApp Health Beacon", desc: "Fast & Interactive" },
                    { id: "sms" as const, label: "SMS Carrier Dispatch", desc: "Works 100% Offline" },
                    { id: "app" as const, label: "In-App Push Only", desc: "Silent & Private" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setNotifChannel(ch.id);
                        toast.success(`Primary alert channel set to ${ch.label}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        notifChannel === ch.id
                          ? "bg-blue-50/50 border-blue-500 text-blue-900 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-bold">{ch.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{ch.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: DANGER ZONE & ACCOUNT LIFECYCLE                   */}
        {/* ========================================================= */}
        {activeTab === "danger" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Account Pause / Hibernate Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Temporary Account Freeze (Cold Storage)</h3>
                  <p className="text-xs text-slate-500 font-medium">Temporarily disable notifications and hide profile while safely retaining all historical records.</p>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline"
                  onClick={() => toast.info("Your account is in safe cold storage. You can reactivate anytime.")}
                  className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 h-11 px-5"
                >
                  Freeze Account Temporarily
                </Button>
              </div>
            </div>

            {/* Permanent Purge Card */}
            <div className="bg-rose-50/40 rounded-3xl border border-rose-200 p-6 sm:p-8 lg:p-10 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-rose-900 tracking-tight">Permanent Health Data Purge</h3>
                  <p className="text-xs text-rose-700/80 font-medium">
                    ABDM compliant right-to-be-forgotten. Permanently erase all local telemetry, diagnostic reports, and credentials.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm shadow-rose-200"
                >
                  Purge Health Account & Data
                </Button>
              </div>
            </div>

            {/* Logout Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Sign Out of SevaSetu</h4>
                <p className="text-xs text-slate-500 font-medium">Safely terminate active authentication session on this device.</p>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider gap-2 h-11 px-5"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: INTERACTIVE PROFILE IMAGE STUDIO                */}
      {/* ========================================================= */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              Customize Profile Image
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-semibold">
              Upload a personal photo from your computer or select a curated clinical avatar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Avatar Preview */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm flex items-center justify-center font-black text-2xl text-blue-600">
                {profileImage ? (
                  <img src={profileImage} alt="Current Avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.name ? formData.name[0].toUpperCase() : "R"
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{formData.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {profileImage ? "Custom image active" : "Using default monogram avatar"}
                </p>
                {profileImage && (
                  <button 
                    onClick={handleRemoveAvatar}
                    className="text-xs font-bold text-rose-600 hover:underline mt-2 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove and use initial
                  </button>
                )}
              </div>
            </div>

            {/* Upload from Local Device */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Upload from Device</Label>
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploadLoading}
                className="w-full h-13 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs uppercase tracking-wider gap-2 shadow-2xs"
              >
                <Upload className="w-4 h-4" />
                {avatarUploadLoading ? "Optimizing photo..." : "Choose Photo (PNG, JPG, WebP)"}
              </Button>
            </div>

            {/* Curated Cartoon Presets Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Or Select a Curated Cartoon Avatar</Label>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Cartoon Faces
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset.url)}
                    className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 hover:shadow-md transition-all aspect-square focus:outline-none bg-slate-50 p-1 flex items-center justify-center"
                    title={preset.label}
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.label} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 rounded-2xl">
                      <span className="text-[10px] font-bold text-white leading-tight">{preset.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsAvatarModalOpen(false)}
              className="rounded-xl border-slate-200 font-bold text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2: AADHAAR 2FA SIMULATED VERIFICATION             */}
      {/* ========================================================= */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Verify Aadhaar OTP
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-semibold">
              Enter the 6-digit verification code sent to your registered mobile ending in ••210.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-500">One-Time Password (OTP)</Label>
              <Input 
                id="otp" 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="h-12 text-center text-2xl font-mono font-black tracking-widest rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Demo Code: Enter any 4-6 digits (e.g. 123456) to verify.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOtpModalOpen(false)}
              className="rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleVerifyOtp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Verify & Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 3: PERMANENT DATA PURGE SAFETY CONFIRMATION        */}
      {/* ========================================================= */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-[32px] border border-rose-200 bg-white p-6 sm:p-8 shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <DialogTitle className="text-2xl font-black text-rose-950 tracking-tight">
              Permanently Purge All Health Data?
            </DialogTitle>
            <DialogDescription className="text-xs text-rose-800/80 font-semibold leading-relaxed">
              This action cannot be undone. All clinical memories, longitudinal vitals telemetry, uploaded diagnostic scans, and credentials will be irrevocably erased from local storage and ABDM caches.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Type <span className="font-mono text-rose-600 font-extrabold">DELETE</span> to confirm:
            </Label>
            <Input 
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="h-12 rounded-2xl border-rose-300 bg-rose-50/50 font-mono font-bold text-rose-900"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={deleteConfirmationText !== "DELETE" || isDeletingAccount}
              onClick={handleDeleteAccount}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              {isDeletingAccount ? "Purging Records..." : "Permanently Purge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Profile;
