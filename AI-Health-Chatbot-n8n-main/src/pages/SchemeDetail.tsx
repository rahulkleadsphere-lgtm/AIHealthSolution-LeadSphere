import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { schemesService } from "../services/api";
import { 
  ChevronLeft, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  HelpingHand, 
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const SchemeDetail: React.FC = () => {
  const { schemeName } = useParams<{ schemeName: string }>();
  const [scheme, setScheme] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      if (!schemeName) return;
      setIsLoading(true);
      try {
        const decoded = decodeURIComponent(schemeName).trim();
        const data = await schemesService.getSchemes(decoded);
        const schemes = data.schemes || [];
        
        // 1. Exact match
        const lowerDecoded = decoded.toLowerCase();
        let detail = schemes.find((s: any) => s.title.toLowerCase() === lowerDecoded);
        
        // 2. Substring match
        if (!detail) {
          detail = schemes.find((s: any) => 
            s.title.toLowerCase().includes(lowerDecoded) || 
            lowerDecoded.includes(s.title.toLowerCase())
          );
        }

        // 3. Keyword token match (e.g. MJPJAY, PM-JAY, Jyotirao)
        if (!detail) {
          const tokens = lowerDecoded.replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(w => w.length > 2);
          for (const token of tokens) {
            const found = schemes.find((s: any) => s.title.toLowerCase().includes(token));
            if (found) {
              detail = found;
              break;
            }
          }
        }

        // 4. Default to top scheme if present
        if (!detail && schemes.length > 0) {
          detail = schemes[0];
        }

        // 5. Global catalog fallback if initial query returned empty
        if (!detail) {
          const allData = await schemesService.getSchemes();
          const allSchemes = allData.schemes || [];
          detail = allSchemes.find((s: any) => 
            s.title.toLowerCase().includes("ayushman") || 
            s.title.toLowerCase().includes("mjpjay")
          ) || allSchemes[0];
        }

        setScheme(detail);
        if (detail) {
          document.title = `${detail.title} | SevaSetu Scheme Details`;
        }
      } catch (err) {
        console.error("Fetch scheme detail err", err);
        toast.error("Could not load scheme details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [schemeName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Accessing Government Database...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="p-10 text-center max-w-lg mx-auto space-y-10 py-32 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl font-black font-headline tracking-tighter uppercase italic text-slate-800">Scheme Not Found</h2>
           <p className="text-slate-500 font-bold leading-relaxed">The scheme you are looking for might have been updated or moved to a different category.</p>
        </div>
        <Link to="/schemes" className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          <ChevronLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-14 max-w-7xl mx-auto w-full space-y-20 pb-40 animate-in slide-in-from-bottom-5 duration-1000">
      {/* Detail Hero */}
      <section className="space-y-12">
        <Link to="/schemes" className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Schemes
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           <div className="lg:col-span-8 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 shadow-sm shadow-emerald-900/5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Protection API</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[0.9] text-slate-800 uppercase italic">
                  {scheme.title}
                </h1>
                <p className="text-2xl text-slate-500 font-bold leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-50 border-none rounded-[48px] p-10 space-y-6 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                      <HelpingHand className="w-8 h-8 text-blue-600" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black font-headline tracking-tight text-slate-800 uppercase italic">Benefits</h3>
                      <ul className="space-y-4 text-slate-500 font-bold text-sm">
                        {(Array.isArray(scheme.benefits) 
                          ? scheme.benefits 
                          : typeof scheme.benefits === "string" 
                            ? scheme.benefits.split(",").map((s: string) => s.trim()).filter(Boolean)
                            : ["Comprehensive Cashless Hospitalization Coverage"]
                        ).map((benefit: string, i: number) => (
                          <li key={i} className="flex gap-3">
                             <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                             {benefit}
                          </li>
                        ))}
                      </ul>
                   </div>
                </Card>

                <Card className="bg-slate-900 text-white border-none rounded-[48px] p-10 space-y-6 group hover:-translate-y-2 transition-all duration-500">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-blue-600 transition-colors">
                      <Plus className="w-8 h-8 text-blue-400 group-hover:text-white" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black font-headline tracking-tight text-white uppercase italic">Eligibility</h3>
                      <p className="text-blue-100/60 font-medium leading-relaxed italic">{scheme.eligibility}</p>
                      <div className="pt-4">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-white/40">State Coverage</span>
                         </div>
                         <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mt-2">Drawn from Central Health OS</p>
                      </div>
                   </div>
                </Card>
              </div>

              {/* Documentation Section */}
              <section className="bg-white rounded-[56px] border-4 border-slate-50 p-12 md:p-16 space-y-12 shadow-sm">
                 <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h3 className="text-3xl font-black font-headline tracking-tight text-slate-800 uppercase italic">Documentation Pack</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Array.isArray(scheme.documents)
                      ? scheme.documents
                      : typeof scheme.documents === "string"
                        ? scheme.documents.split(",").map((d: string) => d.trim()).filter(Boolean)
                        : ["Aadhaar Card", "Ration Card", "Identity Proof"]
                    ).map((doc: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] group hover:bg-slate-100 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                               <FileText className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                            </div>
                            <span className="font-bold text-slate-700 uppercase tracking-tight text-xs">{doc}</span>
                         </div>
                         <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-slate-400" />
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Sidebar Actions */}
           <div className="lg:col-span-4 space-y-10 sticky top-14">
              <section className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[48px] p-12 text-white space-y-10 shadow-2xl overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-120 transition-transform">
                    <ExternalLink className="w-32 h-32 text-white" />
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <h3 className="text-2xl font-black font-headline tracking-tight uppercase italic leading-none">Apply for <br/>Coverage</h3>
                    <p className="text-blue-100/60 font-medium text-sm leading-relaxed">You will be redirected to the official Government of India portal for this scheme.</p>
                 </div>
                 
                 <a 
                    href={scheme.apply_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-6 bg-white text-blue-700 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-blue-50 relative z-10"
                 >
                    Official Application Portal <ExternalLink className="w-4 h-4" />
                 </a>
              </section>

              <section className="bg-slate-50 border border-slate-100 rounded-[48px] p-12 space-y-10 group">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                       <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-black uppercase tracking-tight text-slate-800 italic">Policy Details</h4>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-slate-200/50">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                       <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 font-bold text-[9px] uppercase">Central Sector</Badge>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-slate-200/50">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Age Group</span>
                       <span className="text-[10px] font-black text-slate-700 uppercase">All Ages</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ID Required</span>
                       <span className="text-[10px] font-black text-slate-700 uppercase">Aadhaar Card</span>
                    </div>
                 </div>
              </section>

              <div className="p-10 bg-blue-50/50 rounded-[48px] border border-blue-100 space-y-6">
                 <h4 className="font-black text-slate-800 uppercase tracking-tight">Need a Guide?</h4>
                 <p className="text-xs text-slate-500 font-bold leading-relaxed italic opacity-80">Not sure if you are eligible? Ask our AI assistant about your specific case.</p>
                 <Link to="/chat" className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] hover:underline">
                    Ask Seva Assistant <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default SchemeDetail;
