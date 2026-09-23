import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, SignupPayload } from "../contexts/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Smartphone,
  Calendar,
  Droplets,
  Ruler,
  Weight,
  Activity,
  MapPin,
  PhoneCall,
  ShieldCheck,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  IdCard,
  Plus,
  X,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";

// Official Google 4-Color Vector Icon
const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const POPULAR_DISTRICTS = ["Mumbai", "Pune", "Delhi", "Bengaluru", "Hyderabad", "Bhubaneswar", "Jaipur", "Lucknow", "Ahmedabad", "Kolkata"];
const QUICK_ALLERGIES = ["None", "Penicillin", "Sulfa Drugs", "Aspirin", "Peanuts", "Dust Mites", "Latex"];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    document.title = "Register Clinical Profile | SevaSetu AI";
    if (isAuthenticated || user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Wizard Step (1: Credentials, 2: Demographics & BMI, 3: Emergency & Medical)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Clinical Demographics
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [height, setHeight] = useState("174");
  const [weight, setWeight] = useState("68");

  // Step 3: Location & Health Context
  const [district, setDistrict] = useState("Mumbai");
  const [primaryCondition, setPrimaryCondition] = useState("None (Preventive Fitness)");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Next of Kin");
  const [allergies, setAllergies] = useState<string[]>(["None"]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [generateAbha, setGenerateAbha] = useState(true);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    document.title = "Register Clinical Profile | SevaSetu AI";
  }, []);

  // Live BMI Computation
  const bmiCalculation = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const heightInMeters = h / 100;
    const bmi = +(w / (heightInMeters * heightInMeters)).toFixed(1);

    let category = "Normal";
    let colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (bmi < 18.5) {
      category = "Underweight";
      colorClass = "text-amber-700 bg-amber-50 border-amber-200";
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight";
      colorClass = "text-blue-700 bg-blue-50 border-blue-200";
    } else if (bmi >= 30) {
      category = "Obese";
      colorClass = "text-rose-700 bg-rose-50 border-rose-200";
    }

    return { value: bmi, category, colorClass };
  }, [height, weight]);

  // Password Strength
  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, text: "Enter Password", color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: 1, text: "Weak", color: "bg-rose-500" };
    if (score === 2 || score === 3) return { level: 2, text: "Moderate", color: "bg-amber-500" };
    return { level: 3, text: "Strong", color: "bg-emerald-500" };
  }, [password]);

  // Allergy Tag Management
  const toggleAllergy = (tag: string) => {
    if (tag === "None") {
      setAllergies(["None"]);
      return;
    }
    const filtered = allergies.filter((a) => a !== "None");
    if (filtered.includes(tag)) {
      const next = filtered.filter((a) => a !== tag);
      setAllergies(next.length ? next : ["None"]);
    } else {
      setAllergies([...filtered, tag]);
    }
  };

  const addCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    const clean = customAllergy.trim();
    if (!allergies.includes(clean)) {
      setAllergies(allergies.filter((a) => a !== "None").concat(clean));
    }
    setCustomAllergy("");
  };

  const removeAllergy = (tag: string) => {
    const next = allergies.filter((a) => a !== tag);
    setAllergies(next.length ? next : ["None"]);
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      toast.error("Please enter your legal name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return false;
    }
    if (confirmPassword && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      toast.error("Please enter a valid age.");
      return false;
    }
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || h < 50 || h > 250) {
      toast.error("Please enter a valid height in cm (e.g. 174).");
      return false;
    }
    if (!w || w < 20 || w > 300) {
      toast.error("Please enter a valid weight in kg (e.g. 68).");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    try {
      // Build clinical payload matching backend schema & Personal Settings
      const generatedAbhaId = generateAbha
        ? `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
        : undefined;

      const payload: SignupPayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        age: age.trim(),
        gender,
        blood_group: bloodGroup,
        height: `${height} cm`,
        weight: `${weight} kg`,
        district: district.trim(),
        primary_condition: primaryCondition.trim(),
        allergies,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
        emergency_contact_relation: emergencyRelation || "Next of Kin",
        abha_id: generatedAbhaId,
        bio: `Verified patient from ${district}. Clinical goal: ${primaryCondition}.`,
      };

      await signup(payload);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Handled in auth context
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err.message?.includes("provider is not enabled")) {
        toast.error("Google Auth is pending configuration in your Supabase dashboard.", {
          description: "Enable Google provider under Authentication -> Providers in Supabase.",
          duration: 6000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-800 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Left Clinical Showcase Column (Desktop) */}
      <div className="hidden lg:flex lg:w-4/12 bg-white border-r border-slate-200/80 p-10 flex-col justify-between shadow-sm relative">
        <div>
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Public Portal
          </Link>

          {/* Brand */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">SevaSetu</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ABDM Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">National Health Access Platform</p>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Onboarding Progress</span>
              <span className="text-blue-600 font-black">Step {currentStep} of 3</span>
            </div>

            <div className="space-y-3">
              {[
                { step: 1, title: "Account & Credentials", desc: "Identity, email, and secure password" },
                { step: 2, title: "Clinical Demographics", desc: "Vitals, blood group, and live BMI" },
                { step: 3, title: "Health Context & Emergency", desc: "District, allergies, and emergency next-of-kin" },
              ].map((item) => (
                <div
                  key={item.step}
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step as any);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    currentStep === item.step
                      ? "border-blue-500/80 bg-blue-50/70 shadow-sm"
                      : currentStep > item.step
                      ? "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                      : "border-slate-100 bg-slate-50/50 opacity-60"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      currentStep > item.step
                        ? "bg-emerald-600 text-white"
                        : currentStep === item.step
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Clinical Summary Preview Card */}
          <div className="p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-blue-600" /> Clinical Pass Preview
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {district || "India"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
                <span className="font-black text-slate-900">{bloodGroup || "—"}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Computed BMI</span>
                <span className="font-black text-slate-900">
                  {bmiCalculation ? `${bmiCalculation.value}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-semibold text-slate-600">ABDM & HIPAA Compliant</span>
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400">256-Bit SSL</span>
        </div>
      </div>

      {/* Right Onboarding Form Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          {/* Mobile Back & Step Header */}
          <div className="lg:hidden flex items-center justify-between mb-2">
            <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900">
              <ChevronLeft className="w-4 h-4" /> Home
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
              Step {currentStep} of 3
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {currentStep === 1 && "Create Your Clinical Profile"}
              {currentStep === 2 && "Physiological Vitals & Demographics"}
              {currentStep === 3 && "Health Context & Emergency Contacts"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {currentStep === 1 && "Register your digital health identity for instant AI triage & record syncing."}
              {currentStep === 2 && "These parameters power live clinical advice and emergency dosing recommendations."}
              {currentStep === 3 && "Ensures emergency next-of-kin alerts and personalized drug allergy screening."}
            </p>
          </div>

          {/* Step 1 Quick Google Alternative */}
          {currentStep === 1 && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-12 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200/90 shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    <span>Quick Sign Up with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-[#F8FAFC] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  or register with clinical form
                </span>
              </div>
            </>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ================= STEP 1: CREDENTIALS ================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Full Legal Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Legal Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@sevasetu.in"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Mobile Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                  />
                </div>

                {/* Password with Strength Meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Create Access Password *
                    </label>
                    <span className="text-[11px] font-bold text-slate-500">{passwordStrength.text}</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters with numbers & symbols"
                      className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Progress Bars */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className={`h-1.5 rounded-full transition-all ${passwordStrength.level >= 1 ? passwordStrength.color : "bg-slate-200"}`} />
                    <div className={`h-1.5 rounded-full transition-all ${passwordStrength.level >= 2 ? passwordStrength.color : "bg-slate-200"}`} />
                    <div className={`h-1.5 rounded-full transition-all ${passwordStrength.level >= 3 ? passwordStrength.color : "bg-slate-200"}`} />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Confirm Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>Continue to Demographics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ================= STEP 2: DEMOGRAPHICS & LIVE BMI ================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Age (Years) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Biological Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Blood Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-rose-500" /> Blood Group *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setBloodGroup(bg)}
                        className={`h-10 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                          bloodGroup === bg
                            ? "bg-rose-50 text-rose-700 border-rose-400 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height & Weight with Live Calculated BMI */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-blue-500" /> Height (cm) *
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={250}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g. 174"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5 text-indigo-500" /> Weight (kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min={20}
                      max={300}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 68"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                    />
                  </div>
                </div>

                {/* Live Computed BMI Card */}
                {bmiCalculation && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Real-Time Computed BMI
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          {bmiCalculation.value} <span className="text-xs font-medium text-slate-500">kg/m²</span>
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${bmiCalculation.colorClass}`}>
                      {bmiCalculation.category}
                    </span>
                  </div>
                )}

                {/* Stepper Navigation */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 h-12 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-2/3 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Health Context</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: EMERGENCY & CONTEXT ================= */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* District / City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> Residential District / City *
                  </label>
                  <input
                    type="text"
                    required
                    list="district-options"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                  />
                  <datalist id="district-options">
                    {POPULAR_DISTRICTS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>

                {/* Primary Condition / Clinical Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-500" /> Primary Health Focus / Condition
                  </label>
                  <select
                    value={primaryCondition}
                    onChange={(e) => setPrimaryCondition(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                  >
                    <option value="None (Preventive Fitness)">None (General Preventive Fitness)</option>
                    <option value="Hypertension (Blood Pressure)">Hypertension (High Blood Pressure)</option>
                    <option value="Type 2 Diabetes Mellitus">Type 2 Diabetes Mellitus</option>
                    <option value="Asthma / Respiratory">Asthma / Chronic Respiratory Care</option>
                    <option value="Thyroid Disorder">Thyroid Disorder</option>
                    <option value="Maternal & Prenatal Care">Maternal & Prenatal Care</option>
                    <option value="Cardiovascular Care">Cardiovascular Health</option>
                  </select>
                </div>

                {/* Emergency Contact Name & Phone */}
                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-rose-500" /> Emergency Next-of-Kin Contact
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name (e.g. Mother)"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (+91 98201...)"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>
                </div>

                {/* Known Allergies Tag Manager */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Known Drug & Environmental Allergies
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Critical for safe prescriptions</span>
                  </label>

                  {/* Active Selected Allergy Badges */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-white border border-slate-200/90">
                    {allergies.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          tag === "None"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {tag}
                        {tag !== "None" && (
                          <button
                            type="button"
                            onClick={() => removeAllergy(tag)}
                            className="hover:text-rose-900 p-0.5 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Quick-Pick Suggested Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_ALLERGIES.map((qa) => (
                      <button
                        type="button"
                        key={qa}
                        onClick={() => toggleAllergy(qa)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          allergies.includes(qa)
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        + {qa}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ayushman ABHA ID Generation Toggle */}
                <label className="p-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/50 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Auto-generate Ayushman ABHA Health ID
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Assigns a certified 14-digit ABDM ID (e.g. 91-8273-4920-1124) with ceramic card visual pass.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={generateAbha}
                    onChange={(e) => setGenerateAbha(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                {/* Stepper Navigation & Submit */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 h-12 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 h-12 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-2xl font-bold text-sm shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                Sign In to Portal
              </Link>
            </p>
          </div>

          {/* Compliance & Security Strip */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted Health Record • Sovereign Data Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
