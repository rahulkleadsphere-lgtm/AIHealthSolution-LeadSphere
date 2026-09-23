import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Map, 
  MapPin, 
  Search, 
  Phone, 
  ArrowLeft, 
  Hospital, 
  Pill, 
  Building2, 
  ShieldCheck, 
  Loader2, 
  ChevronRight, 
  ExternalLink,
  MessageSquareText,
  Filter,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "../services/api";
import { PaginationControl } from "@/components/ui/PaginationControl";

const POPULAR_CITIES = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Thane", state: "Maharashtra" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Ahmedabad", state: "Gujarat" }
];

export const HealthDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [district, setDistrict] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [filterType, setFilterType] = useState("all");
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchFacilities = async (dist = district, st = stateName) => {
    if (!dist) return;
    setLoading(true);
    setCurrentPage(1);
    try {
      const response = await fetch(`${API_BASE_URL}/directory?district=${encodeURIComponent(dist)}&state=${encodeURIComponent(st)}`);
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
        if (data.length === 0) {
          toast.info(`No facilities listed for ${dist}, ${st}. Try searching another district.`);
        } else {
          toast.success(`Loaded ${data.length} verified facilities in ${dist}.`);
        }
      } else {
        toast.error("Failed to load facilities directory.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Connection error to health directory service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities("Mumbai", "Maharashtra");
  }, []);

  const handleCityChipClick = (c: { city: string; state: string }) => {
    setDistrict(c.city);
    setStateName(c.state);
    fetchFacilities(c.city, c.state);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities(district, stateName);
  };

  const filteredFacilities = facilities.filter(f => {
    if (filterType === "all") return true;
    if (filterType === "Hospital") return f.type === "Hospital" || f.category?.includes("Hospital");
    if (filterType === "Pharmacy") return f.type === "Pharmacy" || f.name?.toLowerCase().includes("aushadhi") || f.name?.toLowerCase().includes("kendra");
    return true;
  });

  const totalItems = filteredFacilities.length;
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-10 pb-28 md:pb-16 animate-in fade-in duration-300">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          to="/health-hub" 
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Health Hub</span>
        </Link>

        <button
          onClick={() => navigate(`/chat?query=Find%20the%20nearest%20government%20hospital%20and%20Jan%20Aushadhi%20store%20in%20${encodeURIComponent(district)}`)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-emerald-700" />
          <span>Ask AI Locator</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 backdrop-blur-md rounded-full border border-emerald-400/25 text-xs font-bold text-emerald-300">
            <Map className="w-3.5 h-3.5 text-emerald-400" />
            <span>data.gov.in National Health Directory & PMBJP Kendras</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Verified Healthcare Centers.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Directory of 30,000+ government hospitals, Primary Health Centres (PHCs), Community Health Centres, and Jan Aushadhi generic pharmacies across India.
            </p>
          </div>

          {/* Quick City Selector Chips */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 block">Popular Districts:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {POPULAR_CITIES.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCityChipClick(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    district.toLowerCase() === c.city.toLowerCase()
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 border-white/15"
                  }`}
                >
                  {c.city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar & Filter Strip */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="District / City (e.g. Mumbai, Thane, Pune, Delhi)..."
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="State (e.g. Maharashtra)..."
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Centers</span>
          </button>
        </form>

        {/* Filter Pills & Result Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Facilities" },
              { id: "Hospital", label: "Hospitals & PHCs" },
              { id: "Pharmacy", label: "Jan Aushadhi Kendras" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setFilterType(tab.id); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  filterType === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto">
            {loading ? "Searching..." : `Showing ${totalItems} facilities in ${district}`}
          </span>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 h-64 rounded-3xl border border-slate-200"></div>
            ))}
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <Hospital className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No facilities found for this search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting one of the popular cities above or verify the spelling of your district and state.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedFacilities.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      {f.type === "Pharmacy" ? <Pill className="w-5 h-5" /> : <Hospital className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {f.type || "Medical Facility"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                      {f.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{f.district || district}, {f.state || stateName}</span>
                    </div>
                    {f.specialty && (
                      <p className="text-[11px] text-slate-500 mt-1 font-medium line-clamp-1">
                        Specialty: {f.specialty}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {f.contact && f.contact !== "N/A" ? (
                    <a
                      href={`tel:${f.contact}`}
                      className="font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{f.contact}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Govt Public Facility</span>
                  )}

                  <button
                    onClick={() => navigate(`/chat?query=How%20do%20I%20visit%20${encodeURIComponent(f.name)}%20in%20${encodeURIComponent(district)}`)}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Directions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <PaginationControl
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="facilities"
        />
      </section>

    </div>
  );
};

export default HealthDirectory;
