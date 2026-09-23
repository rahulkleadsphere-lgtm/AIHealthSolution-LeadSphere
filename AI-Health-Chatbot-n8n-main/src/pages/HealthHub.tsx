import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Syringe, 
  Droplets, 
  Brain, 
  Apple, 
  Baby, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  Map, 
  PhoneCall, 
  Download,
  Search,
  Sparkles,
  HeartPulse,
  Activity,
  AlertTriangle,
  WifiOff,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Bookmark,
  Share2,
  MessageSquareText,
  Stethoscope,
  ListChecks,
  ExternalLink,
  Layers
} from "lucide-react";
import { PaginationControl } from "@/components/ui/PaginationControl";
import { Badge } from "@/components/ui/badge";

interface HealthCategory {
  id: string;
  title: string;
  categoryKey: string;
  description: string;
  borderHover: string;
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  tag: string;
  articlesCount: number;
  featuredTopics: string[];
}

const HEALTH_CATEGORIES: HealthCategory[] = [
  {
    id: "preventive-care",
    title: "Preventive Healthcare",
    categoryKey: "preventive",
    description: "Evidence-based daily habits, routine screenings, and seasonal defenses to intercept chronic illnesses early.",
    borderHover: "hover:border-emerald-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    icon: ShieldCheck,
    link: "/health-content/preventive-care",
    tag: "Core Prevention",
    articlesCount: 14,
    featuredTopics: ["Blood Pressure Control", "Seasonal Fevers", "Daily Walk Benefits"]
  },
  {
    id: "vaccination-schedules",
    title: "Immunization & Vaccines",
    categoryKey: "vaccination",
    description: "National immunization timetables for infants, adolescents, pregnant mothers, and senior citizens.",
    borderHover: "hover:border-blue-400",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    icon: Syringe,
    link: "/health-content/vaccination-schedules",
    tag: "Immunization",
    articlesCount: 18,
    featuredTopics: ["Childhood 0-5 Years", "Tetanus Boosters", "Senior Flu Shots"]
  },
  {
    id: "hygiene-tips",
    title: "Hygiene & Sanitation",
    categoryKey: "hygiene",
    description: "Potable water preservation, sanitary food storage, and community barrier protocols against enteric outbreaks.",
    borderHover: "hover:border-cyan-400",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-700",
    icon: Droplets,
    link: "/health-content/hygiene-tips",
    tag: "Sanitation",
    articlesCount: 11,
    featuredTopics: ["Water Boiling Protocol", "Safe Food Storage", "Handwashing Protocol"]
  },
  {
    id: "mental-wellness",
    title: "Mental Wellness & Stress",
    categoryKey: "mental",
    description: "Clinically sound strategies for managing acute stress, family anxiety, and restorative circadian sleep hygiene.",
    borderHover: "hover:border-purple-400",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
    icon: Brain,
    link: "/health-content/mental-wellness",
    tag: "Mindfulness",
    articlesCount: 12,
    featuredTopics: ["Pranayama Regulation", "Stress Reduction", "Sleep Architecture"]
  },
  {
    id: "nutrition-diet",
    title: "Local Nutrition & Diet",
    categoryKey: "nutrition",
    description: "Affordable, nutrient-dense meal plans utilizing indigenous millets, legumes, and seasonal greens.",
    borderHover: "hover:border-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    icon: Apple,
    link: "/health-content/nutrition",
    tag: "Nutrition",
    articlesCount: 16,
    featuredTopics: ["Millet Diet Power", "Iron-Rich Foods", "Child Growth Diets"]
  },
  {
    id: "maternal-care",
    title: "Maternal & Infant Care",
    categoryKey: "maternal",
    description: "Antenatal clinic protocols, safe institutional delivery planning, and newborn kangaroo skin-to-skin care.",
    borderHover: "hover:border-rose-400",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-700",
    icon: Baby,
    link: "/health-content/maternal-care",
    tag: "Family Care",
    articlesCount: 15,
    featuredTopics: ["Antenatal Checkups", "Breastfeeding Basics", "Kangaroo Care"]
  }
];

const FILTER_TABS = [
  { id: "all", label: "All Knowledge", icon: Layers },
  { id: "preventive", label: "Preventive Care", icon: ShieldCheck },
  { id: "vaccination", label: "Vaccines", icon: Syringe },
  { id: "hygiene", label: "Hygiene", icon: Droplets },
  { id: "mental", label: "Mental Health", icon: Brain },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "maternal", label: "Maternal & Baby", icon: Baby }
];

const QUICK_SEARCH_PILLS = [
  "Hypertension Control",
  "Millets & Pre-Diabetes",
  "UIP Infant Vaccines",
  "Dengue Warning Signs",
  "Safe Water Boiling",
  "Kangaroo Mother Care"
];

const LOCAL_HEALTH_BULLETINS = [
  {
    id: 1,
    severity: "alert",
    title: "Monsoon Dengue & Malaria Vigilance",
    location: "Rural & Sub-Urban Blocks",
    date: "Active Alert",
    summary: "Prevent standing water in air coolers, discarded tires, and open pots. Free rapid NS1 antigen testing available at all block PHCs.",
    action: "View Dengue Guide",
    link: "/health-content/preventive-care"
  },
  {
    id: 2,
    severity: "info",
    title: "National Pulse Polio Sunday",
    location: "Pan-India Booths",
    date: "Upcoming Sunday",
    summary: "Two drops of oral polio vaccine for all children under 5 years at nearest government schools, Anganwadis, and transit booths.",
    action: "View Vaccine Chart",
    link: "/health-content/vaccination-schedules"
  },
  {
    id: 3,
    severity: "warning",
    title: "Safe Potable Water Advisory",
    location: "Monsoon Affected Districts",
    date: "Advisory Active",
    summary: "Boil domestic drinking water with a rolling boil for 10+ minutes to arrest transmission of acute gastroenteritis and typhoid.",
    action: "Read Water Protocol",
    link: "/health-content/hygiene-tips"
  }
];

interface HealthArticle {
  id: string;
  title: string;
  category: string;
  categoryKey: string;
  summary: string;
  readTime: string;
  author: string;
  link: string;
  tags: string[];
  keyHighlights: string[];
  clinicalDirectives: string[];
  warningSigns: string[];
}

const FEATURED_ARTICLES: HealthArticle[] = [
  {
    id: "bp-control-guide",
    title: "Clinical Blood Pressure Management: Dietary Approaches & Daily Monitoring",
    category: "Preventive Care",
    categoryKey: "preventive",
    summary: "Proven clinical guidelines to maintain resting systolic readings below 120 mmHg through dietary sodium restriction (< 2g/day), potassium-rich vegetables, and standardized digital sphygmomanometer checks.",
    readTime: "4 min read",
    author: "National Health Mission Protocol",
    link: "/health-content/preventive-care",
    tags: ["Hypertension", "Cardiology", "Dietary Salt"],
    keyHighlights: [
      "Limit daily sodium intake to less than 2,000 mg (under 1 teaspoon salt per person per day).",
      "Incorporate potassium-rich vegetables like spinach, fenugreek, and drumstick leaves.",
      "Engage in 30 minutes of moderate aerobic activity (brisk walking) 5 days per week.",
      "Record resting morning and evening BP sitting upright with arm supported at heart level."
    ],
    clinicalDirectives: [
      "Measure BP after 5 minutes of restful sitting; avoid caffeine or smoking 30 minutes prior.",
      "If systolic exceeds 140 mmHg or diastolic exceeds 90 mmHg on 3 separate days, consult a physician.",
      "Adhere strictly to prescribed anti-hypertensive medication without self-discontinuation."
    ],
    warningSigns: [
      "Systolic > 180 mmHg or Diastolic > 120 mmHg (Hypertensive Crisis).",
      "Sudden severe headache accompanied by blurred vision or dizziness.",
      "Chest tightness, shortness of breath, or numbness in the arms/face."
    ]
  },
  {
    id: "glycemic-control-diet",
    title: "Reversing Pre-Diabetes: Low-Glycemic Indian Millets & Fasting Protocols",
    category: "Nutrition",
    categoryKey: "nutrition",
    summary: "Evidence-based nutritional transitions substituting polished white rice with indigenous foxtail, barnyard, and ragi millets to dampen post-prandial glycemic spikes and stimulate peripheral insulin sensitivity.",
    readTime: "6 min read",
    author: "ICMR-NIN Dietary Guidelines",
    link: "/health-content/nutrition",
    tags: ["Diabetes", "Millets", "Nutrition"],
    keyHighlights: [
      "Millets have a glycemic index of 50-55 compared to 70-75 for polished white rice.",
      "High soluble fiber slows gastric emptying and carbohydrate breakdown.",
      "Maintain a 12-hour overnight digestive rest window (e.g., 8:00 PM to 8:00 AM).",
      "Prioritize sprouted legumes (moong, chana) for high-protein breakfast satiety."
    ],
    clinicalDirectives: [
      "Pair millets with generous leafy greens and curd to lower glycemic impact further.",
      "Target fasting blood sugar under 100 mg/dL and HbA1c under 5.7% for pre-diabetes reversal.",
      "Perform periodic post-prandial (2 hours post-meal) fingerstick glucose audits."
    ],
    warningSigns: [
      "Persistent fasting glucose exceeding 126 mg/dL on repeated checks.",
      "Unexplained rapid weight loss, polyuria (frequent urination), and polydipsia (excessive thirst).",
      "Non-healing foot ulcers or numbness/tingling in the toes."
    ]
  },
  {
    id: "universal-immunization-timeline",
    title: "Universal Immunization Programme (UIP): Mandatory Schedule from Birth to 16",
    category: "Vaccines",
    categoryKey: "vaccination",
    summary: "Comprehensive timeline of life-saving vaccines available free of charge across all government health centres and Anganwadis under India's Universal Immunization Programme.",
    readTime: "5 min read",
    author: "Ministry of Health & Family Welfare",
    link: "/health-content/vaccination-schedules",
    tags: ["Immunization", "Pediatrics", "UIP Guidelines"],
    keyHighlights: [
      "At Birth: BCG (Tuberculosis), OPV-0 (Polio), and Hepatitis B birth dose within 24 hours.",
      "Weeks 6, 10, 14: Pentavalent (DPT+HepB+Hib), Rotavirus, bOPV, and fIPV fractional doses.",
      "Months 9-12: Measles-Rubella (MR 1st dose), PCV booster, and Vitamin A 1st dose.",
      "Months 16-24: MR 2nd dose, DPT booster-1, OPV booster, and Japanese Encephalitis-2."
    ],
    clinicalDirectives: [
      "Always maintain the Mother-Child Protection (MCP) card up to date for every hospital visit.",
      "Mild fever and local swelling post-vaccination are normal immune responses treatable with paracetamol.",
      "Missed doses do not require restarting from the beginning; administer catch-up immediately."
    ],
    warningSigns: [
      "High fever exceeding 102°F that does not respond to pediatric paracetamol drops.",
      "Inconsolable crying lasting more than 3 hours or extreme lethargy/unresponsiveness.",
      "Severe facial swelling or breathing difficulty within 2 hours of vaccine administration."
    ]
  },
  {
    id: "monsoon-vector-prevention",
    title: "Monsoon Vector-Borne Disease Defense: Dengue, Malaria & Chikungunya",
    category: "Preventive Care",
    categoryKey: "preventive",
    summary: "Systematic protocol for early detection of Aedes and Anopheles vector infections, critical fever management, fluid therapy standards, and danger signs mandating emergency hospital admission.",
    readTime: "4 min read",
    author: "Vector Borne Disease Control Wing",
    link: "/health-content/preventive-care",
    tags: ["Dengue", "Monsoon", "Fluid Therapy"],
    keyHighlights: [
      "Aedes mosquitoes bite primarily during early morning and late afternoon hours.",
      "Strict avoidance of NSAIDs (ibuprofen, aspirin, diclofenac) which escalate hemorrhage risk.",
      "Oral Rehydration Salts (ORS), coconut water, and home fluids prevent plasma leakage shock.",
      "Check daily complete blood counts (CBC) for hematocrit and platelet trend monitoring."
    ],
    clinicalDirectives: [
      "Take only paracetamol (max 500mg-650mg every 6 hours) for fever control.",
      "Eliminate all standing clean water around living spaces every Sunday (Dry Day protocol).",
      "Request free rapid NS1 antigen testing at block PHC within the first 5 days of fever."
    ],
    warningSigns: [
      "Severe persistent abdominal pain or persistent vomiting (warning sign of plasma leakage).",
      "Bleeding from gums, nose, or appearance of red pinprick spots (petechiae) on skin.",
      "Sudden drop in body temperature accompanied by cold, clammy skin and severe restlessness."
    ]
  },
  {
    id: "potable-water-purification",
    title: "Community Water Sanitation: 10-Minute Rolling Boil & Chlorine Disinfection",
    category: "Hygiene",
    categoryKey: "hygiene",
    summary: "Simple, verifiable microbiological safeguards to eliminate water-borne cholera, typhoid, and acute rotavirus transmission in rural and urban domestic storage systems.",
    readTime: "3 min read",
    author: "Public Health Engineering Wing",
    link: "/health-content/hygiene-tips",
    tags: ["Water Safety", "Typhoid", "Hygiene Protocol"],
    keyHighlights: [
      "A rolling boil sustained for a full 10 minutes inactivates 99.9% of enteric pathogens.",
      "Store boiled water in covered, narrow-mouthed vessels equipped with a tap or ladle.",
      "Never dip unwashed hands or cups into drinking water storage containers.",
      "Use Halazone or Chlorine tablets (0.5 mg/liter) when boiling is impractical in flood zones."
    ],
    clinicalDirectives: [
      "Clean domestic water overhead tanks and sumps at least once every three months.",
      "Wash storage vessels with clean boiled water before refilling.",
      "Provide boiled and cooled water exclusively to infants under 2 years of age."
    ],
    warningSigns: [
      "Sudden onset of watery diarrhea ('rice-water stools') causing rapid dehydration.",
      "High persistent fever with abdominal tenderness and dry cough (suspected typhoid).",
      "Sunken eyes, dry tongue, and absence of urination in children over 6 hours."
    ]
  },
  {
    id: "mental-stress-pranayama",
    title: "Evidence-Based Stress Reduction: 4-7-8 Breathing & Deep Sleep Restoration",
    category: "Mental Health",
    categoryKey: "mental",
    summary: "Physiological techniques to down-regulate the sympathetic nervous system, curtail elevated cortisol output, and restore restorative slow-wave delta sleep architecture.",
    readTime: "5 min read",
    author: "Clinical Psychology Working Group",
    link: "/health-content/mental-wellness",
    tags: ["Mental Health", "Sleep Hygiene", "Pranayama"],
    keyHighlights: [
      "4-7-8 Breathing: Inhale 4s, hold breath 7s, exhale slowly 8s through pursed lips.",
      "Activates vagal tone to decrease resting heart rate within 3-5 breathing cycles.",
      "Eliminate blue light screens (smartphones, TV) 60 minutes before bedtime.",
      "Maintain a consistent sleep-wake schedule 7 days a week to entrain circadian rhythms."
    ],
    clinicalDirectives: [
      "Practice 10 minutes of Anulom-Vilom (alternate nostril breathing) twice daily.",
      "Avoid caffeinated beverages (tea, coffee) after 4:00 PM.",
      "Reach out to the National Tele-MANAS toll-free helpline (14416) for confidential guidance."
    ],
    warningSigns: [
      "Persistent insomnia or inability to function in daily work lasting over 2 weeks.",
      "Sudden panic attacks accompanied by heart palpitations and feelings of impending doom.",
      "Recurrent thoughts of self-harm or feelings of hopelessness (Call 14416 immediately)."
    ]
  },
  {
    id: "antenatal-maternal-nutrition",
    title: "Antenatal Care Essentials: Iron-Folic Acid Supplementation & Hospital Preparedness",
    category: "Maternal & Baby",
    categoryKey: "maternal",
    summary: "Clinical roadmap detailing the 4 mandatory antenatal visits, anemia prevention with iron-folic acid tablets, danger sign recognition, and institutional delivery cash benefits under Janani Suraksha Yojana (JSY).",
    readTime: "6 min read",
    author: "Maternal Health Division",
    link: "/health-content/maternal-care",
    tags: ["Maternity", "JSY Scheme", "Anemia Prevention"],
    keyHighlights: [
      "Minimum 4 Antenatal Care (ANC) visits: 1st trimester, 14-26 weeks, 28-34 weeks, and 36+ weeks.",
      "Consume 1 Iron-Folic Acid (IFA) tablet daily starting from the 14th week for at least 180 days.",
      "Separate Iron and Calcium tablets by at least 2 hours to avoid absorption competition.",
      "Receive 2 doses of Tetanus-Diphtheria (Td) toxoid vaccine during pregnancy."
    ],
    clinicalDirectives: [
      "Target hemoglobin levels above 11.0 g/dL throughout pregnancy.",
      "Identify your designated government delivery hospital and 108 ambulance contact in advance.",
      "Avail ₹1,400 (rural) or ₹1,000 (urban) cash assistance under JSY for institutional delivery."
    ],
    warningSigns: [
      "Vaginal bleeding or sudden gush of clear fluid before 37 weeks.",
      "Severe persistent headache with blurred vision and swelling of face/hands (Preeclampsia).",
      "Decreased or absent fetal movements over a 12-hour period in the third trimester."
    ]
  },
  {
    id: "infant-kangaroo-care",
    title: "Kangaroo Mother Care (KMC) & Exclusive Breastfeeding for Newborn Immunity",
    category: "Maternal & Baby",
    categoryKey: "maternal",
    summary: "Thermal stabilization, physiological infection protection, and neurological development benefits of continuous skin-to-skin Kangaroo Mother Care for low birthweight newborns.",
    readTime: "4 min read",
    author: "Neonatal Health Taskforce",
    link: "/health-content/maternal-care",
    tags: ["Newborn Care", "KMC", "Breastfeeding"],
    keyHighlights: [
      "KMC involves continuous skin-to-skin contact between mother's chest and newborn.",
      "Maintains infant body temperature at 36.5°C–37.5°C without electric incubators.",
      "Exclusive breastfeeding for the first 6 full months provides complete nutrition and antibodies.",
      "Promotes deep infant sleep, regularizes heart rate, and accelerates daily weight gain."
    ],
    clinicalDirectives: [
      "Practice KMC for at least 1-2 hours per session, as many hours per day as possible.",
      "Avoid giving pre-lacteal feeds (honey, ghutti, water) which introduce gut pathogens.",
      "Weigh the infant weekly at the local Anganwadi centre to track growth trajectory."
    ],
    warningSigns: [
      "Inability to suckle breast milk or extreme drowsiness when offered feed.",
      "Axillary temperature under 36.0°C (Hypothermia) or over 37.5°C (Fever).",
      "Yellow discoloration of palms and soles within the first 48 hours (Severe Jaundice)."
    ]
  }
];

export const HealthHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [activeArticleModal, setActiveArticleModal] = useState<HealthArticle | null>(null);

  // Pagination States
  const [categoryPage, setCategoryPage] = useState<number>(1);
  const categoriesPerPage = 6;
  const [articlePage, setArticlePage] = useState<number>(1);
  const articlesPerPage = 4;

  useEffect(() => {
    document.title = "Health Knowledge Hub | SevaSetu AI";
  }, []);

  useEffect(() => {
    setCategoryPage(1);
    setArticlePage(1);
  }, [selectedFilter, deferredSearch]);

  const toggleSaveArticle = useCallback((articleId: string, title: string) => {
    setSavedArticles(prev => {
      const exists = prev.includes(articleId);
      if (exists) {
        toast.info("Removed from saved protocols");
        return prev.filter(id => id !== articleId);
      } else {
        toast.success(`Protocol saved: ${title.slice(0, 32)}...`);
        return [...prev, articleId];
      }
    });
  }, []);

  // Performance Optimization: Memoized filter functions
  const filteredCategories = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return HEALTH_CATEGORIES.filter(cat => {
      const matchesFilter = selectedFilter === "all" || cat.categoryKey === selectedFilter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return cat.title.toLowerCase().includes(q) ||
             cat.description.toLowerCase().includes(q) ||
             cat.featuredTopics.some(t => t.toLowerCase().includes(q));
    });
  }, [selectedFilter, deferredSearch]);

  const totalCategories = filteredCategories.length;
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(
      (categoryPage - 1) * categoriesPerPage,
      categoryPage * categoriesPerPage
    );
  }, [filteredCategories, categoryPage, categoriesPerPage]);

  const filteredArticles = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return FEATURED_ARTICLES.filter(art => {
      const matchesFilter = selectedFilter === "all" || art.categoryKey === selectedFilter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return art.title.toLowerCase().includes(q) ||
             art.summary.toLowerCase().includes(q) ||
             art.tags.some(t => t.toLowerCase().includes(q));
    });
  }, [selectedFilter, deferredSearch]);

  const totalArticles = filteredArticles.length;
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice(
      (articlePage - 1) * articlesPerPage,
      articlePage * articlesPerPage
    );
  }, [filteredArticles, articlePage, articlesPerPage]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10 pb-28 md:pb-16">
      
      {/* 1. Header Banner & Search Strip (Lightweight GPU-accelerated styling) */}
      <section 
        className="rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800"
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e1b4b 100%)"
        }}
      >
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/60 rounded-full border border-blue-400/30 text-xs font-bold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>SevaSetu Medical Library</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/60 rounded-full border border-emerald-400/30 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MoHFW & ICMR-NIN Aligned</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Community Health Knowledge Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Clinically reviewed preventive education, universal immunization timetables, evidence-based nutrition, and emergency first-aid protocols.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800">
            <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Clinical Protocols</span>
              <span className="text-lg font-black text-white">8 Verified</span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Health Domains</span>
              <span className="text-lg font-black text-white">6 Categories</span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Offline First-Aid</span>
              <span className="text-lg font-black text-emerald-400">PWA Ready</span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Surveillance</span>
              <span className="text-lg font-black text-amber-300">Daily Updates</span>
            </div>
          </div>

          {/* Fast Input Strip */}
          <div className="space-y-3 pt-2">
            <div className="relative max-w-2xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics (e.g. Dengue, Blood Pressure, Millets, Infant Vaccines)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-20 py-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm font-medium text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Search Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-400 mr-1 text-[11px]">Popular searches:</span>
              {QUICK_SEARCH_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(pill)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Emergency Offline Quick-Access Strip */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <WifiOff className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-emerald-950">100% Offline Emergency First-Aid Pocketbook</h3>
              <span className="inline-flex items-center gap-1.5 bg-emerald-200 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Works Without Internet
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-medium leading-relaxed max-w-2xl">
              Rapid life-saving steps for snakebites, severe burns, heatstroke, pediatric choking, poisoning, and CPR with direct dispatch dialers (108 / 104).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Link
            to="/offline-first-aid"
            className="w-full md:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-98"
          >
            <span>Open First-Aid Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. Category Filter Chips & Domains Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Explore Health Domains</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Select a category to browse protocols and prevention guidelines</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
            </span>
            {(selectedFilter !== "all" || searchQuery) && (
              <button
                onClick={() => { setSelectedFilter("all"); setSearchQuery(""); }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-300" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Categories Bento Grid (GPU Accelerated transform) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={category.link}
                className={`group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md ${category.borderHover} transition-transform duration-200 ease-out flex flex-col justify-between space-y-5 hover:-translate-y-1 transform-gpu`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${category.iconBg} ${category.iconColor} flex items-center justify-center transition-colors shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                      {category.articlesCount} Guides
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Featured Sub-topics Pills */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {category.featuredTopics.map((topic, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>Read Domain Guide</span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No matching health guides found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your search terms or reset the domain category filter.</p>
            </div>
            <button
              onClick={() => { setSearchQuery(""); setSelectedFilter("all"); }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Categories Pagination */}
        <PaginationControl
          currentPage={categoryPage}
          totalItems={totalCategories}
          itemsPerPage={categoriesPerPage}
          onPageChange={setCategoryPage}
          itemLabel="categories"
        />
      </section>

      {/* 4. Verified Clinical Articles & Disease Protocols */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Verified Clinical Protocols & Guidelines
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Click any protocol card to inspect detailed directives and diagnostic criteria</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {totalArticles} Evidence-Based Protocols
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paginatedArticles.map((article) => {
            const isSaved = savedArticles.includes(article.id);
            return (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-transform duration-200 ease-out flex flex-col justify-between space-y-5 group hover:-translate-y-1 transform-gpu"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {article.category}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readTime}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveArticle(article.id, article.title);
                        }}
                        title={isSaved ? "Saved" : "Save for later"}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved 
                            ? "bg-blue-50 border-blue-200 text-blue-600" 
                            : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveArticleModal(article)}
                    className="cursor-pointer space-y-1.5"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  {/* Highlights preview */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Clinical Takeaway:</span>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {article.keyHighlights[0]}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {article.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-400 font-medium text-[11px] truncate max-w-[160px] sm:max-w-[200px]">
                    {article.author}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/chat?query=Explain%20the%20clinical%20protocol%20for%20${encodeURIComponent(article.title)}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      title="Ask AI questions about this protocol"
                    >
                      <MessageSquareText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ask AI</span>
                    </button>

                    <button
                      onClick={() => setActiveArticleModal(article)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1"
                    >
                      <span>Read Protocol</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Articles Pagination */}
        <PaginationControl
          currentPage={articlePage}
          totalItems={totalArticles}
          itemsPerPage={articlesPerPage}
          onPageChange={setArticlePage}
          itemLabel="articles"
        />
      </section>

      {/* 5. Real-time District Health Bulletins & Disease Surveillance */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">District Health Vigilance & Alerts</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Surveillance Live</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LOCAL_HEALTH_BULLETINS.map((bulletin) => (
            <div
              key={bulletin.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-transform duration-200 ease-out space-y-4 flex flex-col justify-between hover:-translate-y-1 transform-gpu"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-black px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider uppercase ${
                    bulletin.severity === "alert" 
                      ? "bg-rose-100 text-rose-800 border border-rose-200" 
                      : bulletin.severity === "warning"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}>
                    {bulletin.severity.toUpperCase()}
                  </span>
                  <span className="text-slate-400 font-semibold">{bulletin.date}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">{bulletin.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{bulletin.summary}</p>
              </div>

              <Link
                to={bulletin.link}
                className="pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-between group"
              >
                <span>{bulletin.action}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Essential Directories & Resources */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Essential Healthcare Resources</h2>
            <p className="text-xs text-slate-500 font-medium">Verified national registries, emergency dialers, and local language manuals</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            4 Core Portals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Resource 1: Health Calendar */}
          <Link
            to="/health-calendar"
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-transform duration-200 ease-out space-y-4 hover:-translate-y-1 flex flex-col justify-between transform-gpu"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  Live Dates
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Health Calendar</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">National health awareness days, pulse polio drives & camp dates.</p>
              </div>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>View Timetable</span>
              <div className="w-6 h-6 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>

          {/* Resource 2: Health Directory */}
          <Link
            to="/health-directory"
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-transform duration-200 ease-out space-y-4 hover:-translate-y-1 flex flex-col justify-between transform-gpu"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                  <Map className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  30,000+ Centers
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Health Directory</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Verified Primary Health Centres, Civil Hospitals & Jan Aushadhi Kendras.</p>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>Search Directory</span>
              <div className="w-6 h-6 rounded-full bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>

          {/* Resource 3: Helplines */}
          <Link
            to="/helplines"
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-transform duration-200 ease-out space-y-4 hover:-translate-y-1 flex flex-col justify-between transform-gpu"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  24/7 Toll-Free
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Emergency Helplines</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Direct emergency dispatch for 108 ambulance, 104 advice & 14416 mental health.</p>
              </div>
            </div>
            <div className="text-xs font-bold text-rose-600 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>View Helplines</span>
              <div className="w-6 h-6 rounded-full bg-rose-50 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>

          {/* Resource 4: PDF Library */}
          <Link
            to="/pdf-library"
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-transform duration-200 ease-out space-y-4 hover:-translate-y-1 flex flex-col justify-between transform-gpu"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                  <Download className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  5 Languages
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Regional PDF Library</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Free downloadable patient manuals in Hindi, Marathi, Odia, Telugu & English.</p>
              </div>
            </div>
            <div className="text-xs font-bold text-indigo-600 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>Download PDFs</span>
              <div className="w-6 h-6 rounded-full bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 7. Consult AI Health Assistant CTA */}
      <section 
        className="rounded-3xl p-6 sm:p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-blue-500/20"
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #312e81 60%, #0f172a 100%)"
        }}
      >
        <div className="space-y-2 text-center md:text-left relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 text-xs font-bold text-blue-200 border border-blue-400/30">
            <Activity className="w-3.5 h-3.5 text-blue-300" />
            <span>24/7 Clinical AI Support</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
            Have Symptoms or Need Personal Guidance?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            Our clinical AI triage assistant answers symptom questions, explains medical lab tests, and locates nearby Jan Aushadhi generic medicines.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full md:w-auto">
          <Link
            to="/chat"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-800 hover:bg-blue-50 font-black text-xs uppercase tracking-wider rounded-2xl transition-colors shadow-lg active:scale-98 flex items-center justify-center gap-2"
          >
            <MessageSquareText className="w-4 h-4 text-blue-700" />
            <span>Consult SevaSetu AI</span>
          </Link>
        </div>
      </section>

      {/* 8. Interactive Clinical Protocol Reader Modal */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    {activeArticleModal.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeArticleModal.readTime}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    MoHFW Protocol
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {activeArticleModal.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 block">
                  Author: {activeArticleModal.author}
                </span>
              </div>

              <button
                onClick={() => setActiveArticleModal(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              {/* Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Executive Clinical Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeArticleModal.summary}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Key Clinical Takeaways</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeArticleModal.keyHighlights.map((highlight, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Directives */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Standard of Care Directives</h4>
                </div>
                <ul className="space-y-2">
                  {activeArticleModal.clinicalDirectives.map((directive, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{directive}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning Signs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">Warning Signs Mandating Hospital Evaluation</h4>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-2">
                  {activeArticleModal.warningSigns.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-rose-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5"></span>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleSaveArticle(activeArticleModal.id, activeArticleModal.title)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedArticles.includes(activeArticleModal.id) ? "Saved in List" : "Save Protocol"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const title = activeArticleModal.title;
                    setActiveArticleModal(null);
                    navigate(`/chat?query=Explain%20clinical%20protocol%20for%20${encodeURIComponent(title)}`);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  <span>Ask Seva AI About This</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HealthHub;