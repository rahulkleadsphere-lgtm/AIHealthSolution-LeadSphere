import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  Heart, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  ChevronLeft
} from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    document.title = "Login | SevaSetu AI Portal";
  }, []);

  React.useEffect(() => {
    document.title = "Login | SevaSetu AI Portal";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (e) {
      // Error handled in login service
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
      // Error handled in login service
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none"></div>

      {/* Hero Side (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 p-16 flex-col justify-between text-white relative">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Sparkles className="w-64 h-64 rotate-12" />
        </div>
        
        <Link to="/" className="flex items-center gap-3 group relative z-10 w-fit">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:rotate-6 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </div>
          <span className="font-black text-sm uppercase tracking-widest">Back to Hub</span>
        </Link>
        
        <div className="relative z-10 space-y-8 animate-in slide-in-from-left-10 duration-1000">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl p-2.5">
            <img src="/app-icon.png" alt="SevaSetu AI" className="w-full h-full object-contain rounded-2xl" />
          </div>
          
          <div className="space-y-4">
             <h1 className="text-6xl font-black leading-tight tracking-tighter uppercase italic">
               Welcome <br/>
               <span className="text-blue-400 underline decoration-white/20 decoration-8 underline-offset-8">Back</span>.
             </h1>
             <p className="max-w-md text-xl text-blue-100/70 font-bold leading-relaxed">
               Access Bharat's most trusted AI health portal. Your personal clinical insights are just a login away.
             </p>
          </div>
          
          <div className="flex -space-x-4 pt-4">
             {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-xl border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl">
                   <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
             ))}
             <div className="w-12 h-12 rounded-xl border-4 border-slate-900 bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                15K+
             </div>
             <div className="ml-8 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Community Choice</p>
                <p className="text-xs font-bold text-white italic">Trusted by villages across India</p>
             </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-blue-400" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50">Verified PHR Compliance System</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-12 animate-in zoom-in-95 duration-700">
           <div className="text-center md:text-left space-y-4">
              <div className="md:hidden flex justify-center mb-2">
                <img src="/app-icon.png" alt="SevaSetu AI" className="w-14 h-14 rounded-2xl object-contain shadow-md" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Member Sign-In</h2>
              <p className="text-slate-400 font-bold">Please provide your credentials below.</p>
           </div>

           {/* Instant Demo Credentials Card */}
           <div className="bg-[#EEF2FF] border-2 border-[#C7D2FE] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm transition-all hover:border-[#818CF8]">
             <div className="flex items-center gap-3.5">
               <div className="w-12 h-12 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shrink-0 shadow-sm">
                 <Sparkles className="w-6 h-6 text-amber-300" />
               </div>
                 <div className="space-y-0.5 text-left">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-900">
                    BITSoM DEMO PERSONA (RAHUL SHARMA)
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    Email: <span className="font-mono text-[#4F46E5] font-bold select-all">rahul@sevasetu.in</span>
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    Access Key: <span className="font-mono text-[#4F46E5] font-bold select-all">Rahul@123</span> • Mumbai, O+
                  </p>
                </div>
             </div>

             <button
               type="button"
               onClick={handleOneClickLogin}
               disabled={isLoading}
               className="bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "1–Click Login"}
             </button>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                  <Mail className="w-3.5 h-3.5" /> Identity Email
                </label>
                <div className="relative group">
                   <input 
                      className="w-full h-16 bg-white border-2 border-slate-100 rounded-[24px] px-8 font-bold text-slate-700 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white transition-all shadow-xl shadow-slate-200/40 outline-none" 
                      placeholder="e.g. yourname@gmail.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                   />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Access Key
                  </label>
                  <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">Forgot Key?</button>
                </div>
                <div className="relative group">
                   <input 
                      className="w-full h-16 bg-white border-2 border-slate-100 rounded-[24px] px-8 font-bold text-slate-700 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white transition-all shadow-xl shadow-slate-200/40 outline-none" 
                      type="password"
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                   />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-18 bg-slate-900 text-white rounded-[28px] py-6 font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-slate-300 active:scale-95 transition-all hover:bg-black group flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                ) : (
                  <>
                    Grant Access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
           </form>

           <div className="pt-8 text-center md:text-left space-y-4">
              <p className="text-slate-500 font-bold text-sm">New to Seva Hub? <Link to="/signup" className="text-blue-600 hover:underline">Register your family</Link></p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
                 <div className="h-px bg-slate-100 flex-1"></div>
                 Or continue with
                 <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <div className="flex gap-4">
                 <button className="flex-1 h-16 bg-white border-2 border-slate-100 rounded-[20px] flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0" alt="Google" />
                 </button>
                 <button className="flex-1 h-16 bg-white border-2 border-slate-100 rounded-[20px] flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

const Smartphone = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
);
