import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { chatService, translationService, profileService } from "../services/api";
import { 
  Send, 
  Mic, 
  Bot, 
  User, 
  Loader2, 
  Languages, 
  Trash2, 
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Phone,
  Check,
  X,
  Building2,
  HeartPulse,
  BellRing,
  Clock,
  Plus,
  Search,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Calendar,
  History,
  Tag,
  BookmarkPlus,
  FileText,
  MapPin,
  Navigation
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useHealthData } from "../contexts/HealthDataContext";
import { useVoice } from "../hooks/useVoice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PendingMemory {
  action: string;
  memory_type: string;
  key: string;
  value: string;
  confidence: number;
  display_name: string;
  prompt: string;
  source_context?: string;
}

interface Message {
  id: string;
  text: string;
  translatedText?: string;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "medical";
  symptoms?: string[];
  category?: string;
  is_emergency?: boolean;
  emergency_facility?: any;
  pending_memory?: PendingMemory | null;
  actions?: string[];
  memory_confirmed?: boolean;
  memory_dismissed?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  summary?: string;
  tags?: string;
  created_at?: string;
  message_count?: number;
}

const DEMO_QUICK_PILLS = [
  { label: "Medicals Near Me", query: "medicals near me" },
  { label: "Hospitals Near Me", query: "government hospitals near me" },
  { label: "Medicine Reminder", query: "Set a reminder in 2 minutes to take my medicine" },
  { label: "Log Nebulisation", query: "I recently have nebulisation a budesel cuz i was having cold and fever" },
  { label: "Recall Nebulisation", query: "When did I take my last nebulisation and why?" },
  { label: "Add Prescription to Vault", query: "I was prescribed Paracetamol 650mg and Amoxicillin 500mg three times daily" },
  { label: "Cross-Allergy Check", query: "I have a bad sore throat and fever. Can I take Amoxicillin?" },
  { label: "Add New Allergy", query: "Please remember that I am allergic to ibuprofen" },
  { label: "MJPJAY Scheme Details", query: "What benefits does Mahatma Jyotirao Phule Jan Arogya Yojana offer in Maharashtra?" },
  { label: "Emergency SOS Assistance", query: "My grandfather has severe chest pain and cannot breathe!" }
];

const Chat: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { scheduleReminder, activeReminders, cancelReminder } = useNotifications();
  const { createVaultRecord } = useHealthData();
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Live Location & Verified District state (defaults to verified user profile district: Mumbai)
  const [activeDistrict, setActiveDistrict] = useState<string>("Mumbai");
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleFetchGeolocation = (onSuccess?: (coords: { lat: number; lon: number }) => void) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. Please select your city.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords = { lat, lon };
        setUserCoords(coords);

        // Check if coordinates reflect a northern ISP gateway while user is in Mumbai
        const isNearDelhi = lat > 27.5 && lat < 29.5 && lon > 76.5 && lon < 78.5;
        if (isNearDelhi && activeDistrict === "Mumbai") {
          toast.info("Browser IP coordinates reflect Delhi ISP routing. Keeping verified city as Mumbai.");
        } else {
          toast.success(`Coordinates detected (${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)})`);
        }

        if (onSuccess) {
          onSuccess(coords);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        toast.error("Could not access GPS location. Please select your city.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (city: string) => {
    setActiveDistrict(city);
    setUserCoords(null); // Clear any ISP-inaccurate GPS coordinates
    toast.success(`Active city set to ${city}`);
  };
  
  // Quick prescription / KB to vault modal state
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [rxTitle, setRxTitle] = useState("");
  const [rxMedications, setRxMedications] = useState("");
  const [rxDoctor, setRxDoctor] = useState("");
  const [savedMessageIds, setSavedMessageIds] = useState<Record<string, boolean>>({});

  // Sessions and History state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sessionSearch, setSessionSearch] = useState("");

  const effectiveUserId = user?.id || "guest_patient";

  // Voice hook
  const { isListening, isTranscribing, transcript, startListening, speak, stopSpeaking, setTranscript } = useVoice(
    language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : language === 'or' ? 'or-IN' : 'en-IN'
  );

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);
  
  const getWelcomeGreeting = useCallback(() => {
    const baseWelcome = t("chat.welcome") || "Namaste! I am SevaSetu Health Assistant.";
    if (!user?.name) {
      return `${baseWelcome} How can I assist your health today?`;
    }
    const bg = user.profile?.blood_group ? `Blood Group: **${user.profile.blood_group}**` : "";
    const validAllergies = (user.profile?.allergies || []).filter(a => a && a.toLowerCase() !== "none");
    const allergyStr = validAllergies.length > 0 ? `Confirmed Allergies: **${validAllergies.join(", ")}**` : "No known drug allergies";
    const profileDetails = [bg, allergyStr].filter(Boolean).join(", ");
    return `${baseWelcome} Welcome back, **${user.name}**! Your verified health identity is active (${profileDetails}). How can I assist your health today?`;
  }, [user, t]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: getWelcomeGreeting(),
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Sessions List
  const loadSessions = async (targetSessionId?: string) => {
    try {
      const res = await chatService.getChatSessions(effectiveUserId);
      if (res?.sessions && res.sessions.length > 0) {
        setSessions(res.sessions);
        
        // Auto-select session: targetSessionId, current activeSessionId, or first session
        const sessionToSelect = targetSessionId || activeSessionId || res.sessions[0].id;
        setActiveSessionId(sessionToSelect);
        loadSessionDialogue(sessionToSelect);
      } else {
        setSessions([]);
        setActiveSessionId(null);
        setMessages([
          {
            id: "welcome-init",
            text: getWelcomeGreeting(),
            isUser: false,
            timestamp: new Date(),
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
      setSessions([]);
    }
  };

  // Load messages for a specific session
  const loadSessionDialogue = async (sessionId: string) => {
    try {
      setIsLoadingHistory(true);
      const res = await chatService.getSessionMessages(sessionId);
      if (res?.messages && res.messages.length > 0) {
        const formatted: Message[] = [];
        for (const item of res.messages) {
          const time = item.created_at ? new Date(item.created_at) : new Date();
          formatted.push({
            id: `${item.id}-u`,
            text: item.message,
            isUser: true,
            timestamp: time
          });
          formatted.push({
            id: `${item.id}-a`,
            text: item.response,
            isUser: false,
            timestamp: time
          });
        }
        setMessages(formatted);
      } else {
        // If empty session
        setMessages([
          {
            id: `welcome-new-${sessionId}`,
            text: (t("chat.welcome") || "Namaste! I am SevaSetu Health Assistant.") + " How can I assist your health in this consultation?",
            isUser: false,
            timestamp: new Date(),
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initial load: fetch sessions when active user changes
  useEffect(() => {
    setSessions([]);
    setActiveSessionId(null);
    loadSessions();
  }, [effectiveUserId]);

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadSessionDialogue(sessionId);
    // On small screens, collapse drawer after selecting
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([
      {
        id: "welcome-fresh",
        text: getWelcomeGreeting(),
        isUser: false,
        timestamp: new Date(),
      }
    ]);
    toast.success("Started a new health consultation.");
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Consultation deleted.");
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      toast.error("Could not delete consultation.");
    }
  };

  const handleClearChat = async () => {
    try {
      await chatService.clearChatHistory(effectiveUserId);
      setMessages([
        {
          id: "welcome-reset",
          text: (t("chat.welcome") || "Namaste! I am SevaSetu Health Assistant.") + " Chat history cleared. How can I assist your health today?",
          isUser: false,
          timestamp: new Date(),
        }
      ]);
      loadSessions();
      toast.success("Chat history cleared.");
    } catch (err) {
      toast.error("Failed to clear chat history.");
    }
  };

  // Sync transcript and AUTO-SEND if voice recognition ends
  useEffect(() => {
    if (transcript && !isListening) {
      setMessage(transcript);
      setIsVoiceMode(true);
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    document.title = "Chat with SevaSetu AI | Digital Health Assistant";
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (
    textOverride?: string,
    locationDataOverride?: { lat?: number; lon?: number; district?: string }
  ) => {
    const textToSend = textOverride || message;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setTranscript(""); 
    setIsLoading(true);

    try {
      let locData = locationDataOverride;
      if (!locData) {
        if (userCoords) {
          locData = { lat: userCoords.lat, lon: userCoords.lon };
        } else if (activeDistrict) {
          locData = { district: activeDistrict };
        }
      }

      const response = await chatService.sendMessage(
        textToSend, 
        effectiveUserId, 
        language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'Odia',
        activeSessionId || undefined,
        locData
      );
      
      const aiText = response.response || response.answer || response.text || "I understand. How else can I help?";
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date(),
        category: response.category || "HEALTH_QUERY",
        is_emergency: response.is_emergency || false,
        emergency_facility: response.emergency_facility || null,
        pending_memory: response.pending_memory || null,
        actions: response.actions || []
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Handle Scheduled Health Reminder
      if (response.scheduled_reminder) {
        scheduleReminder(response.scheduled_reminder, (triggeredRem) => {
          const alarmMsg: Message = {
            id: `alarm-ring-${Date.now()}`,
            text: `**HEALTH ALERT / REMINDER RINGING** (Audio Chime Played)\n\n**${triggeredRem.title}**\n\n> ${triggeredRem.message}\n\n*This reminder has also been logged in your **Stay Informed (Priority Alerts)** panel.*`,
            isUser: false,
            timestamp: new Date(),
            category: "HEALTH_REMINDER",
            is_emergency: false
          };
          setMessages(prev => [...prev, alarmMsg]);
          if (isVoiceMode) {
            speak(`Attention: It is time for your scheduled health alert.`);
          }
        });
      }

      // If backend created/assigned an episode_id, sync active session
      if (response.episode_id && response.episode_id !== activeSessionId) {
        setActiveSessionId(response.episode_id);
        loadSessions(response.episode_id);
      } else {
        loadSessions();
      }

      // AUTO-SPEAK if user sent via voice
      if (isVoiceMode) {
        speak(aiText);
      }
    } catch (err) {
      toast.error("AI service temporarily unavailable. Please verify backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMemory = async (pendingMemory: PendingMemory, messageId: string) => {
    try {
      const userId = user?.id || "guest_patient";
      await profileService.confirmMemory(userId, {
        memory_type: pendingMemory.memory_type,
        key: pendingMemory.key,
        value: pendingMemory.value,
        source_context: pendingMemory.source_context || ""
      });

      // Automatically persist to Health Vault so it appears under Prescriptions / Records!
      const category =
        pendingMemory.memory_type === "prescription" || pendingMemory.memory_type === "treatment"
          ? "prescription"
          : "lab";

      await createVaultRecord({
        title: pendingMemory.display_name,
        category,
        facility: "Consultation via Seva AI",
        summary: pendingMemory.value,
        biomarkers: pendingMemory.key
      });

      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, memory_confirmed: true } : m
      ));
      toast.success(`✓ ${pendingMemory.display_name} saved to Profile & Health Vault!`);
    } catch (err) {
      toast.error("Failed to save memory.");
    }
  };

  const handleSaveMessageToVault = async (msg: Message) => {
    try {
      const cleanSummary = msg.text.replace(/[#*`_]/g, "").trim();
      const firstLine = cleanSummary.split("\n")[0].slice(0, 45) || "Consultation Clinical Note";
      const isRx =
        msg.text.toLowerCase().includes("prescrib") ||
        msg.text.toLowerCase().includes("dose") ||
        msg.text.toLowerCase().includes("mg") ||
        msg.text.toLowerCase().includes("tablet") ||
        msg.text.toLowerCase().includes("medicine");

      await createVaultRecord({
        title: isRx ? `Prescription: ${firstLine}` : `Clinical Note: ${firstLine}`,
        category: isRx ? "prescription" : "lab",
        facility: "Consultation via Seva AI",
        summary: msg.text.slice(0, 500),
        biomarkers: isRx ? "Prescription from Chat" : "Consultation Note"
      });

      setSavedMessageIds((prev) => ({ ...prev, [msg.id]: true }));
      toast.success("Saved to Health Vault!", {
        description: "Viewable in Health Vault under Prescriptions / Records."
      });
    } catch (e) {
      toast.error("Could not save to Health Vault.");
    }
  };

  const handleSaveQuickPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxTitle.trim() || !rxMedications.trim()) {
      toast.error("Please provide prescription title and medications.");
      return;
    }
    try {
      await createVaultRecord({
        title: rxTitle.trim(),
        category: "prescription",
        facility: rxDoctor.trim() || "Consultation via Seva AI",
        summary: rxMedications.trim(),
        biomarkers: "Prescription / Knowledge Base Record"
      });
      toast.success(`Prescription "${rxTitle}" saved to your Health Vault!`);
      setIsPrescriptionModalOpen(false);
      setRxTitle("");
      setRxMedications("");
      setRxDoctor("");
    } catch (err) {
      toast.error("Failed to save prescription to Health Vault.");
    }
  };

  const handleDismissMemory = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, memory_dismissed: true } : m
    ));
    toast.info("Medical candidate fact dismissed.");
  };

  const handleTranslateMessage = async (msgId: string, text: string) => {
    try {
      const { translated_text } = await translationService.translate(text, "English");
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, translatedText: translated_text } : m
      ));
      toast.success("Translated to English");
    } catch (err) {
      toast.error("Translation failed");
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(sessionSearch.toLowerCase()) || 
    (s.summary && s.summary.toLowerCase().includes(sessionSearch.toLowerCase())) ||
    (s.tags && s.tags.toLowerCase().includes(sessionSearch.toLowerCase()))
  );

  const activeSessionObj = sessions.find(s => s.id === activeSessionId);

  // Group sessions into Today, Past 7 Days, and Earlier (like ChatGPT/Claude)
  const groupSessions = (list: ChatSession[]) => {
    const today: ChatSession[] = [];
    const past7Days: ChatSession[] = [];
    const earlier: ChatSession[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - (7 * 24 * 60 * 60 * 1000);

    for (const item of list) {
      if (!item.created_at) {
        earlier.push(item);
        continue;
      }
      const itemTime = new Date(item.created_at).getTime();
      if (itemTime >= startOfToday) {
        today.push(item);
      } else if (itemTime >= sevenDaysAgo) {
        past7Days.push(item);
      } else {
        earlier.push(item);
      }
    }
    return { today, past7Days, earlier };
  };

  const grouped = groupSessions(filteredSessions);

  const renderSessionCard = (session: ChatSession) => {
    const isActive = activeSessionId === session.id;
    const createdDate = session.created_at ? new Date(session.created_at) : null;
    const dateStr = createdDate 
      ? createdDate.toLocaleDateString([], { month: "short", day: "numeric" })
      : "";

    return (
      <div
        key={session.id}
        onClick={() => handleSelectSession(session.id)}
        className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
          isActive 
            ? "bg-blue-50/95 border-blue-300 text-blue-900 shadow-xs ring-1 ring-blue-400/20" 
            : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
            }`}>
              <MessageSquare className="w-3 h-3" />
            </div>
            <h3 className={`text-xs truncate leading-snug ${isActive ? "font-black text-blue-950" : "font-bold text-slate-800"}`}>
              {session.title}
            </h3>
          </div>

          <button
            onClick={(e) => handleDeleteSession(session.id, e)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded-md transition-all shrink-0 hover:bg-red-50"
            title="Delete consultation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {session.summary && (
          <p className="text-[11px] text-slate-500 line-clamp-1 pl-8 leading-relaxed">
            {session.summary}
          </p>
        )}

        <div className="flex items-center justify-between pl-8 pt-0.5 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            {session.tags && (
              <span className="truncate text-slate-400">
                {session.tags.split(",")[0]}
              </span>
            )}
            {dateStr && <span>• {dateStr}</span>}
          </div>

          {session.message_count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-md font-black text-[9px] ${
              isActive ? "bg-blue-200/80 text-blue-800" : "bg-slate-100 text-slate-500"
            }`}>
              {session.message_count} {session.message_count === 1 ? "msg" : "msgs"}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex h-full min-h-0 bg-[#F8FAFC] overflow-hidden relative">
      {/* ========================================================================= */}
      {/* 📁 LEFT CHAT HISTORY SIDEBAR / DRAWER (ChatGPT / Claude UX)                */}
      {/* ========================================================================= */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[250] w-76 md:w-80 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none md:static md:z-auto shrink-0 h-full
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-ml-80"}
        `}
      >
        {/* Sidebar Header & New Chat Button */}
        <div className="p-3.5 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Previous Chats</h2>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                {sessions.length}
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Health Consultation</span>
          </button>

          {/* Search past consultations */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search previous chats..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Previous Consultation Sessions Categorized List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 CustomScrollbar min-h-0">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 text-xs font-medium space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p>No previous consultations found.</p>
              <button 
                onClick={handleNewChat}
                className="text-blue-600 font-bold hover:underline text-xs"
              >
                Start a new consultation →
              </button>
            </div>
          ) : (
            <>
              {/* TODAY */}
              {grouped.today.length > 0 && (
                <div className="space-y-1.5">
                  <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Today
                  </p>
                  {grouped.today.map(renderSessionCard)}
                </div>
              )}

              {/* PREVIOUS 7 DAYS */}
              {grouped.past7Days.length > 0 && (
                <div className="space-y-1.5">
                  <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Previous 7 Days
                  </p>
                  {grouped.past7Days.map(renderSessionCard)}
                </div>
              )}

              {/* EARLIER */}
              {grouped.earlier.length > 0 && (
                <div className="space-y-1.5">
                  <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Earlier Consultations
                  </p>
                  {grouped.earlier.map(renderSessionCard)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-center shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ABDM &amp; Supabase Longitudinal DB
          </p>
        </div>
      </aside>

      {/* Mobile Backdrop when drawer is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[240] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 💬 MAIN CHAT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
        {/* Top Header Bar with Sidebar Toggle and Active Session Title */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200/80 bg-white flex items-center gap-1.5 shadow-2xs"
              title={isSidebarOpen ? "Hide Chat History" : "Show Previous Chats"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 text-blue-600" /> : <PanelLeft className="w-4 h-4 text-slate-600" />}
              <span className="text-xs font-bold text-slate-700 hidden lg:inline">
                {isSidebarOpen ? "Collapse" : "Previous Chats"}
              </span>
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs md:text-sm font-black text-slate-900 truncate">
                    {activeSessionObj ? activeSessionObj.title : "New Health Consultation"}
                  </h2>
                  {activeSessionObj && (
                    <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200/60 shrink-0">
                      Saved Session
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate hidden sm:block">
                  Verified Identity Synchronized: {user?.name || "Patient"} ({user?.profile?.blood_group || "ABHA Profile"}{user?.profile?.allergies?.length ? `, ${user.profile.allergies.join(", ")}` : ""}) • Longitudinal Database Active
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Consultation</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 CustomScrollbar min-h-0" id="chat-messages">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Active Consultation Meta Card (Shows when viewing a saved previous chat) */}
            {activeSessionObj && (
              <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Previous Consultation Session</span>
                      {activeSessionObj.created_at && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          • {new Date(activeSessionObj.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug truncate">
                      {activeSessionObj.title}
                    </h3>
                    {activeSessionObj.summary && (
                      <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-2">
                        {activeSessionObj.summary}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[10px] font-black bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg shadow-2xs">
                    {messages.length} Messages in Thread
                  </span>
                </div>
              </div>
            )}

            {isLoadingHistory && (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-white/80 border border-slate-200/70 rounded-2xl text-xs font-bold text-slate-500 shadow-sm animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Loading consultation dialogue from Supabase...</span>
              </div>
            )}

            {/* Active Scheduled Reminder Countdown Banner */}
            {activeReminders.map(rem => (
              <div key={rem.id} className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <p className="text-xs font-black text-amber-900 uppercase tracking-wider">{rem.title}</p>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full text-[10px] font-black">
                        ACTIVE TIMER
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 font-semibold mt-0.5">
                      {rem.message} • Due at <strong>{rem.dueTimeStr}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => cancelReminder(rem.id)}
                    className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Reminder</span>
                  </button>
                </div>
              </div>
            ))}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 group ${msg.isUser ? "flex-row-reverse" : "items-start"}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all shadow-sm ${
                  msg.isUser 
                    ? "bg-white border border-slate-200 text-slate-400" 
                    : msg.is_emergency 
                      ? "bg-red-600 text-white shadow-red-200 animate-pulse" 
                      : "bg-blue-600 text-white shadow-blue-100"
                }`}>
                  {msg.isUser ? <User className="w-5 h-5" /> : msg.is_emergency ? <AlertTriangle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
                  
                  {/* Intent Firewall Indicator */}
                  {!msg.isUser && msg.category === "OUT_OF_DOMAIN" && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 bg-amber-50 text-amber-900 border border-amber-300/80 rounded-full text-[11px] font-bold shadow-sm">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>SevaSetu Medical Intent Firewall • 0 LLM Tokens Spent (&lt;15ms)</span>
                    </div>
                  )}

                  {/* Emergency Indicator */}
                  {!msg.isUser && msg.is_emergency && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 bg-red-100 text-red-900 border border-red-400 rounded-full text-[11px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Critical Emergency Protocol Override</span>
                    </div>
                  )}

                  <div className={`p-4 md:p-5 rounded-[24px] shadow-sm relative overflow-hidden ${
                    msg.isUser 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" 
                      : msg.is_emergency
                        ? "bg-red-50/90 text-slate-800 rounded-tl-none border-2 border-red-400 shadow-md"
                        : "bg-white text-slate-700 rounded-tl-none border border-slate-200/60"
                  }`}>
                    {!msg.isUser && !msg.is_emergency && (
                      <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
                        <Sparkles className="w-16 h-16 text-blue-600 rotate-12" />
                      </div>
                    )}
                    
                    <div className={`text-sm md:text-[15px] font-semibold leading-normal prose prose-sm max-w-none prose-p:m-0 prose-ul:m-0 prose-li:m-0 prose-headings:m-0 prose-p:leading-normal ${
                      msg.isUser ? "prose-invert" : "prose-slate"
                    }`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                      
                      {msg.translatedText && (
                        <div className="mt-4 pt-4 border-t border-slate-100 opacity-90 animate-in fade-in slide-in-from-top-1 prose prose-sm max-w-none prose-p:m-0 prose-ul:m-0 prose-li:m-0 prose-headings:m-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">English Translation</p>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.translatedText}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* EMERGENCY SOS QUICK ACTION HUB */}
                    {!msg.isUser && msg.is_emergency && (
                      <div className="mt-4 pt-4 border-t border-red-200 space-y-3">
                        <p className="text-xs font-black text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                          <HeartPulse className="w-4 h-4 text-red-600" />
                          Immediate Emergency Dispatch:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <a 
                            href="tel:108" 
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>Call 108 Ambulance (Free)</span>
                          </a>
                          <a 
                            href="tel:104" 
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 text-red-700 border-2 border-red-300 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call 104 Health Helpdesk</span>
                          </a>
                        </div>
                        <div className="p-2.5 bg-red-100/70 rounded-xl border border-red-200 text-xs text-red-900 flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            {msg.emergency_facility ? (
                              <>
                                <strong>Nearest Verified Emergency Center:</strong> {msg.emergency_facility.name} ({msg.emergency_facility.district || msg.emergency_facility.state}). Emergency Line: <strong>{msg.emergency_facility.contact || "108"}</strong>
                              </>
                            ) : (
                              <>
                                <strong>National Emergency Protocol:</strong> Call <strong>108</strong> for priority ambulance dispatch to your nearest District Trauma Center.
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE HEALTH MEMORY CONFIRMATION CARD */}
                    {!msg.isUser && msg.pending_memory && !msg.memory_dismissed && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {msg.memory_confirmed ? (
                          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Verified: {msg.pending_memory.display_name} has been added to your permanent health identity.</span>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300/80 rounded-2xl shadow-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-emerald-900 text-xs font-black uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Clinical Fact Extracted</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                Requires Your Confirmation
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium">
                              {msg.pending_memory.prompt}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleConfirmMemory(msg.pending_memory!, msg.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Confirm & Add to Profile
                              </button>
                              <button
                                onClick={() => handleDismissMemory(msg.id)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                Don't Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INTERACTIVE LOCATION SELECTION / GPS CARD */}
                    {!msg.isUser && (msg.category === "LOCATION_REQUEST" || msg.actions?.includes("SHARE_LOCATION")) && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
                        <div className="p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/80 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-900 text-xs font-black uppercase tracking-wider">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>Location Verification Required</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                              City or GPS Selection
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium">
                            Select your city or share live GPS coordinates to locate verified Jan Aushadhi Kendras and National Hospitals in your area:
                          </p>

                          {/* Quick City Chips - Mumbai First */}
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Choose your city:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {["Mumbai", "Pune", "Thane", "Delhi", "Bengaluru", "Nagpur", "Nashik", "Kolkata"].map((city) => (
                                <button
                                  key={city}
                                  onClick={() => {
                                    handleSelectCity(city);
                                    handleSendMessage(`I am currently in ${city}`, { district: city });
                                  }}
                                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-all active:scale-95 shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                                    activeDistrict === city && !userCoords
                                      ? "bg-blue-600 border-blue-600 text-white"
                                      : "bg-white hover:bg-blue-50 hover:border-blue-300 border-slate-200 text-slate-700 hover:text-blue-700"
                                  }`}
                                >
                                  <MapPin className={`w-3 h-3 ${activeDistrict === city && !userCoords ? "text-white" : "text-slate-400"}`} />
                                  <span>{city}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Primary GPS Button */}
                          <div className="pt-1">
                            <button
                              onClick={() => {
                                handleFetchGeolocation((coords) => {
                                  handleSendMessage(
                                    `My current GPS location is ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`,
                                    { lat: coords.lat, lon: coords.lon }
                                  );
                                });
                              }}
                              disabled={isLocating}
                              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                              {isLocating ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Detecting GPS Coordinates...</span>
                                </>
                              ) : (
                                <>
                                  <Navigation className="w-4 h-4 text-slate-300" />
                                  <span>Share Current Location (Auto-Detect GPS)</span>
                                </>
                              )}
                            </button>
                            <p className="text-[11px] text-slate-400 italic pt-1.5">
                              *Note: Desktop browser location uses internet provider routing centers (which may show Delhi). If you are in Mumbai, simply click Mumbai above to lock your city.*
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     {!msg.isUser && (
                      <>
                        <button 
                          onClick={() => speak(msg.translatedText || msg.text)}
                          className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Listen
                        </button>
                        <button 
                          onClick={() => handleTranslateMessage(msg.id, msg.text)}
                          className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 px-2 py-1 rounded-lg transition-all"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          Translate
                        </button>
                        <button 
                          onClick={() => handleSaveMessageToVault(msg)}
                          disabled={savedMessageIds[msg.id]}
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${
                            savedMessageIds[msg.id]
                              ? "text-emerald-600 bg-emerald-50 cursor-default"
                              : "text-amber-600 hover:bg-amber-50"
                          }`}
                          title="Save this advice / prescription note to your Health Vault"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          {savedMessageIds[msg.id] ? "Saved in Vault" : "Save to Vault"}
                        </button>
                      </>
                    )}
                    {msg.isUser && (
                      <button 
                        onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                        className="text-slate-300 hover:text-red-400 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-100">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200/60 p-4 rounded-[24px] rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest italic tracking-tighter">Analyzing verified health identity & clinical knowledge...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Bar with Quick Clinical Action Pills */}
        <div className="px-4 pt-3 pb-3 md:pb-3 bg-white/95 backdrop-blur-md border-t border-slate-200/60 shadow-lg shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Quick Consultation Showcase Pills */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar flex-1 mr-4 py-1">
                {DEMO_QUICK_PILLS.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      stopSpeaking();
                      handleSendMessage(item.query);
                    }}
                    className="whitespace-nowrap px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    {item.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-xs font-bold active:scale-95 shadow-sm"
                  title="Add a prescription or clinical record directly to your Health Vault"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Add Rx to Vault</span>
                </button>

                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all text-xs font-bold active:scale-95 shadow-sm"
                  title="Clear all chat history"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>

                <button 
                  onClick={() => {
                    if (isVoiceMode) {
                      stopSpeaking();
                    }
                    setIsVoiceMode(!isVoiceMode);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                    isVoiceMode 
                      ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                  title="Toggle Auto-Speak"
                >
                  {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Voice Mode</span>
                </button>
              </div>
            </div>

            {(userCoords || activeDistrict) && (
              <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 animate-in fade-in">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Active Location: <strong className="text-slate-900">{activeDistrict}</strong>
                    {userCoords ? ` (GPS: ${userCoords.lat.toFixed(2)}, ${userCoords.lon.toFixed(2)})` : ""}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleSelectCity("Mumbai")}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeDistrict === "Mumbai" && !userCoords 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Mumbai
                  </button>
                  {userCoords && (
                    <button 
                      onClick={() => setUserCoords(null)}
                      className="text-slate-500 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider ml-1 cursor-pointer"
                    >
                      Clear GPS
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-end gap-3 bg-white p-2 rounded-[28px] shadow-2xl shadow-slate-200 border border-slate-200 focus-within:border-blue-500/50 transition-all group overflow-hidden">
              <button 
                onClick={() => {
                  stopSpeaking();
                  startListening();
                }}
                disabled={isTranscribing}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-inner ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse ring-4 ring-red-100 shadow-red-200" 
                    : isTranscribing
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                }`}
                title={isListening ? "Tap to finish speaking" : "Tap to speak (Groq Whisper AI)"}
              >
                {isTranscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
                )}
              </button>

              <button 
                onClick={() => {
                  stopSpeaking();
                  handleFetchGeolocation((coords) => {
                    handleSendMessage("Medicals and healthcare facilities near my current GPS location", { lat: coords.lat, lon: coords.lon });
                  });
                }}
                disabled={isLocating}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-inner ${
                  userCoords 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                    : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                }`}
                title={userCoords ? `GPS Active (${userCoords.lat.toFixed(2)}, ${userCoords.lon.toFixed(2)}) - Click to search nearby` : "Auto-detect current GPS location"}
              >
                {isLocating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <MapPin className={`w-5 h-5 ${userCoords ? 'text-emerald-600' : ''}`} />
                )}
              </button>
              
              <textarea 
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-semibold py-3 resize-none h-12 max-h-32 text-slate-700 placeholder:text-slate-400 outline-none" 
                placeholder={
                  isListening 
                    ? "Listening... Tap mic when finished" 
                    : isTranscribing 
                      ? "Transcribing with Groq Whisper AI..." 
                      : t("ui.type.question")
                }
                value={message}
                onFocus={() => stopSpeaking()}
                onChange={(e) => {
                  stopSpeaking();
                  setMessage(e.target.value);
                }}
                onKeyDown={(e) => {
                  stopSpeaking();
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
              />
              
              <button 
                onClick={() => handleSendMessage()}
                disabled={!message.trim() || isLoading}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                  message.trim() && !isLoading 
                    ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700" 
                    : "bg-slate-100 text-slate-300 pointer-events-none"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
              SevaSetu AI • Integrated with Supabase Health Memory & Qdrant Cloud Knowledge Base
            </p>
          </div>
        </div>
      </main>

      {/* Quick Add Prescription / Knowledge Base Record to Vault Modal */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add to Health Vault</h3>
                  <p className="text-xs text-slate-500 font-medium">Record prescription or clinical fact into database</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Prescription / Document Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Verma Consultation - Bronchitis Rx"
                  value={rxTitle}
                  onChange={(e) => setRxTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Prescribing Doctor or Clinic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Clinic, Mumbai"
                  value={rxDoctor}
                  onChange={(e) => setRxDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Medications & Instructions *
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Budesonide Respules 0.5mg nebulisation BD x 5 days, Paracetamol 650mg SOS after meals..."
                  value={rxMedications}
                  onChange={(e) => setRxMedications(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPrescriptionModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Save to Health Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .CustomScrollbar::-webkit-scrollbar { width: 4px; }
        .CustomScrollbar::-webkit-scrollbar-track { background: transparent; }
        .CustomScrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .CustomScrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default Chat;