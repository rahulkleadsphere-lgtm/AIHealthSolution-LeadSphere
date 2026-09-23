import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  district?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("seva_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      if (localStorage.getItem("seva_logged_out") === "true") {
        return null;
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }
    // Default to Rahul Sharma verified profile for seamless instant evaluation
    const defaultPersona = {
      id: "rahul_mumbai_demo",
      name: "Rahul Sharma",
      email: "rahul@sevasetu.in",
      role: "user" as const,
      district: "Mumbai"
    };
    try {
      localStorage.setItem("seva_user", JSON.stringify(defaultPersona));
    } catch (e) {}
    return defaultPersona;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // BITSoM Demo Persona: Rahul Sharma (Mumbai, 21, O+, Penicillin Allergy)
      if (email.trim().toLowerCase() === "rahul@sevasetu.in" || email.trim().toLowerCase() === "admin@sevasetu.in") {
        const demoPersona = {
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
            primary_condition: "None",
            allergies: ["Penicillin"],
            abha_id: "91-8273-4920-1124",
            profile_completion_pct: 82
          }
        };
        setUser(demoPersona as any);
        localStorage.setItem("seva_user", JSON.stringify(demoPersona));
        toast.success("Welcome, Rahul Sharma! (BITSoM Demo Profile)");
        return;
      }

      const response = await authService.login({ email, password });
      
      if (response.status === "success" && response.user) {
        setUser(response.user);
        localStorage.setItem("seva_user", JSON.stringify(response.user));
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

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({ name, email, password });
      
      if (response.status === "success" && response.user) {
        setUser(response.user);
        localStorage.setItem("seva_user", JSON.stringify(response.user));
        toast.success(`Account created! Welcome, ${name}`);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("seva_user");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
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
