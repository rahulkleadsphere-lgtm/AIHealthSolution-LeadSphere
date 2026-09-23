import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Search, 
  Syringe, 
  Heart, 
  Baby, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  MessageSquareText,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface HealthEvent {
  id: string;
  day: number;
  month: string;
  year: number;
  title: string;
  category: "immunization" | "awareness" | "maternal" | "blood";
  categoryLabel: string;
  location: string;
  time: string;
  description: string;
}

const HEALTH_EVENTS: HealthEvent[] = [
  { 
    id: "e1",
    day: 7, 
    month: "April", 
    year: 2025,
    title: "World Health Day Campaign", 
    category: "awareness", 
    categoryLabel: "Awareness Day",
    location: "District Town Hall & All PHCs", 
    time: "09:30 AM",
    description: "Pan-India awareness drive focusing on universal health coverage, hypertension screenings, and free blood sugar checks."
  },
  { 
    id: "e2",
    day: 12, 
    month: "April", 
    year: 2025,
    title: "National UIP Pulse Polio Booster Camp", 
    category: "immunization", 
    categoryLabel: "Vaccination Drive",
    location: "Community Health Center & Anganwadis", 
    time: "08:00 AM – 04:00 PM",
    description: "Two oral polio drops for all children under 5 years old. Walk-in availability at transit booths and bus stands."
  },
  { 
    id: "e3",
    day: 17, 
    month: "April", 
    year: 2025,
    title: "World Hemophilia Day Clinic", 
    category: "awareness", 
    categoryLabel: "Specialist Clinic",
    location: "District Hospital Hematology Wing", 
    time: "10:00 AM – 02:00 PM",
    description: "Screening and factor replacement consultation for hereditary bleeding disorders."
  },
  { 
    id: "e4",
    day: 22, 
    month: "April", 
    year: 2025,
    title: "PM Surakshit Matritva Abhiyan (PMSMA) Camp", 
    category: "maternal", 
    categoryLabel: "Maternal Health",
    location: "Block Primary Health Centre", 
    time: "09:00 AM – 01:00 PM",
    description: "Comprehensive antenatal checkups by gynecologists, free ultrasound vouchers, and IFA tablet distribution for expecting mothers."
  },
  { 
    id: "e5",
    day: 25, 
    month: "April", 
    year: 2025,
    title: "World Malaria Day: Vector Eradication Drive", 
    category: "awareness", 
    categoryLabel: "Public Health",
    location: "Sub-District Health Blocks", 
    time: "10:30 AM",
    description: "Distribution of long-lasting insecticidal nets (LLIN) and community fogging protocols in vector-prone wards."
  },
  { 
    id: "e6",
    day: 28, 
    month: "April", 
    year: 2025,
    title: "Voluntary Blood Donation Drive", 
    category: "blood", 
    categoryLabel: "Blood Bank",
    location: "Red Cross Blood Bank & Civil Hospital", 
    time: "09:00 AM – 05:00 PM",
    description: "Community voluntary donation drive to replenish regional whole blood and platelet banks."
  }
];

export const HealthCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const eventDays = HEALTH_EVENTS.map(e => e.day);

  const filteredEvents = HEALTH_EVENTS.filter(event => {
    const matchesCat = selectedCategory === "all" || event.category === selectedCategory;
    const matchesDay = selectedDay === null || event.day === selectedDay;
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDay && matchesSearch;
  });

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
          onClick={() => navigate("/chat?query=What%20health%20camps%20and%20vaccination%20drives%20are%20scheduled%20this%20month")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
          <span>Ask AI Camp Dates</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 backdrop-blur-md rounded-full border border-blue-400/25 text-xs font-bold text-blue-300">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>National Health Mission • District Activity Timetable</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Health Awareness & Camp Calendar.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Track upcoming pulse polio drives, maternal health checkup camps, voluntary blood donation events, and international health days in your area.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Grid & Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Month Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-slate-900">April 2025</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Click a highlighted day to filter events</p>
            </div>
            {selectedDay && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Clear Day
              </button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const hasEvent = eventDays.includes(dayNum);
              const isSelected = selectedDay === dayNum;
              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                  className={`aspect-square rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                      : hasEvent
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 font-black"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasEvent && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute bottom-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Active Health Event Day</span>
            </div>
          </div>
        </div>

        {/* Right Column: Events List */}
        <div className="lg:col-span-2 space-y-5">
          {/* Search & Category Filter Pills */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events (e.g. Polio, Maternal, Blood, Malaria)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: "all", label: "All Events" },
                { id: "immunization", label: "Vaccination Drives" },
                { id: "maternal", label: "Maternal Health" },
                { id: "blood", label: "Blood Camps" },
                { id: "awareness", label: "Awareness Days" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Cards */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No events found for this filter</h3>
                <p className="text-xs text-slate-500">Try choosing another day or resetting the category filter.</p>
                <button
                  onClick={() => { setSelectedCategory("all"); setSelectedDay(null); setSearchQuery(""); }}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out space-y-4 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-black tracking-wider leading-none">{event.month.slice(0, 3)}</span>
                        <span className="text-lg font-black leading-none mt-0.5">{event.day}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {event.categoryLabel}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold self-start sm:self-auto">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {event.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          toast.success(`Reminder set for ${event.title}`);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Bell className="w-3.5 h-3.5 text-slate-500" />
                        <span>Remind Me</span>
                      </button>

                      <button
                        onClick={() => navigate(`/chat?query=Give%20me%20full%20details%20and%20eligibility%20for%20${encodeURIComponent(event.title)}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>Ask AI Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default HealthCalendar;
