import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "../services/api";
import { supabase, signInWithGoogle } from "../services/supabaseClient";

export interface UserProfile {
  bio?: string;
  blood_group?: string;
  weight?: string;
  height?: string;
  age?: string;
  gender?: string;
  district?: string;
  primary_condition?: string;
  allergies?: string[];
  abha_id?: string;
  profile_completion_pct?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  district?: string;
  profile?: UserProfile;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  blood_group?: string;
  weight?: string;
  height?: string;
  age?: string;
  gender?: string;
  district?: string;
  primary_condition?: string;
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  abha_id?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload | { name: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUserContext: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("seva_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      if (
        hash.includes("access_token=") ||
        hash.includes("refresh_token=") ||
        search.includes("code=") ||
        search.includes("token=")
      ) {
        return true;
      }
    }
    return false;
  });

  // Synchronize Supabase OAuth Auth State
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const gUser = session.user;
        const fullName =
          gUser.user_metadata?.full_name ||
          gUser.user_metadata?.name ||
          gUser.email?.split("@")[0] ||
          "Citizen Patient";
        const email = gUser.email || "";

        try {
          // Sync with backend database to register or retrieve this user
          const syncRes = await authService.oauthSync({
            id: gUser.id,
            email: email,
            name: fullName,
          });

          if (syncRes?.status === "success" && syncRes.user) {
            setUser(syncRes.user);
            localStorage.setItem("seva_user", JSON.stringify(syncRes.user));
            localStorage.removeItem("seva_logged_out");
            setIsLoading(false);
            toast.success(`Signed in as ${syncRes.user.name}`);
            if (
              window.location.pathname === "/login" ||
              window.location.pathname === "/signup" ||
              window.location.pathname === "/"
            ) {
              window.location.href = "/dashboard";
            }
            return;
          }
        } catch (syncErr) {
          console.warn("Backend OAuth sync notice:", syncErr);
        }

        // Fallback clean user profile for this Google Account
        const authenticatedUser: User = {
          id: gUser.id,
          name: fullName,
          email: email,
          role: "user",
          district: "Mumbai",
          profile: {
            bio: "Verified citizen account via Google Authentication.",
            blood_group: "",
            weight: "",
            height: "",
            age: "",
            gender: "",
            district: "Mumbai",
            primary_condition: "None",
            allergies: [],
            abha_id: `91-5820-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            profile_completion_pct: 60,
          },
        };

        setUser(authenticatedUser);
        localStorage.setItem("seva_user", JSON.stringify(authenticatedUser));
        localStorage.removeItem("seva_logged_out");
        setIsLoading(false);
        toast.success(`Signed in with Google as ${fullName}`);
        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/signup" ||
          window.location.pathname === "/"
        ) {
          window.location.href = "/dashboard";
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // BITSoM Demo Persona: Rahul Sharma (Mumbai, 21, O+, Penicillin Allergy)
      if (
        email.trim().toLowerCase() === "rahul@sevasetu.in" ||
        email.trim().toLowerCase() === "admin@sevasetu.in"
      ) {
        const demoPersona: User = {
          id: "rahul_mumbai_demo",
          name: "Rahul Sharma",
          email: "rahul@sevasetu.in",
          role: "user",
          district: "Mumbai",
          profile: {
            bio: "Student in Mumbai. Focused on preventive fitness & family care.",
            blood_group: "O+",
            weight: "68 kg",
            height: "174 cm",
            age: "21",
            gender: "Male",
            district: "Mumbai",
            primary_condition: "None",
            allergies: ["Penicillin"],
            abha_id: "91-8273-4920-1124",
            profile_completion_pct: 88,
          },
        };
        setUser(demoPersona);
        localStorage.setItem("seva_user", JSON.stringify(demoPersona));
        localStorage.removeItem("seva_logged_out");
        toast.success("Welcome, Rahul Sharma! (BITSoM Demo Profile)");
        return;
      }

      const response = await authService.login({ email, password });

      if (response.status === "success" && response.user) {
        setUser(response.user);
        localStorage.setItem("seva_user", JSON.stringify(response.user));
        localStorage.removeItem("seva_logged_out");
        toast.success(`Welcome back, ${response.user.name}!`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Failed to login. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast.error(error.message || "Google Authentication failed. Check Supabase Provider settings.");
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (payload: SignupPayload | { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(payload);

      if (response.status === "success" && response.user) {
        setUser(response.user);
        localStorage.setItem("seva_user", JSON.stringify(response.user));
        localStorage.removeItem("seva_logged_out");
        toast.success(`Clinical profile created! Welcome, ${response.user.name}`);
      } else {
        throw new Error("Invalid response from server during registration");
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(error.message || "Failed to create account. Email might already exist.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentUserId = user?.id;
    setUser(null);
    localStorage.removeItem("seva_user");
    localStorage.setItem("seva_logged_out", "true");
    if (currentUserId) {
      localStorage.removeItem(`seva_health_data_${currentUserId}`);
      localStorage.removeItem(`seva_notifications_${currentUserId}`);
      localStorage.removeItem(`sevasetu_profile_image_${currentUserId}`);
    }
    localStorage.removeItem("seva_health_data_dynamic_v2");
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    toast.info("Logged out successfully");
  };

  const updateUserContext = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updated };
      localStorage.setItem("seva_user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
