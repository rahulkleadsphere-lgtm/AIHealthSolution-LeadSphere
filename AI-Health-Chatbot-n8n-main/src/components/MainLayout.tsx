import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { searchService } from "../services/api";
import {
  Activity,
  MessageSquare,
  FileText,
  Calendar,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  Languages,
  PhoneCall,
  Menu,
  X,
  Heart,
  Zap,
  Plus,
  HeartPulse,
  Home,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Globe,
  LogOut,
  DownloadCloud,
  WifiOff
} from "lucide-react";

import { usePWAInstall } from "../hooks/usePWAInstall";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { CommandPalette } from "./CommandPalette";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { notifications, markAsRead, unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const { installPrompt, isInstalled, handleInstall } = usePWAInstall();
  const { isOffline } = useOfflineStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem("sevasetu_profile_image") || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        setProfileImage(localStorage.getItem("sevasetu_profile_image") || null);
      } catch {}
    };
    window.addEventListener("sevasetu_profile_image_updated", handleAvatarUpdate);
    return () => {
      window.removeEventListener("sevasetu_profile_image_updated", handleAvatarUpdate);
    };
  }, []);

  // Global shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isChat = location.pathname === "/chat";

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    // Clear previous results if query is too short
    if (q.trim().length < 2) {
      setSearchResults(null);
      return;
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const results = await searchService.globalSearch(searchQuery);
          setSearchResults(results);
        } catch (err) {
          setSearchResults(null);
        }
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Vitals", path: "/vitals", icon: Activity },
    { name: t("nav.chat") || "Consult AI", path: "/chat", icon: MessageSquare },
    { name: "Health Vault", path: "/vault", icon: FileText },
    { name: t("nav.schemes") || "Govt Schemes", path: "/schemes", icon: ShieldCheck },
    { name: t("nav.appointments") || "Appointments", path: "/appointment", icon: Calendar },
    { name: t("nav.healthhub") || "Health Hub", path: "/health-hub", icon: HeartPulse },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[300] bg-amber-500 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>No Internet Connection • 100% Offline Emergency First-Aid Pocketbook is Active.</span>
          </div>
          <Link to="/offline-first-aid" className="underline hover:text-amber-100 font-extrabold text-[11px] uppercase tracking-wider">
            Open First-Aid →
          </Link>
        </div>
      )}

      {/* Navigation Header */}
      <header className={`fixed ${isOffline ? 'top-8' : 'top-0'} w-full z-[200] bg-white/95 backdrop-blur-sm border-b border-slate-200/80 h-16 md:h-20 lg:h-16 shadow-2xs transition-all`}>
        <div className="max-w-[1600px] mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img 
              src="/app-icon.png" 
              alt="SevaSetu AI" 
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-black tracking-tight text-slate-900 leading-none">
                {t("app.name").split(" ")[0]}<span className="text-blue-600 italic">{t("app.name").split(" ")[1]}</span>
              </span>
              <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 tracking-wider mt-0.5">{t("app.tagline")}</span>
            </div>
          </Link>

          {/* Functional Search Bar with Ctrl+K trigger */}
          <div className="hidden lg:flex relative items-center bg-slate-100/80 px-4 py-2.5 rounded-2xl w-[450px] border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all duration-300 group">
            <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium ml-3 placeholder:text-slate-400 outline-none" 
              placeholder={t("ui.search.placeholder")} 
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            
            {/* Quick Ctrl+K trigger button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors ml-2 shrink-0 shadow-sm"
              title="Press Ctrl+K or Cmd+K"
            >
              <span>⌘K</span>
            </button>
            
            {/* Search Results Overlay */}
            {isSearchFocused && searchResults && (searchQuery.trim() !== "") && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-[24px] shadow-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</span>
                  <button onClick={() => { setSearchQuery(""); setSearchResults(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {(searchResults.providers.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 group flex items-center gap-1.5"><Heart className="w-3 h-3" /> Doctors & Centers</p>
                      {searchResults.providers.map((p: any) => (
                        <Link key={p.id} to={`/facility/${p.id}`} className="block p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                          <p className="font-bold text-sm text-slate-800">{p.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{p.specialty || p.type} • {p.district}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {(searchResults.schemes.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 group flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Health Schemes</p>
                      {searchResults.schemes.map((s: any) => (
                        <Link key={s.id} to={`/scheme/${encodeURIComponent(s.title)}`} className="block p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                          <p className="font-bold text-sm text-slate-800">{s.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{s.description}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {(searchResults.terms.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2 group flex items-center gap-1.5"><FileText className="w-3 h-3" /> Medical Library</p>
                      {searchResults.terms.map((t: any, idx: number) => (
                        <div key={idx} className="p-3 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-emerald-100">
                          <p className="font-bold text-sm text-slate-800">{t.term}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Header Navigation Elements */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Language Switcher Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              {(['en', 'hi', 'te', 'or'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all uppercase ${
                    language === lang 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Offline Pocketbook Button */}
            <Link 
              to="/offline-first-aid" 
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 transition-all shadow-sm"
              title="100% Offline Emergency First-Aid"
            >
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline">Offline Aid</span>
            </Link>

            {/* Notifications Bell */}
            <Link to="/notifications" className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Avatar & Menu */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors" title="Personal Settings & Account Control">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 shadow-sm overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </Link>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay with Support & Care Section */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[300] bg-white flex flex-col p-6 overflow-y-auto animate-in fade-in duration-300">
          {/* Mobile Drawer Top Bar */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
              <img 
                src="/app-icon.png" 
                alt="SevaSetu AI" 
                className="w-10 h-10 rounded-xl object-contain shadow-sm" 
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900">{t("app.name")}</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{t("app.tagline")}</span>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="py-4 space-y-6">
            {/* Section 1: Main Menu */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">{t("ui.main.menu")}</p>
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive(item.path) 
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20" 
                      : "text-slate-700 hover:bg-slate-50 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}
            </div>

            {/* Section 2: Support & Care (Now Fully Displayed on Mobile!) */}
            <div className="space-y-1 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">{t("ui.support.care")}</p>
              
              {/* 100% Offline Pocketbook */}
              <Link 
                to="/offline-first-aid" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-700 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Offline First-Aid Pocketbook</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  100% Offline
                </span>
              </Link>

              {/* Language Settings */}
              <Link 
                to="/language" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">{t("nav.language")}</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md uppercase font-mono">
                  {language}
                </span>
              </Link>

              {/* Health Profile */}
              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span className="text-sm">{t("nav.settings")}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>

              {/* Helplines & Help */}
              <Link 
                to="/helplines" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                  <span className="text-sm">{t("nav.help")}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>

              {/* PWA Install Button */}
              {installPrompt && !isInstalled && (
                <button 
                  onClick={() => { handleInstall(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between w-full p-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-bold text-left"
                >
                  <div className="flex items-center gap-3">
                    <DownloadCloud className="w-5 h-5" />
                    <span className="text-sm">{t("nav.install")}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">PWA</span>
                </button>
              )}
            </div>

            {/* Emergency 108 Card in Mobile Menu */}
            <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">{t("ui.emergency")}</p>
                  <p className="text-[10px] text-red-100 font-medium mt-1">National Ambulance Service</p>
                </div>
              </div>
              <a 
                href="tel:108" 
                className="bg-white text-red-600 font-black px-4 py-2 rounded-xl text-xs shadow-sm active:scale-95 transition-all hover:bg-red-50"
              >
                Call 108
              </a>
            </div>
          </div>
          
          {/* Drawer Bottom Language Selector & Signout */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
             <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
               {(['en', 'hi', 'te', 'or'] as const).map((lang) => (
                 <button 
                   key={lang} 
                   onClick={() => { setLanguage(lang); setMobileMenuOpen(false); }} 
                   className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                     language === lang ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                   }`}
                 >
                   {lang}
                 </button>
               ))}
             </div>
             <button 
               onClick={() => { logout(); setMobileMenuOpen(false); }} 
               className="flex items-center gap-2 p-2 text-slate-400 hover:text-red-600 text-xs font-bold transition-colors"
             >
               <LogOut className="w-4 h-4" />
               <span>Sign Out Account</span>
             </button>
          </div>
        </div>
      )}

      <div className="flex pt-20 md:pt-20 lg:pt-16 flex-1 overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] w-72 bg-white sticky top-20 py-6 px-4 space-y-8 border-r border-slate-200/60 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">{t("ui.main.menu")}</p>
            {navItems.map((item) => (
              <Link 
                key={item.path}
                className={`flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 group ${
                  isActive(item.path) 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                }`} 
                to={item.path}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                <span className={`text-[14px] tracking-tight ${isActive(item.path) ? "font-bold" : "font-semibold"}`}>
                  {item.name}
                </span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">{t("ui.support.care")}</p>
              <div className="space-y-1">
                {installPrompt && !isInstalled && (
                  <button 
                    onClick={handleInstall}
                    className="flex w-full items-center gap-4 text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all font-semibold text-sm group"
                  >
                    <DownloadCloud className="w-5 h-5 stroke-2 group-hover:scale-110 transition-transform" />
                    {t("nav.install")}
                  </button>
                )}
                <Link to="/offline-first-aid" className="flex items-center gap-4 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-all font-semibold text-sm group">
                  <WifiOff className="w-5 h-5 text-red-500 stroke-2 group-hover:scale-110 transition-transform" />
                  <span>Offline Pocketbook</span>
                </Link>
                <Link to="/language" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all font-semibold text-sm group">
                  <Languages className="w-5 h-5 stroke-2 group-hover:scale-110 transition-transform" />
                  {t("nav.language")}
                </Link>
                <Link to="/profile" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all font-semibold text-sm group">
                  <Settings className="w-5 h-5 stroke-2 group-hover:scale-110 transition-transform" />
                  {t("nav.settings")}
                </Link>
                <Link to="/helplines" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all font-semibold text-sm group">
                  <HelpCircle className="w-5 h-5 stroke-2 group-hover:scale-110 transition-transform" />
                  {t("nav.help")}
                </Link>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 bg-red-200/20 w-20 h-20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-md animate-pulse">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-red-600 text-sm">{t("ui.emergency")}</span>
                </div>
                <p className="text-[11px] text-red-700/70 font-bold leading-tight uppercase tracking-wider">{t("ui.emergency.desc")}</p>
                <a 
                  href="tel:108"
                  className="w-full text-center py-2.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-200 active:scale-95 transition-all hover:bg-red-700 uppercase tracking-widest block"
                >
                  {t("ui.call.now")}
                </a>
              </div>
            </div>

            <button 
              onClick={logout}
              className="flex items-center gap-4 text-slate-400 hover:text-red-600 hover:bg-red-50 px-4 py-3.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest group border border-transparent hover:border-red-100 mt-auto"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Sign Out Hub
            </button>
          </div>
        </aside>

        {/* Main Content Canvas with Balanced Ergonomic Padding */}
        <main className={`flex-1 min-h-0 ${isChat ? "flex flex-col h-full overflow-hidden" : "overflow-y-auto scroll-smooth"}`}>
          <div className={`${isChat ? "flex-1 min-h-0 flex flex-col h-full overflow-hidden pb-16 md:pb-0" : "min-h-[calc(100vh-64px)] w-full pb-20 md:pb-8"}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Docked Native Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white/95 backdrop-blur-sm border-t border-slate-200/80 px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <Link to="/" className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Home</span>
          </Link>

          <Link to="/chat" className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${isActive('/chat') ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <MessageSquare className="w-5 h-5" strokeWidth={isActive('/chat') ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Consult</span>
          </Link>

          {/* Raised Emergency 108 Action Dialer */}
          <a 
            href="tel:108"
            className="w-12 h-12 -mt-5 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-red-300 border-4 border-white active:scale-90 transition-all group"
            title="Dial 108 Emergency"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
            <span className="text-[8px] font-black leading-none mt-0.5">108</span>
          </a>

          <Link to="/schemes" className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${isActive('/schemes') ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <ShieldCheck className="w-5 h-5" strokeWidth={isActive('/schemes') ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Schemes</span>
          </Link>

          <Link to="/analysis" className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${isActive('/analysis') ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            <FileText className="w-5 h-5" strokeWidth={isActive('/analysis') ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Reports</span>
          </Link>
        </div>
      </nav>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
