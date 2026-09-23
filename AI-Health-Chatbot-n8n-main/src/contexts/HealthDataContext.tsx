import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { analysisService } from "../services/api";
import { useAuth } from "./AuthContext";

export interface MedicalDocument {
  id: string;
  title: string;
  category: "lab" | "imaging" | "prescription" | "discharge" | "insurance";
  date: string;
  timestamp: number;
  facility: string;
  summary: string;
  biomarkers?: string;
  fileUrl?: string;
  vitals?: Record<string, any>;
  abnormalities?: Array<{
    name: string;
    value: string;
    status: string;
    explanation?: string;
  }>;
  recommendations?: string[];
}

export interface VitalTrajectoryPoint {
  date: string;
  value: number;
  refMin?: number;
  refMax?: number;
  status: string;
  sourceDoc?: string;
}

export interface ImagingScanRecord {
  id: string;
  date: string;
  title: string;
  modality: string;
  findings: string;
  status: string;
  fileUrl?: string;
}

export interface ExtractedParameter {
  id: string;
  date: string;
  docTitle: string;
  name: string;
  value: string;
  status: string;
  explanation: string;
}

export interface ActivityItem {
  id: string;
  type: "lab" | "prescription" | "imaging" | "consultation" | "discharge";
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
  date: string;
}

interface HealthDataContextType {
  documents: MedicalDocument[];
  hemoglobinHistory: VitalTrajectoryPoint[];
  glucoseHistory: VitalTrajectoryPoint[];
  latestVitals: {
    hemoglobin: string;
    glucose: string;
    bloodPressure: string;
    pulse: string;
    spo2: string;
    temperature: string;
    lastUpdated: string;
  };
  imagingScans: ImagingScanRecord[];
  extractedParameters: ExtractedParameter[];
  recentActivities: ActivityItem[];
  vaultCounts: {
    all: number;
    lab: number;
    imaging: number;
    prescription: number;
    discharge: number;
    insurance: number;
  };
  isLoading: boolean;
  addUploadedDocument: (docData: Partial<MedicalDocument>, analysisData?: any) => MedicalDocument;
  createVaultRecord: (record: {
    title: string;
    category?: "lab" | "imaging" | "prescription" | "discharge" | "insurance";
    facility?: string;
    summary: string;
    biomarkers?: string;
  }) => Promise<MedicalDocument>;
  deleteDocument: (id: string, title?: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  clearAllHealthData: () => void;
  serverVitals: Array<{ key: string; value: string; source_context?: string }>;
  recordVital: (key: string, value: string, sourceContext?: string) => Promise<void>;
}

const getUserStorageKey = (uid?: string) => (uid ? `seva_health_data_${uid}` : "seva_health_data_guest");

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverVitals, setServerVitals] = useState<Array<{ key: string; value: string; source_context?: string }>>([]);

  // Initialize with empty array - loaded dynamically per authenticated user
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => {
    try {
      const stored = localStorage.getItem("seva_user");
      const uid = stored ? JSON.parse(stored)?.id : undefined;
      const cached = uid ? localStorage.getItem(getUserStorageKey(uid)) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.documents)) return parsed.documents;
      }
    } catch (e) {}
    return [];
  });

  const [hemoglobinHistory, setHemoglobinHistory] = useState<VitalTrajectoryPoint[]>([]);
  const [glucoseHistory, setGlucoseHistory] = useState<VitalTrajectoryPoint[]>([]);
  const [imagingScans, setImagingScans] = useState<ImagingScanRecord[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // Synchronize dynamic local state whenever authenticated user switches or logs in/out
  useEffect(() => {
    if (!user?.id) {
      setDocuments([]);
      setHemoglobinHistory([]);
      setGlucoseHistory([]);
      setImagingScans([]);
      setRecentActivities([]);
      setServerVitals([]);
      return;
    }

    try {
      const stored = localStorage.getItem(getUserStorageKey(user.id));
      if (stored) {
        const parsed = JSON.parse(stored);
        setDocuments(Array.isArray(parsed.documents) ? parsed.documents : []);
        setHemoglobinHistory(Array.isArray(parsed.hemoglobinHistory) ? parsed.hemoglobinHistory : []);
        setGlucoseHistory(Array.isArray(parsed.glucoseHistory) ? parsed.glucoseHistory : []);
        setImagingScans(Array.isArray(parsed.imagingScans) ? parsed.imagingScans : []);
        setRecentActivities(Array.isArray(parsed.recentActivities) ? parsed.recentActivities : []);
      } else {
        setDocuments([]);
        setHemoglobinHistory([]);
        setGlucoseHistory([]);
        setImagingScans([]);
        setRecentActivities([]);
      }
    } catch (e) {
      setDocuments([]);
      setHemoglobinHistory([]);
      setGlucoseHistory([]);
      setImagingScans([]);
      setRecentActivities([]);
    }
  }, [user?.id]);

  // Persist combined dynamic state to user-specific localStorage key
  useEffect(() => {
    if (!user?.id) return;
    try {
      localStorage.setItem(
        getUserStorageKey(user.id),
        JSON.stringify({
          documents,
          hemoglobinHistory,
          glucoseHistory,
          imagingScans,
          recentActivities
        })
      );
    } catch (e) {
      console.warn("Failed to persist health data to localStorage", e);
    }
  }, [user?.id, documents, hemoglobinHistory, glucoseHistory, imagingScans, recentActivities]);

  // Extract vitals and imaging metrics from raw report documents
  const parseDocumentVitals = useCallback((doc: MedicalDocument) => {
    const formattedShortMonth = doc.date && doc.date.includes(" ")
      ? doc.date.split(" ").slice(1).join(" ")
      : (doc.date || "Recent");

    const v = doc.vitals || {};

    // 1. Hemoglobin
    let hbCandidate: number | null = null;
    if (v.hemoglobin !== undefined && v.hemoglobin !== null && !isNaN(Number(v.hemoglobin))) {
      hbCandidate = Number(v.hemoglobin);
    } else if (doc.biomarkers) {
      const match = String(doc.biomarkers).match(/(?:hemoglobin|hb)[^\d]*([\d.]+)/i);
      if (match) hbCandidate = parseFloat(match[1]);
    }

    if (hbCandidate !== null && !isNaN(hbCandidate)) {
      const hbVal = hbCandidate;
      const status = hbVal < 13.0 ? "Low" : hbVal > 17.5 ? "High" : "Normal";
      setHemoglobinHistory((prev) => {
        if (prev.some((p) => p.sourceDoc === doc.title && p.value === hbVal)) return prev;
        const list = [
          ...prev,
          {
            date: formattedShortMonth,
            value: hbVal,
            refMin: 13.0,
            refMax: 17.0,
            status,
            sourceDoc: doc.title,
            timestamp: doc.timestamp
          }
        ];
        return list.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
      });
    }

    // 2. Fasting Sugar / Glucose
    let glucoseCandidate: number | null = null;
    const rawSugar = v.blood_sugar ?? v.glucose ?? v.fasting_sugar;
    if (rawSugar !== undefined && rawSugar !== null && !isNaN(Number(rawSugar))) {
      glucoseCandidate = Number(rawSugar);
    } else if (doc.biomarkers) {
      const match = String(doc.biomarkers).match(/(?:glucose|sugar|fasting[_\s]sugar)[^\d]*([\d.]+)/i);
      if (match) glucoseCandidate = parseFloat(match[1]);
    }

    if (glucoseCandidate !== null && !isNaN(glucoseCandidate)) {
      const gVal = glucoseCandidate;
      const status = gVal > 140 ? "High" : gVal > 100 ? "Pre-Diabetic" : "Normal";
      setGlucoseHistory((prev) => {
        if (prev.some((p) => p.sourceDoc === doc.title && p.value === gVal)) return prev;
        const list = [
          ...prev,
          {
            date: formattedShortMonth,
            value: gVal,
            refMin: 70,
            refMax: 100,
            status,
            sourceDoc: doc.title,
            timestamp: doc.timestamp
          }
        ];
        return list.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
      });
    }

    // 3. Check abnormalities array
    if (doc.abnormalities && Array.isArray(doc.abnormalities)) {
      doc.abnormalities.forEach((item) => {
        const nameLower = String(item?.name || "").toLowerCase();
        const valStr = String(item?.value ?? "");
        const matchNum = valStr.match(/([\d.]+)/);
        const numVal = matchNum ? parseFloat(matchNum[1]) : null;

        if (nameLower.includes("hemoglobin") && numVal !== null && !isNaN(numVal)) {
          setHemoglobinHistory((prev) => {
            if (prev.some((p) => p.sourceDoc === doc.title)) return prev;
            return [
              ...prev,
              {
                date: formattedShortMonth,
                value: numVal,
                refMin: 13.0,
                refMax: 17.0,
                status: String(item?.status || "").toUpperCase() === "HIGH" ? "High" : String(item?.status || "").toUpperCase() === "LOW" ? "Low" : "Normal",
                sourceDoc: doc.title,
                timestamp: doc.timestamp
              }
            ];
          });
        }

        if ((nameLower.includes("sugar") || nameLower.includes("glucose")) && numVal !== null && !isNaN(numVal)) {
          setGlucoseHistory((prev) => {
            if (prev.some((p) => p.sourceDoc === doc.title)) return prev;
            return [
              ...prev,
              {
                date: formattedShortMonth,
                value: numVal,
                refMin: 70,
                refMax: 100,
                status: String(item?.status || "").toUpperCase() === "HIGH" ? "High" : String(item?.status || "").toUpperCase() === "LOW" ? "Low" : "Normal",
                sourceDoc: doc.title,
                timestamp: doc.timestamp
              }
            ];
          });
        }
      });
    }

    // 4. Check imaging
    const titleLow = String(doc.title || "").toLowerCase();
    const sumLow = String(doc.summary || "").toLowerCase();
    const isImaging =
      doc.category === "imaging" ||
      titleLow.includes("x-ray") ||
      titleLow.includes("xray") ||
      titleLow.includes("scan") ||
      titleLow.includes("radiograph") ||
      titleLow.includes("mri") ||
      sumLow.includes("radiograph");

    if (isImaging) {
      setImagingScans((prev) => {
        if (prev.some((s) => s.id === `img_${doc.id}`)) return prev;
        return [
          {
            id: `img_${doc.id}`,
            date: doc.date || "Recent",
            title: doc.title,
            modality: doc.vitals?.imaging_type || "Radiological Scan",
            findings: doc.summary,
            status: "NORMAL",
            fileUrl: doc.fileUrl
          },
          ...prev
        ];
      });
    }
  }, []);

  // Sync with backend API
  const syncWithBackend = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    const activeUserId = user.id;
    try {
      setIsLoading(true);
      const repRes = await analysisService.getReports(activeUserId);
      if (repRes?.reports && Array.isArray(repRes.reports)) {
        const fetchedDocs: MedicalDocument[] = repRes.reports.map((r: any) => {
          let category: MedicalDocument["category"] = "lab";
          const titleLow = (r.title || "").toLowerCase();
          const sumLow = (r.summary || "").toLowerCase();

          if (
            r.category === "imaging" ||
            titleLow.includes("x-ray") ||
            titleLow.includes("xray") ||
            titleLow.includes("scan") ||
            titleLow.includes("radiograph") ||
            titleLow.includes("mri")
          ) {
            category = "imaging";
          } else if (r.category === "prescription" || titleLow.includes("prescription")) {
            category = "prescription";
          } else if (r.category === "discharge" || titleLow.includes("discharge")) {
            category = "discharge";
          } else if (r.category === "insurance" || titleLow.includes("card")) {
            category = "insurance";
          }

          let vitalsObj = r.vitals && typeof r.vitals === "object" ? { ...r.vitals } : {};
          let abnormalitiesArr = Array.isArray(r.abnormalities) ? [...r.abnormalities] : [];

          try {
            if (r.biomarkers && typeof r.biomarkers === "string" && r.biomarkers.trim().startsWith("{")) {
              const parsed = JSON.parse(r.biomarkers);
              if (parsed.vitals) vitalsObj = { ...vitalsObj, ...parsed.vitals };
              if (parsed.abnormalities && Array.isArray(parsed.abnormalities)) {
                abnormalitiesArr = [...abnormalitiesArr, ...parsed.abnormalities];
              }
              if (!parsed.vitals && !parsed.abnormalities && typeof parsed === "object") {
                vitalsObj = { ...vitalsObj, ...parsed };
              }
            }
          } catch (e) {}

          return {
            id: String(r.id),
            title: r.title || "Medical Document",
            category,
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })
              : "Recent",
            timestamp: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
            facility: r.facility || "Diagnostic Wing",
            summary: r.summary || "Medical report processed by Seva AI.",
            biomarkers: typeof r.biomarkers === "string" ? r.biomarkers : "",
            fileUrl: r.file_url || "#",
            vitals: vitalsObj,
            abnormalities: abnormalitiesArr
          };
        });

        // Set documents strictly for this active user
        setDocuments(fetchedDocs);
        setHemoglobinHistory([]);
        setGlucoseHistory([]);
        const chronological = [...fetchedDocs].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        chronological.forEach((d) => parseDocumentVitals(d));
      } else {
        setDocuments([]);
        setHemoglobinHistory([]);
        setGlucoseHistory([]);
      }

      // Fetch verified health memories & recorded vitals from backend
      try {
        const vitalsRes = await analysisService.getVitals(activeUserId);
        if (vitalsRes?.vitals && Array.isArray(vitalsRes.vitals)) {
          setServerVitals(vitalsRes.vitals);
        } else {
          setServerVitals([]);
        }
      } catch (err) {
        setServerVitals([]);
      }
    } catch (e) {
      console.warn("Backend sync notice: using current local health store.", e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, parseDocumentVitals]);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Record a vital measurement directly and persist to backend
  const recordVital = useCallback(
    async (key: string, value: string, sourceContext?: string) => {
      const activeUserId = user?.id || "guest_patient";
      const cleanKey = key.trim().toLowerCase();
      try {
        await analysisService.recordVital(activeUserId, {
          key: cleanKey,
          value,
          source_context: sourceContext || "Manual entry on Vitals Dashboard"
        });
        setServerVitals((prev) => {
          const filtered = prev.filter((v) => v.key.trim().toLowerCase() !== cleanKey);
          return [...filtered, { key: cleanKey, value, source_context: sourceContext }];
        });
        // Trigger background sync to refresh state
        syncWithBackend();
      } catch (e) {
        console.error("Failed to record vital:", e);
        setServerVitals((prev) => {
          const filtered = prev.filter((v) => v.key.trim().toLowerCase() !== cleanKey);
          return [...filtered, { key: cleanKey, value, source_context: sourceContext }];
        });
      }
    },
    [user, syncWithBackend]
  );

  // Derived Extracted Parameters (memoized to eliminate layout thrashing)
  const extractedParameters: ExtractedParameter[] = useMemo(() => {
    const list: ExtractedParameter[] = [];
    documents.forEach((doc) => {
      const seenNames = new Set<string>();

      // 1. From doc.abnormalities
      if (doc.abnormalities && Array.isArray(doc.abnormalities)) {
        doc.abnormalities.forEach((ab, idx) => {
          const abName = String(ab?.name || "Biomarker").trim();
          seenNames.add(abName.toLowerCase());
          list.push({
            id: `${doc.id}_param_${idx}`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: abName,
            value: String(ab?.value ?? "--"),
            status: String(ab?.status || "NORMAL").toUpperCase(),
            explanation: String(ab?.explanation || "Clinical observation recorded.")
          });
        });
      }

      // 2. From doc.vitals if not already covered
      if (doc.vitals && typeof doc.vitals === "object") {
        const v = doc.vitals;
        if (v.hemoglobin && !seenNames.has("hemoglobin")) {
          const valNum = Number(v.hemoglobin);
          list.push({
            id: `${doc.id}_vital_hb`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: "Hemoglobin (Hb)",
            value: `${v.hemoglobin} g/dL`,
            status: valNum < 13.0 ? "LOW" : valNum > 17.5 ? "HIGH" : "NORMAL",
            explanation: "Oxygen-carrying capacity of red blood cells in circulating blood."
          });
          seenNames.add("hemoglobin");
        }

        const sugarVal = v.fasting_sugar ?? v.blood_sugar ?? v.glucose;
        if (sugarVal && !seenNames.has("fasting blood glucose") && !seenNames.has("blood sugar")) {
          const sNum = Number(sugarVal);
          list.push({
            id: `${doc.id}_vital_sugar`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: "Fasting Blood Glucose",
            value: `${sugarVal} mg/dL`,
            status: sNum > 140 ? "HIGH" : sNum > 100 ? "ABNORMAL" : "NORMAL",
            explanation: "Fasting plasma glycemic concentration biomarker."
          });
          seenNames.add("fasting blood glucose");
        }

        if (v.platelets && !seenNames.has("platelets") && !seenNames.has("platelet count")) {
          list.push({
            id: `${doc.id}_vital_plt`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: "Platelet Count",
            value: `${Number(v.platelets).toLocaleString()} /mcL`,
            status: "NORMAL",
            explanation: "Thrombocyte count for blood coagulation and clotting function."
          });
          seenNames.add("platelets");
        }

        if (v.wbc && !seenNames.has("wbc") && !seenNames.has("total wbc count")) {
          list.push({
            id: `${doc.id}_vital_wbc`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: "Total WBC Count",
            value: `${Number(v.wbc).toLocaleString()} /mcL`,
            status: "NORMAL",
            explanation: "Immune defense leukocytes defending against cellular infection."
          });
          seenNames.add("wbc");
        }

        // Blood Pressure in document vitals
        const docBP = v.blood_pressure || v.bp || v.bloodPressure ||
          (v.blood_pressure_sys && v.blood_pressure_dia ? `${v.blood_pressure_sys}/${v.blood_pressure_dia}` : null) ||
          (v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : null);
        if (docBP && !seenNames.has("blood pressure") && !seenNames.has("bp")) {
          const bpStr = String(docBP).includes("mmHg") ? String(docBP) : `${docBP} mmHg`;
          list.push({
            id: `${doc.id}_vital_bp`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: "Blood Pressure (BP)",
            value: bpStr,
            status: "NORMAL",
            explanation: "Systemic arterial vascular pressure during cardiac cycle."
          });
          seenNames.add("blood pressure");
          seenNames.add("bp");
        }

        // Pulse in document vitals
        const docPulse = v.pulse || v.heart_rate || v.heartrate;
        if (docPulse && !seenNames.has("pulse") && !seenNames.has("heart rate")) {
          const pStr = String(docPulse).includes("bpm") ? String(docPulse) : `${docPulse} bpm`;
          list.push({
            id: `${doc.id}_vital_pulse`,
            date: doc.date || "Recent",
            docTitle: doc.title || "Medical Record",
            name: "Pulse Rate",
            value: pStr,
            status: "NORMAL",
            explanation: "Resting peripheral arterial pulse frequency."
          });
          seenNames.add("pulse");
          seenNames.add("heart rate");
        }
      }
    });

    // Also include verified server-recorded vitals in extracted parameters
    serverVitals.forEach((sv) => {
      const kLow = sv.key.trim().toLowerCase();
      if ((kLow === "blood_pressure" || kLow === "bp" || kLow === "bloodpressure") &&
          !list.some((p) => p.name.toLowerCase().includes("blood pressure") || p.name.toLowerCase() === "bp")) {
        list.push({
          id: `server_vital_${sv.key}`,
          date: "Clinical Record",
          docTitle: sv.source_context || "Clinical Memory & Vitals Log",
          name: "Blood Pressure (BP)",
          value: sv.value.includes("mmHg") ? sv.value : `${sv.value} mmHg`,
          status: "NORMAL",
          explanation: "Arterial vascular pressure recorded in clinical profile."
        });
      } else if ((kLow === "pulse" || kLow === "heart_rate" || kLow === "heartrate") &&
                 !list.some((p) => p.name.toLowerCase().includes("pulse") || p.name.toLowerCase() === "heart rate")) {
        list.push({
          id: `server_vital_${sv.key}`,
          date: "Clinical Record",
          docTitle: sv.source_context || "Clinical Memory & Vitals Log",
          name: "Pulse Rate",
          value: sv.value.includes("bpm") ? sv.value : `${sv.value} bpm`,
          status: "NORMAL",
          explanation: "Peripheral cardiovascular pulse frequency."
        });
      }
    });

    return list;
  }, [documents, serverVitals]);

  // Calculate dynamic Vault category counts (memoized)
  const vaultCounts = useMemo(() => ({
    all: documents.length,
    lab: documents.filter((d) => d.category === "lab").length,
    imaging: documents.filter((d) => d.category === "imaging").length,
    prescription: documents.filter((d) => d.category === "prescription").length,
    discharge: documents.filter((d) => d.category === "discharge").length,
    insurance: documents.filter((d) => d.category === "insurance").length
  }), [documents]);

  // Compute latest vitals values dynamically across all sources (memoized)
  const latestVitals = useMemo(() => {
    const latestHbPoint = hemoglobinHistory[hemoglobinHistory.length - 1];
    const latestGlucosePoint = glucoseHistory[glucoseHistory.length - 1];

    // 1. Flexible Blood Pressure extraction
    let bpVal: string | null = null;
    const memBP = serverVitals.find((v) => ["blood_pressure", "bp", "bloodpressure"].includes(v.key?.trim().toLowerCase()));
    if (memBP?.value) {
      bpVal = memBP.value;
    }
    if (!bpVal) {
      for (const d of documents) {
        const v = d.vitals || {};
        if (v.blood_pressure) { bpVal = String(v.blood_pressure); break; }
        if (v.bp) { bpVal = String(v.bp); break; }
        if (v.bloodPressure) { bpVal = String(v.bloodPressure); break; }
        if (v.blood_pressure_sys && v.blood_pressure_dia) { bpVal = `${v.blood_pressure_sys}/${v.blood_pressure_dia}`; break; }
        if (v.systolic && v.diastolic) { bpVal = `${v.systolic}/${v.diastolic}`; break; }

        if (Array.isArray(d.abnormalities)) {
          const bpAb = d.abnormalities.find((a) => /(?:bp|blood\s*pressure)/i.test(a.name));
          if (bpAb && bpAb.value && bpAb.value !== "--") {
            bpVal = bpAb.value;
            break;
          }
        }

        const bioText = String(d.biomarkers || "") + " " + String(d.summary || "");
        const match = bioText.match(/(?:bp|blood\s*pressure)[\s:=]*(\d{2,3}\s*\/\s*\d{2,3})/i);
        if (match) { bpVal = match[1].replace(/\s+/g, ""); break; }
      }
    }

    // 2. Flexible Pulse extraction
    let pulseVal: string | null = null;
    const memPulse = serverVitals.find((v) => ["pulse", "heart_rate", "heartrate"].includes(v.key?.trim().toLowerCase()));
    if (memPulse?.value) {
      pulseVal = memPulse.value;
    }
    if (!pulseVal) {
      for (const d of documents) {
        const v = d.vitals || {};
        if (v.pulse) { pulseVal = String(v.pulse); break; }
        if (v.heart_rate) { pulseVal = String(v.heart_rate); break; }
        if (v.heartrate) { pulseVal = String(v.heartrate); break; }
        const bioText = String(d.biomarkers || "") + " " + String(d.summary || "");
        const match = bioText.match(/(?:pulse|heart\s*rate)[\s:=]*(\d{2,3})/i);
        if (match) { pulseVal = match[1]; break; }
      }
    }

    // 3. Flexible SpO2 extraction
    let spo2Val: string | null = null;
    const memSpO2 = serverVitals.find((v) => ["spo2", "oxygen", "o2"].includes(v.key?.trim().toLowerCase()));
    if (memSpO2?.value) {
      spo2Val = memSpO2.value;
    }
    if (!spo2Val) {
      for (const d of documents) {
        const v = d.vitals || {};
        if (v.spo2) { spo2Val = String(v.spo2); break; }
        if (v.oxygen) { spo2Val = String(v.oxygen); break; }
        const bioText = String(d.biomarkers || "") + " " + String(d.summary || "");
        const match = bioText.match(/(?:spo2|oxygen)[\s:=]*(\d{2,3})/i);
        if (match) { spo2Val = match[1]; break; }
      }
    }

    // 4. Flexible Temperature extraction
    let tempVal: string | null = null;
    const memTemp = serverVitals.find((v) => ["temperature", "temp"].includes(v.key?.trim().toLowerCase()));
    if (memTemp?.value) {
      tempVal = memTemp.value;
    }
    if (!tempVal) {
      for (const d of documents) {
        const v = d.vitals || {};
        if (v.temperature) { tempVal = String(v.temperature); break; }
        if (v.temp) { tempVal = String(v.temp); break; }
      }
    }

    return {
      hemoglobin: latestHbPoint ? `${latestHbPoint.value} g/dL` : "--",
      glucose: latestGlucosePoint ? `${latestGlucosePoint.value} mg/dL` : "--",
      bloodPressure: bpVal ? (String(bpVal).includes("mmHg") ? String(bpVal) : `${bpVal} mmHg`) : "--",
      pulse: pulseVal ? (String(pulseVal).includes("bpm") ? String(pulseVal) : `${pulseVal} bpm`) : "--",
      spo2: spo2Val ? (String(spo2Val).includes("%") ? String(spo2Val) : `${spo2Val}%`) : "--",
      temperature: tempVal ? (String(tempVal).includes("°") ? String(tempVal) : `${tempVal} °F`) : "--",
      lastUpdated: documents[0]?.date || "No uploads yet"
    };
  }, [hemoglobinHistory, glucoseHistory, serverVitals, documents]);

  // Core handler: add newly uploaded document & propagate dynamically
  const addUploadedDocument = useCallback(
    (docData: Partial<MedicalDocument>, analysisData?: any): MedicalDocument => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      const formattedShortMonth =
        now.toLocaleDateString("en-IN", { month: "short" }) +
        " '" +
        String(now.getFullYear()).slice(-2);

      const docId = docData.id || `doc_${Date.now()}`;

      // Classify category
      let category: MedicalDocument["category"] = docData.category || "lab";
      const titleLower = (docData.title || analysisData?.title || "").toLowerCase();
      const summaryLower = (docData.summary || analysisData?.summary || "").toLowerCase();

      if (
        titleLower.includes("x-ray") ||
        titleLower.includes("xray") ||
        titleLower.includes("radiograph") ||
        titleLower.includes("scan") ||
        titleLower.includes("mri") ||
        titleLower.includes("ultrasound") ||
        summaryLower.includes("x-ray") ||
        summaryLower.includes("radiograph") ||
        analysisData?.category === "imaging"
      ) {
        category = "imaging";
      } else if (
        titleLower.includes("prescription") ||
        summaryLower.includes("prescribed") ||
        analysisData?.category === "prescription"
      ) {
        category = "prescription";
      } else if (
        titleLower.includes("discharge") ||
        summaryLower.includes("discharge") ||
        analysisData?.category === "discharge"
      ) {
        category = "discharge";
      }

      // Build document object
      const newDoc: MedicalDocument = {
        id: docId,
        title:
          docData.title ||
          analysisData?.title ||
          (category === "imaging" ? "Diagnostic X-Ray Scan" : "Medical Diagnostic Report"),
        category,
        date: formattedDate,
        timestamp: now.getTime(),
        facility:
          docData.facility ||
          analysisData?.facility ||
          (category === "imaging" ? "Radiology Wing" : "Diagnostic Wing"),
        summary:
          docData.summary ||
          analysisData?.summary ||
          "Document successfully analyzed and saved to your Health Vault.",
        biomarkers:
          docData.biomarkers ||
          analysisData?.biomarkers ||
          (category === "imaging" ? "Radiological Visual Scan" : "Clinical Biomarkers Extracted"),
        fileUrl: docData.fileUrl || analysisData?.file_url || "#",
        vitals: analysisData?.vitals || docData.vitals || {},
        abnormalities: (analysisData?.abnormalities || docData.abnormalities || []).map((ab: any) => ({
          name: String(ab?.name || "Biomarker"),
          value: String(ab?.value ?? "--"),
          status: String(ab?.status || "NORMAL").toUpperCase(),
          explanation: String(ab?.explanation || "Clinical observation recorded.")
        })),
        recommendations: analysisData?.recommendations || docData.recommendations || []
      };

      // 1. Update Documents List
      setDocuments((prev) => [newDoc, ...prev]);

      // 2. Extract and Update Vitals
      let hbUpdated = false;
      const v = analysisData?.vitals || docData.vitals || {};
      if (v.hemoglobin && !isNaN(Number(v.hemoglobin))) {
        const hbVal = Number(v.hemoglobin);
        const status = hbVal < 13.0 ? "Low" : hbVal > 17.5 ? "High" : "Normal";
        setHemoglobinHistory((prev) => [
          ...prev,
          {
            date: formattedShortMonth,
            value: hbVal,
            refMin: 13.0,
            refMax: 17.0,
            status,
            sourceDoc: newDoc.title,
            timestamp: now.getTime()
          }
        ]);
        hbUpdated = true;
      }

      const rawSugar = v.fasting_sugar ?? v.blood_sugar ?? v.glucose;
      if (rawSugar && !isNaN(Number(rawSugar))) {
        const gVal = Number(rawSugar);
        const status = gVal > 140 ? "High" : gVal > 100 ? "Pre-Diabetic" : "Normal";
        setGlucoseHistory((prev) => [
          ...prev,
          {
            date: formattedShortMonth,
            value: gVal,
            refMin: 70,
            refMax: 100,
            status,
            sourceDoc: newDoc.title,
            timestamp: now.getTime()
          }
        ]);
      }

      // Check abnormalities if not already extracted
      if (newDoc.abnormalities && Array.isArray(newDoc.abnormalities)) {
        newDoc.abnormalities.forEach((item) => {
          const nameLower = String(item?.name || "").toLowerCase();
          const valStr = String(item?.value ?? "");
          const matchNum = valStr.match(/([\d.]+)/);
          const numVal = matchNum ? parseFloat(matchNum[1]) : null;

          if (!hbUpdated && nameLower.includes("hemoglobin") && numVal !== null && !isNaN(numVal)) {
            setHemoglobinHistory((prev) => [
              ...prev,
              {
                date: formattedShortMonth,
                value: numVal,
                refMin: 13.0,
                refMax: 17.0,
                status:
                  String(item?.status || "").toUpperCase() === "HIGH"
                    ? "High"
                    : String(item?.status || "").toUpperCase() === "LOW"
                    ? "Low"
                    : "Normal",
                sourceDoc: newDoc.title,
                timestamp: now.getTime()
              }
            ]);
            hbUpdated = true;
          }

          if (
            (nameLower.includes("sugar") || nameLower.includes("glucose")) &&
            numVal !== null &&
            !isNaN(numVal)
          ) {
            setGlucoseHistory((prev) => [
              ...prev,
              {
                date: formattedShortMonth,
                value: numVal,
                refMin: 70,
                refMax: 100,
                status:
                  String(item?.status || "").toUpperCase() === "HIGH"
                    ? "High"
                    : String(item?.status || "").toUpperCase() === "LOW"
                    ? "Low"
                    : "Normal",
                sourceDoc: newDoc.title,
                timestamp: now.getTime()
              }
            ]);
          }
        });
      }

      // 3. If Imaging / X-Ray, add to imaging scans list
      if (category === "imaging") {
        const imagingObs =
          analysisData?.findings ||
          analysisData?.summary ||
          newDoc.summary ||
          "Radiological examination documented.";
        const imagingStatus =
          analysisData?.vitals?.status ||
          (newDoc.abnormalities && newDoc.abnormalities.length > 0 ? "ATTENTION" : "NORMAL");

        setImagingScans((prev) => [
          {
            id: `img_${Date.now()}`,
            date: formattedDate,
            title: newDoc.title,
            modality: analysisData?.vitals?.imaging_type || "Diagnostic Radiograph",
            findings: imagingObs,
            status: imagingStatus,
            fileUrl: newDoc.fileUrl
          },
          ...prev
        ]);
      }

      // 4. Prepend to Recent Activity Feed
      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        type:
          category === "imaging"
            ? "imaging"
            : category === "prescription"
            ? "prescription"
            : "lab",
        title: category === "imaging" ? `${newDoc.title} Uploaded` : `${newDoc.title}`,
        detail:
          category === "imaging"
            ? `${formattedDate} • ${newDoc.facility}`
            : `${formattedDate} • ${newDoc.biomarkers || "Parameters Processed"}`,
        badge:
          category === "imaging"
            ? "✓ Imaging Scanned & Saved"
            : hbUpdated
            ? "✓ New Vitals Recorded"
            : "✓ Saved to Health Vault",
        badgeColor:
          category === "imaging"
            ? "text-purple-700 bg-purple-50"
            : "text-emerald-700 bg-emerald-50",
        date: formattedDate
      };

      setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

      toast.success(`"${newDoc.title}" added to your Health Vault & Dashboard!`, {
        description: "Your health records, trajectories, and activity feed are dynamically updated."
      });

      return newDoc;
    },
    []
  );

  const deleteDocument = useCallback(async (id: string, title?: string) => {
    const docToDelete = documents.find((d) => d.id === id || (title && d.title === title));
    const effectiveId = docToDelete?.id || id;
    const effectiveTitle = docToDelete?.title || title || "";

    setDocuments((prev) => prev.filter((d) => d.id !== effectiveId && (!effectiveTitle || d.title !== effectiveTitle)));
    setImagingScans((prev) => prev.filter((s) => !s.id.includes(effectiveId) && (!effectiveTitle || s.title !== effectiveTitle)));
    if (docToDelete || effectiveTitle) {
      const matchTitle = effectiveTitle || docToDelete?.title;
      setHemoglobinHistory((prev) => prev.filter((h) => h.sourceDoc !== matchTitle));
      setGlucoseHistory((prev) => prev.filter((g) => g.sourceDoc !== matchTitle));
    }
    try {
      const activeUserId = user?.id || "guest_patient";
      await analysisService.deleteSingleReport(activeUserId, effectiveId, effectiveTitle);
    } catch (e) {
      console.warn("Backend delete notice:", e);
    }
    toast.success("Document removed from Health Vault & Database.");
  }, [documents, user]);

  const createVaultRecord = useCallback(async (record: {
    title: string;
    category?: "lab" | "imaging" | "prescription" | "discharge" | "insurance";
    facility?: string;
    summary: string;
    biomarkers?: string;
  }): Promise<MedicalDocument> => {
    const activeUserId = user?.id || "guest_patient";
    let backendId = `vault_${Date.now()}`;
    try {
      const res = await analysisService.createVaultReport(activeUserId, {
        title: record.title,
        category: record.category || "prescription",
        facility: record.facility || "Consultation via Seva AI",
        summary: record.summary,
        biomarkers: record.biomarkers || ""
      });
      if (res?.report?.id) {
        backendId = String(res.report.id);
      }
    } catch (e) {
      console.warn("Could not persist to backend DB, saved locally:", e);
    }

    const doc = addUploadedDocument({
      id: backendId,
      title: record.title,
      category: record.category || "prescription",
      facility: record.facility || "Consultation via Seva AI",
      summary: record.summary,
      biomarkers: record.biomarkers || "Prescription / Clinical Note"
    });
    return doc;
  }, [user, addUploadedDocument]);

  const clearAllHealthData = useCallback(async () => {
    if (user?.id) {
      localStorage.removeItem(getUserStorageKey(user.id));
    }
    setDocuments([]);
    setHemoglobinHistory([]);
    setGlucoseHistory([]);
    setImagingScans([]);
    setRecentActivities([]);
    setServerVitals([]);
    try {
      const activeUserId = user?.id || "guest_patient";
      await analysisService.clearReports(activeUserId);
    } catch (e) {}
    toast.info("All health records cleared from Vault and database.");
  }, [user?.id]);

  const contextValue = useMemo(() => ({
    documents,
    hemoglobinHistory,
    glucoseHistory,
    latestVitals,
    imagingScans,
    extractedParameters,
    recentActivities,
    vaultCounts,
    isLoading,
    addUploadedDocument,
    createVaultRecord,
    deleteDocument,
    syncWithBackend,
    clearAllHealthData,
    serverVitals,
    recordVital
  }), [
    documents,
    hemoglobinHistory,
    glucoseHistory,
    latestVitals,
    imagingScans,
    extractedParameters,
    recentActivities,
    vaultCounts,
    isLoading,
    addUploadedDocument,
    createVaultRecord,
    deleteDocument,
    syncWithBackend,
    clearAllHealthData,
    serverVitals,
    recordVital
  ]);

  return (
    <HealthDataContext.Provider value={contextValue}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = (): HealthDataContextType => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error("useHealthData must be used within a HealthDataProvider");
  }
  return context;
};
