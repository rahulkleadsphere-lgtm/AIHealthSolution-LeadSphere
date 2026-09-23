import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  Heart, 
  Mail, 
  Lock, 
  User,
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  ChevronLeft,
  Smartphone
} from "lucide-react";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    document.title = "Register Your Family | SevaSetu AI Portal";
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (e) {
      // Error handled in auth service
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
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
            <Heart className="w-12 h-12 fill-white/20" strokeWidth={2.5} />
          </div>
          
          <div className="space-y-4">
             <h1 className="text-6xl font-black leading-tight tracking-tighter uppercase italic text-white/90">
               Join <br/>
               <span className="text-blue-400 underline decoration-white/20 decoration-8 underline-offset-8">Seva Setu</span>.
             </h1>
             <p className="max-w-md text-xl text-blue-100/70 font-bold leading-relaxed">
               Create your digital health identity today. Secure, private and accessible health insights for everyone in Bharat.
             </p>
          </div>
          
          <div className="flex flex-col gap-6 relative z-10 pt-4">
             <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 py-4 px-6 rounded-[24px] border border-transparent hover:border-white/10 transition-all">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600 transition-colors">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-black tracking-tight leading-none italic uppercase">Privacy First</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mt-1">Encrypted Patient Data</p>
                </div>
             </div>
             <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 py-4 px-6 rounded-[24px] border border-transparent hover:border-white/10 transition-all">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-emerald-600 transition-colors">
                   <Smartphone className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-black tracking-tight leading-none italic uppercase">Multi-Device</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mt-1">Access anywhere on phone/desktop</p>
                </div>
             </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-blue-400" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50">Verified PHR Compliance System</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto w-full">
        <div className="w-full max-w-md space-y-12 animate-in zoom-in-95 duration-700 py-12">
           <div className="text-center md:text-left space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Digital Setup</h2>
              <p className="text-slate-400 font-bold">Register your personal profile to start.</p>
           </div>
           
           <form onSubmit={handleSignup} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <div className="relative group">
                   <input 
                      className="w-full h-16 bg-white border-2 border-slate-100 rounded-[24px] px-8 font-bold text-slate-700 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white transition-all shadow-xl shadow-slate-200/40 outline-none" 
                      placeholder="e.g. Rahul Sharma" 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                   />
                </div>
              </div>

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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                  <Lock className="w-3.5 h-3.5" /> Create Access Key
                </label>
                <div className="relative group">
                   <input 
                      className="w-full h-16 bg-white border-2 border-slate-100 rounded-[24px] px-8 font-bold text-slate-700 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white transition-all shadow-xl shadow-slate-200/40 outline-none" 
                      type="password"
                      placeholder="Min. 8 characters" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
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
                    Confirm Registration
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
           </form>

           <div className="pt-8 text-center md:text-left space-y-4">
              <p className="text-slate-500 font-bold text-sm">Already a member? <Link to="/login" className="text-blue-600 hover:underline">Log into your ward</Link></p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300 pt-4">
                 <div className="h-px bg-slate-100 flex-1"></div>
                 Or continue with
                 <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <div className="flex gap-4">
                 <button className="flex-1 h-16 bg-white border-2 border-slate-100 rounded-[20px] flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0" alt="Google" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
