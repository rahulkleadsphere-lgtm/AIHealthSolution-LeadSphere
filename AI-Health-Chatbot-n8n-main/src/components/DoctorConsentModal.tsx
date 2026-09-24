import React, { useState } from "react";
import {
  ShieldCheck,
  QrCode,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  X,
  Lock,
  Calendar,
  Building2,
  Stethoscope,
  Share2,
  FileText
} from "lucide-react";
import { abhaService } from "../services/api";
import { MedicalDocument } from "../contexts/HealthDataContext";
import { toast } from "sonner";

interface DoctorConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: MedicalDocument[];
  userName?: string;
  userAbha?: string;
}

export const DoctorConsentModal: React.FC<DoctorConsentModalProps> = ({
  isOpen,
  onClose,
  documents,
  userName = "Rahul Sharma",
  userAbha = "91-8273-4920-1124"
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(() =>
    documents.slice(0, 3).map((d) => d.id)
  );
  const [durationHours, setDurationHours] = useState<number>(2);
  const [doctorName, setDoctorName] = useState<string>("Dr. S. K. Mehta (KEM Hospital)");
  const [purpose, setPurpose] = useState<string>("Cardiovascular Consultation & Diagnosis");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedConsent, setGeneratedConsent] = useState<any>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleCreateConsent = async () => {
    if (selectedDocIds.length === 0) {
      toast.error("Please select at least 1 document to share.");
      return;
    }
    setIsLoading(true);
    try {
      const selectedTitles = documents
        .filter((d) => selectedDocIds.includes(d.id))
        .map((d) => d.title);

      const res = await abhaService.createDoctorConsent({
        user_id: "rahul_mumbai_demo",
        document_ids: selectedDocIds,
        document_titles: selectedTitles,
        duration_hours: durationHours,
        purpose,
        doctor_name: doctorName
      });

      setGeneratedConsent(res);
      toast.success("Temporary ABDM Doctor Consent Pass Generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate consent pass.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    toast.success(`Copied PIN ${pin} to clipboard!`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                <Share2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ABDM Consent Manager
                </span>
                <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                  Share Records with Doctor / Clinic
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {!generatedConsent ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Patient-Controlled Cryptographic Authorization</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Under ABDM guidelines, the doctor can only view the specific records you select, and access automatically expires after your chosen time limit.
                  </p>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Consulting Physician / Healthcare Facility
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. S. K. Mehta (KEM Hospital)"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pl-9"
                    />
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Clinical Purpose of Share
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Cardiology OPD Consultation"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Validity Window Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Authorization Validity Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "2 Hours", hours: 2, sub: "OPD Visit" },
                    { label: "24 Hours", hours: 24, sub: "Day Care" },
                    { label: "7 Days", hours: 168, sub: "Investigation" }
                  ].map((v) => (
                    <button
                      key={v.hours}
                      type="button"
                      onClick={() => setDurationHours(v.hours)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        durationHours === v.hours
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-500/20"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs">{v.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{v.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Records Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Select Records to Grant Access ({selectedDocIds.length} of {documents.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDocIds(
                        selectedDocIds.length === documents.length
                          ? []
                          : documents.map((d) => d.id)
                      )
                    }
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    {selectedDocIds.length === documents.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                  {documents.length === 0 ? (
                    <p className="text-xs text-slate-400 p-2 text-center">No documents in vault yet.</p>
                  ) : (
                    documents.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleDoc(doc.id)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-white border-emerald-400 shadow-xs text-emerald-950"
                              : "bg-white/80 border-slate-200 text-slate-600 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold truncate">{doc.title}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                            {doc.date}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateConsent}
                disabled={isLoading || selectedDocIds.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue ABDM Consent Pass</span>
              </button>
            </div>
          ) : (
            /* SUCCESS VIEW */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                  Doctor Consent Pass Active
                </h3>
                <p className="text-xs text-emerald-800">
                  Valid for <strong>{generatedConsent.validity_label}</strong>. Direct your doctor to scan or enter the PIN below.
                </p>
              </div>

              {/* PIN Box */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-700 text-center space-y-3 shadow-xl">
                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                  Doctor Verification Passcode
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-3xl font-black tracking-widest text-emerald-400">
                    {generatedConsent.pass_code}
                  </span>
                  <button
                    onClick={() => handleCopyPin(generatedConsent.pass_code)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="w-24 h-24 bg-white p-2 rounded-2xl mx-auto shadow-inner flex items-center justify-center mt-2">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex justify-between">
                  <span>Authorized: <strong>{generatedConsent.shared_documents_count} Records</strong></span>
                  <span>Recipient: <strong>{generatedConsent.doctor_name}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGeneratedConsent(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 transition-all"
                >
                  Create Another Pass
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
