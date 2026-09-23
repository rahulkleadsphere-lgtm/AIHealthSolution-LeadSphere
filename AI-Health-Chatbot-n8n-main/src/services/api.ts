import { toast } from "sonner";

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // Automatically route legacy railway subdomains to the active updated railway instance
  if (
    envUrl &&
    (envUrl.includes("healthaichatbot-leadsphere-production.up.railway.app") ||
     envUrl.includes("healthaichatbot-leadsphere-production-0990.up.railway.app"))
  ) {
    return "https://healthaichatbot-leadsphere-production-2f83.up.railway.app/api";
  }
  if (envUrl) return envUrl;
  if (import.meta.env.PROD) {
    return "https://healthaichatbot-leadsphere-production-2f83.up.railway.app/api";
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

  async getChatSessions(userId: string = "rahul_mumbai_demo") {
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

  async createNewSession(userId: string = "rahul_mumbai_demo", title: string = "New Consultation") {
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

  async getChatHistory(userId: string = "rahul_mumbai_demo", limit: number = 50) {
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

  async clearChatHistory(userId: string = "rahul_mumbai_demo") {
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
