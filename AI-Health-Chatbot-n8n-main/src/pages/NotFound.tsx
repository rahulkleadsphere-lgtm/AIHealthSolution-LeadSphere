import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-6">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="text-center max-w-xl mx-auto space-y-10 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-black leading-none text-blue-600/10 tracking-tighter mix-blend-multiply italic">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <AlertTriangle className="w-24 h-24 text-blue-600 animate-bounce" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-800">Oops! You've lost your way.</h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
            The medical record or page you're looking for doesn't exist or has been relocated to a different ward.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl shadow-blue-200 hover:opacity-95 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            Return to Seva Home
          </Link>
          <Link 
            to="/chat" 
            className="inline-flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-10 py-5 rounded-3xl font-black shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Ask Seva Assistant
          </Link>
        </div>

        <div className="pt-12 opacity-40">
           <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="text-blue-600 w-6 h-6" />
              <span className="text-xl font-bold tracking-tight text-blue-700 italic">SevaSetu AI</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
