import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  PhoneCall, 
  WifiOff, 
  Languages, 
  ArrowRight, 
  X, 
  Sparkles, 
  Calendar 
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Actions" | "Schemes" | "Emergency" | "Navigation";
  icon: any;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    {
      id: "chat",
      title: "Talk to Seva AI (Live Health Consultation)",
      category: "Actions",
      icon: MessageSquare,
      action: () => { navigate("/chat"); onClose(); }
    },
    {
      id: "analysis",
      title: "Upload Medical Report (Blood Test / X-Ray / Prescription)",
      category: "Actions",
      icon: FileText,
      action: () => { navigate("/analysis"); onClose(); }
    },
    {
      id: "schemes",
      title: "Smart Scheme Eligibility Wizard (Ayushman / BSKY)",
      category: "Schemes",
      icon: ShieldCheck,
      action: () => { navigate("/schemes"); onClose(); }
    },
    {
      id: "first_aid",
      title: "100% Offline First-Aid Pocketbook (Snake Bite, Burns, CPR)",
      category: "Emergency",
      icon: WifiOff,
      action: () => { navigate("/offline-first-aid"); onClose(); }
    },
    {
      id: "call_108",
      title: "Call 108 Emergency Ambulance",
      category: "Emergency",
      icon: PhoneCall,
      action: () => { window.location.href = "tel:108"; onClose(); }
    },
    {
      id: "call_104",
      title: "Call 104 Medical Advice Helpline",
      category: "Emergency",
      icon: PhoneCall,
      action: () => { window.location.href = "tel:104"; onClose(); }
    },
    {
      id: "appointment",
      title: "Book Doctor Appointment or Hospital Visit",
      category: "Navigation",
      icon: Calendar,
      action: () => { navigate("/appointment"); onClose(); }
    },
    {
      id: "language",
      title: "Change Regional Language (English, हिन्दी, తెలుగు, ଓଡିଆ)",
      category: "Navigation",
      icon: Languages,
      action: () => { navigate("/language"); onClose(); }
    }
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search (e.g., Ayushman, snake bite, report, 108)..."
            className="w-full bg-transparent border-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No medical commands found</p>
              <p className="text-xs">Try searching for "chat", "schemes", or "emergency"</p>
            </div>
          ) : (
            filteredCommands.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between transition-all ${
                    isSelected ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? "translate-x-1 opacity-100" : "opacity-0"}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Navigate with</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↓</kbd>
            <span>Select</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↵</kbd>
          </div>
          <span>SevaSetu AI Command OS</span>
        </div>
      </div>
    </div>
  );
};
