import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Apple, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  MessageSquareText, 
  ChevronRight, 
  Wheat, 
  Utensils, 
  Activity,
  Flame,
  Leaf
} from "lucide-react";

export const Nutrition: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMillet, setSelectedMillet] = useState<string>("ragi");

  const milletsData = [
    {
      id: "ragi",
      name: "Ragi (Finger Millet / Mandua)",
      calcium: "344 mg / 100g (Highest of all cereals)",
      glycemicIndex: "Low (52)",
      primaryBenefit: "Bone Density & Maternal Calcium Support",
      description: "Rich in polyphenols and calcium. Essential for weaning infants, growing adolescents, and osteopenia prevention in women."
    },
    {
      id: "bajra",
      name: "Bajra (Pearl Millet / Kambu)",
      calcium: "42 mg / 100g",
      glycemicIndex: "Low (54)",
      primaryBenefit: "Iron Powerhouse & Anemia Interception",
      description: "Contains 8 mg of iron per 100g along with high zinc, making it a critical dietary defense against nutritional iron-deficiency anemia."
    },
    {
      id: "jowar",
      name: "Jowar (Sorghum / Chari)",
      calcium: "25 mg / 100g",
      glycemicIndex: "Medium (62)",
      primaryBenefit: "Cardiovascular Health & Gluten-Free Fiber",
      description: "Packed with copper, magnesium, and anthocyanin antioxidants that lower LDL cholesterol and improve peripheral vascular tone."
    },
    {
      id: "foxtail",
      name: "Foxtail Millet (Kangni / Korra)",
      calcium: "31 mg / 100g",
      glycemicIndex: "Very Low (50)",
      primaryBenefit: "Pre-Diabetes & Post-Prandial Glycemic Regulation",
      description: "Slow-release complex carbohydrates that prevent insulin spikes, supporting sustained energy and metabolic stabilization."
    }
  ];

  const platePillars = [
    {
      portion: "50% of Plate",
      title: "Vegetables & Seasonal Greens",
      desc: "Spinach, fenugreek, drumstick leaves, bitter gourd, and local gourds for micronutrients, potassium, and prebiotic dietary fiber.",
      badge: "Micronutrients & Fiber",
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-950"
    },
    {
      portion: "25% of Plate",
      title: "Complex Whole Grains & Millets",
      desc: "Unpolished ragi, jowar rotis, or brown rice. Avoid refined maida and polished white rice to avert sudden glycemic spikes.",
      badge: "Sustained Energy",
      color: "border-amber-200 bg-amber-50/50 text-amber-950"
    },
    {
      portion: "25% of Plate",
      title: "High-Quality Protein Sources",
      desc: "Lentils (dal), sprouted moong, black chana, paneer, curd, or boiled eggs to maintain lean muscle mass and cellular immunity.",
      badge: "Cellular Repair",
      color: "border-blue-200 bg-blue-50/50 text-blue-950"
    },
    {
      portion: "Micro-Dose",
      title: "Fermented Probiotics & Seeds",
      desc: "A small bowl of homemade curd or chaas (buttermilk) alongside roasted flax or sesame seeds for gut microbiome and omega-3s.",
      badge: "Gut Health",
      color: "border-purple-200 bg-purple-50/50 text-purple-950"
    }
  ];

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
          onClick={() => navigate("/chat?query=Create%20a%20balanced%20Indian%20millet%20diet%20plan%20for%20diabetes%20control")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-all shadow-sm"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-amber-700" />
          <span>Ask AI Meal Plan</span>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-amber-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 backdrop-blur-md rounded-full border border-amber-400/25 text-xs font-bold text-amber-300">
            <Apple className="w-3.5 h-3.5 text-amber-400" />
            <span>ICMR-NIN Indian Dietary Guidelines • Shree Anna Millets</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Indigenous Nutrition & Millets.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Accessible, nutrient-dense nutritional frameworks using indigenous Indian grains, seasonal legumes, and farm-fresh greens to reverse pre-diabetes and overcome anemia.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Low Glycemic Index Grains</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10 flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">High Calcium & Dietary Iron</span>
            </div>
          </div>
        </div>
      </section>

      {/* Indigenous Millets (Shree Anna) Deep-Dive */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Indigenous Indian Millets (Shree Anna) Guide
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Click a millet to view nutritional composition and clinical advantages</p>
          </div>

          {/* Millet Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto self-start sm:self-auto">
            {milletsData.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMillet(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedMillet === m.id ? "bg-white text-amber-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Millet Card */}
        {(() => {
          const m = milletsData.find(item => item.id === selectedMillet) || milletsData[0];
          return (
            <div className="bg-amber-50/50 rounded-3xl border border-amber-200/80 p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-amber-950">{m.name}</h3>
                  <p className="text-xs text-amber-800 font-bold mt-0.5">{m.primaryBenefit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-800 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                    GI: {m.glycemicIndex}
                  </span>
                  <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
                    {m.calcium}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {m.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-slate-500">Clinical Recommendation: 3–4 meals per week</span>
                <button
                  onClick={() => navigate(`/chat?query=Share%20easy%20cooking%20recipes%20for%20${encodeURIComponent(m.name)}`)}
                  className="font-bold text-amber-800 hover:text-amber-900 text-xs flex items-center gap-1"
                >
                  <span>Ask AI Recipes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Balanced Indian Thali Framework */}
      <section className="space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">The Ideal Balanced Indian Plate</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">Portion architecture recommended by ICMR-NIN for diabetes and heart disease prevention</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {platePillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`rounded-3xl border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 ${pillar.color}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-white/80 border border-slate-200 shadow-sm">
                    {pillar.portion}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{pillar.badge}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{pillar.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consult AI Assistant CTA */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Want a Personalized Dietary Plan?</h3>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-medium max-w-xl">
            Input your dietary preferences (vegetarian, vegan, non-vegetarian) and local crop availability in AI chat to get a custom weekly grocery and meal plan.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat?query=Generate%20a%20personalized%20weekly%20healthy%20diet%20plan%20for%20me")}
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-950 hover:bg-amber-50 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <MessageSquareText className="w-4 h-4 text-amber-800" />
          <span>Generate Meal Plan</span>
        </button>
      </section>

    </div>
  );
};

export default Nutrition;
