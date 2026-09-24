import { toast } from "sonner";

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean = `${clean}/api`;
    }
    // Route any legacy Railway subdomains to the active updated railway instance
    if (clean.includes("healthaichatbot-leadsphere-production")) {
      return "https://aihealthsolution-leadsphere-production.up.railway.app/api";
    }
    return clean;
  }
  if (import.meta.env.PROD) {
    return "https://aihealthsolution-leadsphere-production.up.railway.app/api";
  }
  return "http://localhost:8000/api";
};

export const API_BASE_URL = getApiBaseUrl();

export const chatService = {
  async sendMessage(
    message: string, 
    userId: string = "user_123", 
    language: string = "English", 
    episodeId?: string,
    locationData?: { lat?: number; lon?: number; district?: string }
  ) {
    try {
      const payload: Record<string, any> = { user_id: userId, message, language, episode_id: episodeId };
      if (locationData?.lat !== undefined && locationData?.lon !== undefined) {
        payload.lat = locationData.lat;
        payload.lon = locationData.lon;
      }
      if (locationData?.district) {
        payload.district = locationData.district;
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Chat API Error:", error);
      toast.error("Connection error. Is the Seva backend running?");
      throw error;
    }
  },

  async getChatSessions(userId: string = "guest_patient") {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return await response.json();
    } catch (error) {
      console.error("Sessions Fetch Error:", error);
      return { status: "error", sessions: [] };
    }
  },

  async getSessionMessages(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch session messages");
      return await response.json();
    } catch (error) {
      console.error("Session Messages Fetch Error:", error);
      return { status: "error", messages: [] };
    }
  },

  async createNewSession(userId: string = "guest_patient", title: string = "New Consultation") {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title })
      });
      if (!response.ok) throw new Error("Failed to create session");
      return await response.json();
    } catch (error) {
      console.error("Create Session Error:", error);
      throw error;
    }
  },

  async deleteSession(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Failed to delete session");
      return await response.json();
    } catch (error) {
      console.error("Delete Session Error:", error);
      throw error;
    }
  },

  async getChatHistory(userId: string = "guest_patient", limit: number = 50) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${userId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`History Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Chat History Fetch Error:", error);
      return { status: "error", messages: [] };
    }
  },

  async clearChatHistory(userId: string = "guest_patient") {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Clear History Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Chat History Clear Error:", error);
      toast.error("Failed to clear chat history on server.");
      throw error;
    }
  }
};

export const analysisService = {
  async analyzeReport(file: File, userId: string = "user_123") {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/analysis`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok || data?.is_clear === false || data?.status === "error") {
        const errorMsg =
          data?.error ||
          data?.detail ||
          (data?.is_clear === false
            ? "The uploaded image was not clear. Please retry with a clearer, well-lit photo."
            : `API Error: ${response.statusText || "Could not analyze document"}`);
        const err = new Error(errorMsg);
        (err as any).is_clear = data?.is_clear === false;
        throw err;
      }
      
      return data;
    } catch (error: any) {
      console.error("Analysis API Error:", error);
      throw error;
    }
  },
  async analyzeImage(file: File, userId: string = "user_123") {
    return this.analyzeReport(file, userId);
  },
  async chatWithReport(question: string, reportContext: string, userId: string = "user_123") {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, question, reportContext })
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Report Chat error:", error);
      toast.error("Failed to get answer about report.");
      throw error;
    }
  },
  async getReports(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return await response.json();
    } catch (error) {
      console.error("Reports Fetch Error:", error);
      return { reports: [] };
    }
  },
  async getVitals(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch vitals");
      return await response.json();
    } catch (error) {
      console.error("Vitals Fetch Error:", error);
      return { status: "error", vitals: [] };
    }
  },
  async recordVital(userId: string, data: { key: string; value: string; source_context?: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to record vital");
      return await response.json();
    } catch (error) {
      console.error("Record Vital Error:", error);
      throw error;
    }
  },
  async clearReports(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete reports");
      return await response.json();
    } catch (error) {
      console.error("Delete Reports Error:", error);
      return { status: "error" };
    }
  },
  async deleteSingleReport(userId: string, reportId: string, title?: string) {
    try {
      const url = new URL(`${API_BASE_URL}/reports/${encodeURIComponent(userId)}/${encodeURIComponent(reportId)}`);
      if (title) url.searchParams.set("title", title);
      const response = await fetch(url.toString(), { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete report");
      return await response.json();
    } catch (error) {
      console.error("Delete Single Report Error:", error);
      return { status: "error" };
    }
  },
  async createVaultReport(userId: string, data: { title: string; category?: string; facility?: string; summary: string; biomarkers?: string; file_url?: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create vault record");
      return await response.json();
    } catch (error) {
      console.error("Create Vault Record Error:", error);
      return { status: "error" };
    }
  }
};

export const schemesService = {
  async getSchemes(query: string = "", state?: string) {
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (state && state !== "All" && state !== "All-India") params.append("state", state);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/schemes${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch schemes");
      return await response.json();
    } catch (error) {
      console.error("Schemes API Error:", error);
      return { schemes: [] };
    }
  },
  async checkEligibility(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to check eligibility");
      return await response.json();
    } catch (error) {
      console.error("Eligibility API Error:", error);
      return { eligible_schemes: [] };
    }
  },
  async checkPMJAYStatus(id_number: string, id_type: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/pmjay/check-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number, id_type })
      });
      if (!response.ok) throw new Error("Failed to check PMJAY status");
      return await response.json();
    } catch (error) {
      console.error("PMJAY Status API Error:", error);
      throw error;
    }
  }
};

export const alertsService = {
  async getAlerts(district: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts?district=${encodeURIComponent(district)}`);
      if (!response.ok) throw new Error("Failed to fetch alerts");
      return await response.json();
    } catch (error) {
      console.error("Alerts API Error:", error);
      return { alerts: [] };
    }
  }
};

export const searchService = {
  async globalSearch(query: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return await response.json();
    } catch (error) {
      console.error("Search API Error:", error);
      return { providers: [], terms: [], schemes: [] };
    }
  }
};

export const profileService = {
  async getProfile(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return await response.json();
    } catch (error) {
      console.error("Profile API Error:", error);
      return null;
    }
  },
  async updateProfile(userId: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return await response.json();
    } catch (error) {
      console.error("Profile Update Error:", error);
      toast.error("Could not save profile changes.");
      throw error;
    }
  },
  async confirmMemory(userId: string, memoryData: { memory_type: string; key: string; value: string; source_context?: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}/memory/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryData)
      });
      if (!response.ok) throw new Error("Failed to confirm health memory");
      return await response.json();
    } catch (error) {
      console.error("Memory Confirm Error:", error);
      toast.error("Could not confirm memory.");
      throw error;
    }
  },
  async getMemories(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}/memories`);
      if (!response.ok) throw new Error("Failed to fetch memories");
      return await response.json();
    } catch (error) {
      console.error("Memories Fetch Error:", error);
      return { memories: [] };
    }
  },
  async deleteMemory(userId: string, memoryId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}/memory/${memoryId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Failed to delete memory");
      return await response.json();
    } catch (error) {
      console.error("Delete Memory Error:", error);
      throw error;
    }
  }
};

export const appointmentService = {
  async bookAppointment(userId: string, data: any) {
    try {
      // Map frontend camelCase to backend snake_case
      const backendData = {
        userId: userId,
        patient_name: data.patientName,
        facility_name: data.specialty, // Map specialty to facility_name as per backend
        appointment_date: data.date,
        phone_number: data.phone,
        symptoms: data.symptoms
      };

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      });
      if (!response.ok) throw new Error("Failed to book appointment");
      return await response.json();
    } catch (error) {
      console.error("Appointment API Error:", error);
      toast.error("Failed to secure appointment on server.");
      throw error;
    }
  },
  async getAppointments(userId: string) {
     try {
      const response = await fetch(`${API_BASE_URL}/appointments/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return await response.json();
    } catch (error) {
      console.error("Appointments List Error:", error);
      return { appointments: [] };
    }
  }
};

export const translationService = {
  async translate(text: string, target_language: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language })
      });
      if (!response.ok) throw new Error("Translation failed");
      return await response.json();
    } catch (error) {
      console.error("Translation API Error:", error);
      return { translated_text: text };
    }
  }
};

export const authService = {
  async login(credentials: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },
  async signup(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Signup failed");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Signup API Error:", error);
      throw error;
    }
  },
  async oauthSync(data: { id: string; email: string; name?: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/oauth-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "OAuth sync failed" }));
        throw new Error(error.detail || "OAuth sync failed");
      }
      return await response.json();
    } catch (error) {
      console.error("OAuth Sync API Error:", error);
      throw error;
    }
  }
};

export const voiceService = {
  async transcribeAudio(audioBlob: Blob, language: string = "en"): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'speech.webm');
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Transcription failed" }));
      throw new Error(err.detail || `Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "";
  }
};

export const abhaService = {
  async generateCreationOtp(identityType: "aadhaar" | "mobile", identityValue: string) {
    const response = await fetch(`${API_BASE_URL}/abha/create/generate-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity_type: identityType, identity_value: identityValue })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to generate OTP" }));
      throw new Error(err.detail || "Failed to generate OTP");
    }
    return await response.json();
  },

  async verifyAndCreateAbha(data: { txn_id: string; otp: string; preferred_abha_address?: string; user_id?: string }) {
    const response = await fetch(`${API_BASE_URL}/abha/create/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to verify and create ABHA" }));
      throw new Error(err.detail || "Failed to verify and create ABHA");
    }
    return await response.json();
  },

  async initiateVerification(abhaId: string, userId?: string) {
    const response = await fetch(`${API_BASE_URL}/abha/verify/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abha_id: abhaId, user_id: userId })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to initiate ABHA verification" }));
      throw new Error(err.detail || "Failed to initiate ABHA verification");
    }
    return await response.json();
  },

  async confirmVerification(txnId: string, otp: string, userId?: string) {
    const response = await fetch(`${API_BASE_URL}/abha/verify/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txn_id: txnId, otp, user_id: userId })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Verification failed" }));
      throw new Error(err.detail || "Verification failed");
    }
    return await response.json();
  },

  async createDoctorConsent(data: {
    user_id: string;
    document_ids: string[];
    document_titles: string[];
    duration_hours: number;
    purpose?: string;
    doctor_name?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/abha/consent/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to create consent pass");
    return await response.json();
  },

  async exportFhirBundle(userId: string, documents: any[] = []) {
    const response = await fetch(`${API_BASE_URL}/abha/fhir/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, documents })
    });
    if (!response.ok) throw new Error("Failed to export FHIR bundle");
    return await response.json();
  },

  async syncHospitalRecords(userId: string, facilityName?: string) {
    const response = await fetch(`${API_BASE_URL}/abha/hip/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, facility_name: facilityName })
    });
    if (!response.ok) throw new Error("Hospital sync failed");
    return await response.json();
  }
};

export interface SensorStatusItem {
  supported_on_device: boolean;
  source: string;
  status: 'LIVE_STREAMING' | 'ON_DEMAND' | 'MANUAL_LOG_REQUIRED' | 'LAB_REPORT_SYNCED' | 'FUSED_FROM_CLINIC_LOG' | 'LAST_KNOWN';
  notice?: string;
}

export interface LiveVitalsPayload {
  user_id: string;
  device: string;
  source_type: string;
  last_updated: string;
  vitals: {
    heart_rate?: number;
    spo2?: number;
    blood_pressure?: string;
    blood_pressure_sys?: number;
    blood_pressure_dia?: number;
    temperature?: number;
    blood_glucose?: string | number;
    last_heart_rate_ts?: string;
    last_spo2_ts?: string;
  };
  sensor_status: Record<string, SensorStatusItem>;
  alerts: Array<{
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    vital: string;
    value: any;
    message: string;
  }>;
  cache_tier: 'REDIS' | 'IN_MEMORY_BUFFER';
  latency_ms: number;
}

export const wearableTelemetryService = {
  async getLiveTelemetry(userId: string = "rahul_mumbai_demo"): Promise<LiveVitalsPayload> {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals/live?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error("Failed to fetch live vitals telemetry");
      return await response.json();
    } catch (err) {
      console.warn("Telemetry fetch fallback:", err);
      return {
        user_id: userId,
        device: "Noise ColorFit Pro",
        source_type: "offline_buffer",
        last_updated: new Date().toISOString(),
        vitals: { heart_rate: 74, spo2: 98, blood_pressure: "118/78", temperature: 98.4 },
        sensor_status: {},
        alerts: [],
        cache_tier: "IN_MEMORY_BUFFER",
        latency_ms: 0.4
      };
    }
  },

  async streamLiveVital(payload: {
    user_id?: string;
    device_name?: string;
    heart_rate?: number;
    spo2?: number;
    blood_pressure_sys?: number;
    blood_pressure_dia?: number;
    temperature?: number;
    source_type?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/vitals/live-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Failed to stream live vital");
    return await response.json();
  },

  async syncWearableBatch(userId: string, deviceName: string, batch: Array<Record<string, any>>) {
    const response = await fetch(`${API_BASE_URL}/vitals/wearable-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, device_name: deviceName, batch })
    });
    if (!response.ok) throw new Error("Failed to sync wearable batch");
    return await response.json();
  },

  async logManualVital(userId: string, vitalName: string, value: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/vitals/manual-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, vital_name: vitalName, value, notes })
    });
    if (!response.ok) throw new Error("Failed to log manual vital");
    return await response.json();
  },

  async getSensorMatrix(userId: string = "rahul_mumbai_demo") {
    const response = await fetch(`${API_BASE_URL}/vitals/sensors/${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error("Failed to get sensor matrix");
    return await response.json();
  }
};

