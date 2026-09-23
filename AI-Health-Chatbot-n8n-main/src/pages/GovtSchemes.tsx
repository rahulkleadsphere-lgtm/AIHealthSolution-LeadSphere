import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Plus, 
  Filter,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertTriangle,
  History,
  ExternalLink,
  MessageSquareText
} from "lucide-react";
import { PaginationControl } from "@/components/ui/PaginationControl";
import { schemesService, alertsService } from "../services/api";
import { toast } from "sonner";
import { SchemeWizard } from "../components/SchemeWizard";

interface Scheme {
  title: string;
  description: string;
  benefits: string[];
  eligibility: string;
  apply_url: string;
  state?: string;
  category?: string;
  coverage_amount?: string;
  helpline?: string;
}

const GovtSchemes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedState, selectedCategory, searchQuery]);

  const fetchSchemesData = async (query: string = "", stateFilter: string = "All") => {
    setIsLoading(true);
    try {
      const data = await schemesService.getSchemes(query, stateFilter);
      setSchemes(data.schemes || []);
    } catch (err) {
      toast.error("Error loading schemes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Government Health Schemes | SevaSetu";
    const initialFetch = async () => {
      await fetchSchemesData("", selectedState);
      try {
        const alertData = await alertsService.getAlerts("Maharashtra");
        setAlerts(alertData.alerts || []);
      } catch (e) {
        console.error("Alerts error", e);
      }
    };
    initialFetch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await fetchSchemesData(searchQuery, selectedState);
  };

  const handleStateFilter = async (stateName: string) => {
    setSelectedState(stateName);
    await fetchSchemesData(searchQuery, stateName);
  };

  const filteredSchemes = schemes.filter((s) => {
    if (selectedCategory === "All") return true;
    const catLower = (s.category || "").toLowerCase();
    const titleLower = s.title.toLowerCase();
    const descLower = s.description.toLowerCase();
    if (selectedCategory === "Hospitalization") {
      return catLower.includes("hospitalization") || catLower.includes("assurance") || titleLower.includes("ayushman") || titleLower.includes("kalyan") || titleLower.includes("arogya");
    }
    if (selectedCategory === "Maternity & Child") {
      return catLower.includes("maternity") || catLower.includes("infant") || titleLower.includes("janani") || titleLower.includes("surakshit") || descLower.includes("mother");
    }
    if (selectedCategory === "Chronic & Dialysis") {
      return catLower.includes("chronic") || catLower.includes("dialysis") || catLower.includes("tb") || catLower.includes("cancer") || titleLower.includes("dialysis") || titleLower.includes("tb") || titleLower.includes("kosh");
    }
    if (selectedCategory === "Senior Citizens") {
      return titleLower.includes("vay vandana") || titleLower.includes("senior") || descLower.includes("70");
    }
    return true;
  });

  const totalSchemes = filteredSchemes.length;
  const paginatedSchemes = filteredSchemes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const el = document.getElementById("schemes-catalog-top");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-10 pb-28 md:pb-12">
      {/* Search Hero */}
      <section className="relative space-y-6 animate-in slide-in-from-top-4 duration-500">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Social Security Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-800">
            Government Health <span className="text-blue-600 underline decoration-blue-200 decoration-4 underline-offset-4">Assurance Hub</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl font-semibold leading-relaxed">
            Instant access to 500+ Central and State health schemes, cashless hospital coverage, and eligibility rules for Bharat.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-3xl group">
           <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-blue-600 group-focus-within:scale-110 transition-transform" />
           </div>
           <input 
              type="text"
              placeholder="Search diseases, scheme names, or keywords (e.g., Ayushman, Cancer, Dialysis)..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-32 text-sm font-semibold placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
           <button 
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
           >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Search"}
           </button>
        </form>
      </section>

      {/* Standout Feature: Smart Scheme Eligibility Wizard */}
      <section>
        <SchemeWizard />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Schemes List */}
        <div id="schemes-catalog-top" className="lg:col-span-8 space-y-6">
           <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                 <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                   <Plus className="w-5 h-5 text-blue-600" />
                   Available Schemes ({filteredSchemes.length})
                 </h2>
                 <span className="text-xs font-semibold text-slate-500">
                   Central & State Empanelled Catalog
                 </span>
              </div>

              {/* State Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> State:
                </span>
                {["All", "Maharashtra", "Odisha", "Tamil Nadu", "Rajasthan", "Karnataka", "West Bengal", "Uttar Pradesh", "Gujarat", "Andhra Pradesh"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStateFilter(st === "All" ? "All-India" : st)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 text-xs ${
                      (selectedState === st || (st === "All" && (selectedState === "All" || selectedState === "All-India")))
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Focus:
                </span>
                {["All", "Hospitalization", "Senior Citizens", "Maternity & Child", "Chronic & Dialysis"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 text-xs ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-4">
               {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100">
                   <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-xs font-semibold text-slate-400">Syncing central & state welfare databases...</p>
                </div>
              ) : filteredSchemes.length > 0 ? (
                paginatedSchemes.map((scheme, i) => (
                  <Card key={i} className="group border border-slate-200/80 bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all p-5 md:p-7 space-y-4">
                    <CardContent className="p-0 space-y-4">
                      {/* Top Header with Icon, Badges & Title */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                           <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                              {scheme.state || "National"}
                            </span>
                            {scheme.coverage_amount && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {scheme.coverage_amount}
                              </span>
                            )}
                            {scheme.helpline && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                Helpline: {scheme.helpline}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                            {scheme.title}
                          </h3>
                          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                            {scheme.description}
                          </p>
                        </div>
                      </div>

                      {/* Eligibility Box */}
                      {scheme.eligibility && (
                        <div className="p-3.5 bg-slate-50 border border-slate-100/90 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eligibility Criteria</span>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                            {scheme.eligibility}
                          </p>
                        </div>
                      )}

                      {/* Benefits Tags */}
                      {scheme.benefits && scheme.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {scheme.benefits.slice(0, 4).map((benefit, j) => (
                            <Badge key={j} variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200/60 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                        <Link 
                          to={`/scheme/${encodeURIComponent(scheme.title)}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>

                        <div className="flex items-center gap-2">
                          <Link
                            to="/chat"
                            state={{ prefill: `Can you explain the benefits, eligibility rules, and cashless hospital coverage under ${scheme.title}?` }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
                            Ask AI
                          </Link>

                          {scheme.apply_url && (
                            <a
                              href={scheme.apply_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="bg-white p-12 md:p-16 rounded-3xl text-center space-y-4 border border-slate-200/80">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                      <Search className="w-6 h-6" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">No Matching Schemes Found</h3>
                   <p className="text-xs md:text-sm text-slate-500 font-medium max-w-sm mx-auto">Try searching for broader medical terms like "Blood", "Surgery", or "Maternity".</p>
                </div>
              )}

              {/* Scheme Catalog Pagination */}
              <PaginationControl
                currentPage={currentPage}
                totalItems={totalSchemes}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                itemLabel="schemes"
              />
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
           {/* Alerts Panel */}
           <section className="bg-rose-50/70 rounded-2xl md:rounded-3xl p-6 border border-rose-100 space-y-5 relative overflow-hidden">
              <div className="flex items-center gap-2.5 text-rose-700">
                 <AlertTriangle className="w-5 h-5 animate-pulse text-rose-600" />
                 <h3 className="text-base font-bold tracking-tight">Active Regional Alerts</h3>
              </div>
              
              <div className="space-y-4">
                 {alerts.length > 0 ? alerts.map((alert, i) => (
                   <div key={i} className="space-y-1 pb-3 border-b border-rose-200/60 last:border-0 last:pb-0">
                      <p className="font-bold text-rose-900 text-sm">{alert.title}</p>
                      <p className="text-xs text-rose-700 leading-relaxed">{alert.description}</p>
                      <p className="text-[10px] font-semibold text-rose-500 pt-1">{alert.time}</p>
                   </div>
                 )) : (
                   <p className="text-xs text-rose-800 font-medium">No critical health alerts for your district today. All primary facilities open.</p>
                 )}
              </div>
              
              <button className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-rose-700 transition-all active:scale-95">
                Update District Block
              </button>
           </section>

           {/* Quick Status Check */}
           <section className="bg-slate-900 text-white rounded-2xl md:rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                 <History className="w-5 h-5 text-blue-400" />
                 <h3 className="text-base font-bold tracking-tight">Ayushman (PM-JAY) Check</h3>
              </div>
              <p className="text-slate-300 font-normal text-xs leading-relaxed">Verify if your family has active PM-JAY ₹5 Lakh annual hospital cover using your Aadhaar or Ration Card number.</p>
              <div className="space-y-3 pt-1">
                 <input className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-xs font-medium placeholder:text-slate-400 outline-none focus:border-blue-400 text-white" placeholder="Enter Aadhaar or Ration No." />
                 <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700">Check Status</button>
              </div>
           </section>

           {/* Assistance Card */}
           <div className="bg-blue-50/70 p-6 rounded-2xl md:rounded-3xl border border-blue-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Need Help Choosing?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Our AI assistant can explain eligibility criteria and required documents in English, Hindi, Telugu, or Odia.</p>
              <Link to="/chat" className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs hover:underline pt-1">
                 Ask Seva Assistant <ChevronRight className="w-3.5 h-3.5" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GovtSchemes;
