import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Phone, Star, Clock, Globe, 
  MessageSquare, ShieldCheck, Share2, ExternalLink,
  Hospital, Stethoscope, Navigation, Heart
} from "lucide-react";
import { toast } from "sonner";

const FacilityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [facility, setFacility] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Mocking the Google Business Data that would come from an API
    useEffect(() => {
        // In a real app, we'd fetch from /api/facility/:id 
        // which would call Google Places API internal
        setLoading(true);
        setTimeout(() => {
          setFacility({
            name: decodeURIComponent(id || "Unknown Facility"),
            type: "General Hospital",
            rating: 4.6,
            reviewsCount: 1240,
            address: "Main Road, Sector 12, Maharashtra, India",
            phone: "+91 22 4567 8900",
            status: "Open 24 Hours",
            website: "https://example-hospital.com",
            about: "Leading healthcare facility providing 24/7 emergency services, specialized maternity ward, and advanced diagnostic lab. Recognized by the District Health Authority.",
            reviews: [
                { user: "Rahul Sharma", rating: 5, comment: "Excellent staff and quick response. The emergency ward is very well managed.", date: "2 weeks ago" },
                { user: "Priya V.", rating: 4, comment: "Very clean facility. Doctors are professional, though waiting times can be long.", date: "1 month ago" },
                { user: "Amit K.", rating: 5, comment: "Saved my father during an emergency. Reliable ambulance service.", date: "3 months ago" }
            ],
            images: [
                "https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ]
          });
          setLoading(false);
        }, 800);
    }, [id]);

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    if (!facility) return <div>Facility not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Image Section */}
            <div className="h-[40vh] relative overflow-hidden group">
                <img src={facility.images[0]} className="w-full h-full object-cover" alt={facility.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <div className="absolute top-8 left-8">
                    <Link to="/health-directory" className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all border border-white/20">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </Link>
                </div>

                <div className="absolute bottom-12 left-8 md:left-20 right-8 text-white space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">{facility.type}</span>
                        <div className="flex items-center gap-1.5 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-black text-sm">{facility.rating}</span>
                            <span className="text-white/60 text-xs font-bold">({facility.reviewsCount} Reviews)</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase italic leading-none max-w-4xl">{facility.name}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 md:px-20 -mt-10 relative z-20 flex flex-col lg:flex-row gap-12">
                {/* Main Content */}
                <div className="flex-1 space-y-12">
                    <div className="bg-white rounded-[48px] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-white space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-slate-800">About this Facility</h2>
                            <p className="text-slate-500 font-bold leading-relaxed text-lg">{facility.about}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-2">Availability</p>
                                    <p className="text-slate-800 font-black tracking-tight">{facility.status}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-2">Verification</p>
                                    <p className="text-emerald-600 font-black tracking-tight italic">GOVT VERIFIED</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Google Reviews Simulation */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-slate-800 px-2">Community Reviews</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {facility.reviews.map((rev: any, i: number) => (
                                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4 hover:-translate-y-1 transition-transform">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs">
                                                {rev.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 leading-none text-sm">{rev.user}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rev.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {Array.from({length: rev.rating}).map((_, idx) => (
                                                <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-500 font-bold leading-relaxed">{rev.comment}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                             <MessageSquare className="w-4 h-4" /> View All Google Reviews
                        </button>
                    </div>
                </div>

                {/* Sidebar Sticky Panel */}
                <div className="lg:w-96 space-y-6">
                    <div className="bg-white p-10 rounded-[56px] shadow-2xl border border-white sticky top-12 space-y-8">
                        <div className="space-y-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</p>
                             <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                    <p className="text-slate-600 font-bold text-sm leading-relaxed">{facility.address}</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    <p className="text-slate-800 font-black tracking-tight">{facility.phone}</p>
                                </div>
                             </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <a href={`tel:${facility.phone}`} className="w-full bg-emerald-600 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all">
                                <Phone className="w-4 h-4" /> CALL NOW
                            </a>
                            <button onClick={() => toast.success("Redirecting to your phone app...")} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all">
                                <Navigation className="w-4 h-4" /> Get Directions
                            </button>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                           <button className="text-slate-400 hover:text-blue-600 transition-colors"><Share2 className="w-5 h-5" /></button>
                           <button onClick={() => window.open(`https://www.google.com/search?q=${facility.name}`, "_blank")} className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                               Open in Maps <ExternalLink className="w-3 h-3" />
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityDetail;
