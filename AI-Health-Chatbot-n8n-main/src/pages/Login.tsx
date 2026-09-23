import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  ChevronLeft,
  Eye,
  EyeOff,
  Activity,
  HeartPulse,
  FileCheck2,
  AlertCircle
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

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Patient & Clinician Login | SevaSetu AI";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (e) {
      // Error toasted in auth service
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Browser will redirect to Google Sign-In
    } catch (err: any) {
      setIsGoogleLoading(false);
      // Helpful fallback message if Google credentials need Supabase dashboard activation
      if (err.message?.includes("provider is not enabled")) {
        toast.error("Google Auth is pending configuration in your Supabase dashboard.", {
          description: "Enable Google provider under Authentication -> Providers in Supabase.",
          duration: 6000,
        });
      }
    }
  };

  const handleOneClickLogin = async () => {
    const demoEmail = "rahul@sevasetu.in";
    const demoPassword = "Rahul@123";
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      await login(demoEmail, demoPassword);
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (e) {
      // Handled in login service
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative overflow-hidden text-slate-800">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Left Clinical Showcase Column (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-white border-r border-slate-200/80 p-12 flex-col justify-between relative shadow-sm">
        <div>
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all mb-10"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Public Portal
          </Link>

          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">SevaSetu</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ABDM Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">National Health Access Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3 mb-10">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-snug">
              Unified Clinical <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Command & Telemetry
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Securely access your longitudinal biomarkers, Ayushman Bharat health records, and multilingual AI clinical triage.
            </p>
          </div>

          {/* Clinical Pillars */}
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Continuous Vital Telemetry</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Automated tracking for BP, Fasting Sugar, SpO2, and resting sinus heart rate.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Zero-Loss Health Vault</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Encrypted storage for lab reports, radiology scans, and verified prescriptions.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Ayushman ABHA Sovereign Pass</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">14-digit national health identity with granular patient consent controls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Community Cartoon Avatars Stack (Strictly Zero Human Faces) */}
        <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[
                "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav&backgroundColor=b6e3f4",
                "https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya&backgroundColor=ffd5dc",
                "https://api.dicebear.com/7.x/bottts/svg?seed=SevaCareBot&backgroundColor=d1d4f9",
                "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya&backgroundColor=c0aede",
              ].map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar}
                  alt="Verified Member"
                  className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 shadow-sm"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-slate-800">40,000+ Citizens</p>
              <p className="text-[10px] text-slate-400 font-semibold">Trained on verified clinical guidelines</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Portal
          </div>
        </div>
      </div>

      {/* Right Sign-In Form Column */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Back & Brand */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
              <ChevronLeft className="w-4 h-4" /> Home
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-900 text-sm">SevaSetu</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Patient Sign-In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Enter your credentials to access your longitudinal health record.
            </p>
          </div>

          {/* 1-Click Evaluation Persona (Rahul Sharma) */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/40 border border-blue-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-blue-600" /> BITSoM Demo Persona
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Rahul Sharma (21, O+)</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Instant evaluation with pre-populated telemetry, vitals, and ABHA pass.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOneClickLogin}
                disabled={isLoading}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-blue-500/30 transition-all flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "1-Click Sign In"}
              </button>
            </div>
          </div>

          {/* Google Authentication Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-12 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200/90 shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-[#F8FAFC] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              or sign in with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@sevasetu.in"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Password Reset", {
                      description: "For demo accounts, use Rahul@123 or reset via Supabase console.",
                    });
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-2xl font-bold text-sm shadow-md shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              ) : (
                <>
                  <span>Sign In to Health Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="pt-3 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Don't have a registered clinical profile?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          {/* Compliance & Security Strip */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-bit AES Encryption • ABDM M1/M2/M3 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
