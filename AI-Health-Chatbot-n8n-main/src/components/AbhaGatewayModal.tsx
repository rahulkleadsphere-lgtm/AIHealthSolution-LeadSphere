import React, { useState } from "react";
import {
  ShieldCheck,
  QrCode,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  X,
  Sparkles,
  Smartphone,
  CreditCard,
  Building2,
  RefreshCw,
  Lock,
  ArrowRight
} from "lucide-react";
import { abhaService } from "../services/api";
import { toast } from "sonner";

interface AbhaGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAbhaId?: string;
  userName?: string;
  userDistrict?: string;
  onSuccess: (updatedAbha: { abha_number: string; abha_address: string; is_verified: boolean }) => void;
}

export const AbhaGatewayModal: React.FC<AbhaGatewayModalProps> = ({
  isOpen,
  onClose,
  currentAbhaId = "91-8273-4920-1124",
  userName = "Rahul Sharma",
  userDistrict = "Mumbai",
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<"create" | "verify">("create");

  // Creation State
  const [idType, setIdType] = useState<"aadhaar" | "mobile">("aadhaar");
  const [identityInput, setIdentityInput] = useState("");
  const [preferredAddress, setPreferredAddress] = useState("");
  const [createStep, setCreateStep] = useState<"input" | "otp" | "success">("input");
  const [createTxnId, setCreateTxnId] = useState("");
  const [createOtp, setCreateOtp] = useState("123456");
  const [maskedTarget, setMaskedTarget] = useState("");
  const [createdResult, setCreatedResult] = useState<any>(null);

  // Verification State
  const [verifyInput, setVerifyInput] = useState(currentAbhaId);
  const [verifyStep, setVerifyStep] = useState<"input" | "otp" | "success">("input");
  const [verifyTxnId, setVerifyTxnId] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("123456");
  const [verifyMaskedPhone, setVerifyMaskedPhone] = useState("");
  const [verifiedResult, setVerifiedResult] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- CREATION HANDLERS ---
  const handleGenerateCreationOtp = async () => {
    if (!identityInput.trim()) {
      toast.error(`Please enter your 12-digit Aadhaar or 10-digit mobile number.`);
      return;
    }
    setIsLoading(true);
    try {
      const res = await abhaService.generateCreationOtp(idType, identityInput);
      setCreateTxnId(res.txn_id);
      setMaskedTarget(res.masked_target);
      setCreateStep("otp");
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger OTP handshake");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!createOtp.trim()) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await abhaService.verifyAndCreateAbha({
        txn_id: createTxnId,
        otp: createOtp,
        preferred_abha_address: preferredAddress || undefined,
        user_id: "rahul_mumbai_demo"
      });
      setCreatedResult(res.abha);
      setCreateStep("success");
      onSuccess({
        abha_number: res.abha.abha_number,
        abha_address: res.abha.abha_address,
        is_verified: true
      });
      toast.success("Sovereign ABHA Card Generated Successfully!");
    } catch (e: any) {
      toast.error(e.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- VERIFICATION HANDLERS ---
  const handleInitiateVerify = async () => {
    if (!verifyInput.trim()) {
      toast.error("Please enter your 14-digit ABHA number or @abdm address.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await abhaService.initiateVerification(verifyInput, "rahul_mumbai_demo");
      setVerifyTxnId(res.txn_id);
      setVerifyMaskedPhone(res.masked_target);
      setVerifyStep("otp");
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.message || "Verification request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVerify = async () => {
    if (!verifyOtp.trim()) {
      toast.error("Please enter the 6-digit verification OTP.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await abhaService.confirmVerification(verifyTxnId, verifyOtp, "rahul_mumbai_demo");
      setVerifiedResult(res.verified_profile);
      setVerifyStep("success");
      onSuccess({
        abha_number: res.verified_profile.abha_number,
        abha_address: res.verified_profile.abha_address || "rahul.sharma@abdm",
        is_verified: true
      });
      toast.success("ABHA Identity verified with National Health Authority!");
    } catch (e: any) {
      toast.error(e.message || "OTP confirmation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ABDM M1 Sovereign Gateway
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300">
                    MoHFW • NHA
                  </span>
                </div>
                <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                  Ayushman Bharat Health Account (ABHA)
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

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-white/10 rounded-2xl mt-5 border border-white/10 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("create"); setCreateStep("input"); }}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "create"
                  ? "bg-white text-slate-900 shadow-md font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>1. Create New ABHA</span>
            </button>
            <button
              onClick={() => { setActiveTab("verify"); setVerifyStep("input"); }}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "verify"
                  ? "bg-white text-slate-900 shadow-md font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>2. Verify Existing ABHA</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {/* ========================================================= */}
          {/* TAB 1: CREATE NEW ABHA                                    */}
          {/* ========================================================= */}
          {activeTab === "create" && (
            <div className="space-y-4">
              {createStep === "input" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-xs text-blue-950">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Instant e-KYC Enrolment via NHA Protocol</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Generates your official 14-digit ABHA ID and connects with National Digital Health infrastructure.
                      </p>
                    </div>
                  </div>

                  {/* ID Type Select */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Authentication Identity Method
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => { setIdType("aadhaar"); setIdentityInput("918273645102"); }}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          idType === "aadhaar"
                            ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Aadhaar e-KYC</p>
                          <p className="text-[10px] text-slate-500">12-digit UIDAI OTP</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setIdType("mobile"); setIdentityInput("9820144521"); }}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          idType === "mobile"
                            ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Mobile OTP</p>
                          <p className="text-[10px] text-slate-500">10-digit SIM OTP</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Identity Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {idType === "aadhaar" ? "12-Digit Aadhaar Number" : "10-Digit Mobile Number"}
                    </label>
                    <input
                      type="text"
                      value={identityInput}
                      onChange={(e) => setIdentityInput(e.target.value)}
                      placeholder={idType === "aadhaar" ? "e.g. 9182 7364 5102" : "e.g. 98201 44521"}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {/* Preferred Handle */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Desired ABHA Address Handle <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex rounded-2xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                      <input
                        type="text"
                        value={preferredAddress}
                        onChange={(e) => setPreferredAddress(e.target.value)}
                        placeholder="rahul.sharma"
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none"
                      />
                      <span className="bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 border-l border-slate-200 flex items-center">
                        @abdm
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCreationOtp}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Generate ABDM Authentication OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* OTP STEP */}
              {createStep === "otp" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>OTP Dispatched to <strong>{maskedTarget}</strong></span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      Test OTP: 123456
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={createOtp}
                      onChange={(e) => setCreateOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-center tracking-[0.5em] text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <p className="text-[11px] text-slate-500 text-center mt-1.5">
                      Simulated sovereign handshake. Standard sandbox OTP is pre-filled: <strong>123456</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCreateStep("input")}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyAndCreate}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Issue Ceramic ABHA Pass</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS STEP */}
              {createStep === "success" && createdResult && (
                <div className="space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                        ABHA Sovereign ID Generated!
                      </p>
                      <p className="text-xs text-emerald-800">
                        Linked with SevaSetu Personal Health Locker.
                      </p>
                    </div>
                  </div>

                  {/* Ceramic Card Visual */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 border border-slate-700 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                          National Health Authority
                        </span>
                        <p className="text-xs font-extrabold text-white">Ayushman Bharat Health Account</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Verified e-KYC
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">ABHA Number</p>
                        <p className="text-lg font-black tracking-wider text-white font-mono">
                          {createdResult.abha_number}
                        </p>
                        <p className="text-xs font-bold text-indigo-300 mt-1">
                          {createdResult.abha_address}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white p-1.5 rounded-xl shadow-inner flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                      <span>Name: <strong>{createdResult.name}</strong></span>
                      <span>District: <strong>{createdResult.district}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(createdResult.abha_number)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>Copy ABHA ID</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all"
                    >
                      Done & Return to Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: VERIFY EXISTING ABHA                               */}
          {/* ========================================================= */}
          {activeTab === "verify" && (
            <div className="space-y-4">
              {verifyStep === "input" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
                    <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Verify Ownership via NHA Gateway</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Validates your existing 14-digit number or ABHA handle with two-factor cellular authentication.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Existing 14-Digit ABHA ID or @abdm Handle
                    </label>
                    <input
                      type="text"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      placeholder="e.g. 91-8273-4920-1124 or rahul@abdm"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <button
                    onClick={handleInitiateVerify}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Initiate Verification Handshake</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {verifyStep === "otp" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>OTP Sent to Registered Phone: <strong>{verifyMaskedPhone}</strong></span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      Test OTP: 123456
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit Cellular Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verifyOtp}
                      onChange={(e) => setVerifyOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-center tracking-[0.5em] text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setVerifyStep("input")}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmVerify}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Lock Sovereign Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {verifyStep === "success" && verifiedResult && (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                      ABDM Sovereign Identity Verified!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Confirmed match with National Health Claims Exchange (NHCX) and NHA Registry.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">ABHA Number:</span>
                      <span className="font-mono font-bold text-slate-900">{verifiedResult.abha_number}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Verified Patient:</span>
                      <span className="font-bold text-slate-900">{verifiedResult.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">District:</span>
                      <span className="font-bold text-slate-900">{verifiedResult.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Verification Badge:</span>
                      <span className="font-black text-emerald-700">{verifiedResult.badge}</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
                  >
                    Done & Return to Profile
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
