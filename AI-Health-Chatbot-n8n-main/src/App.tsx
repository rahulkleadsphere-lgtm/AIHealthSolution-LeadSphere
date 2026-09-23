import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { HealthDataProvider } from "./contexts/HealthDataContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GovtSchemes from "./pages/GovtSchemes";
import Chat from "./pages/Chat";
import Analysis from "./pages/Analysis";
import Appointment from "./pages/Appointment";
import HealthHub from "./pages/HealthHub";
import PreventiveCare from "./pages/PreventiveCare";
import VaccinationSchedules from "./pages/VaccinationSchedules";
import HygieneTips from "./pages/HygieneTips";
import Profile from "./pages/Profile";
import LanguageSettings from "./pages/LanguageSettings";
import Notifications from "./pages/Notifications";
import MentalWellness from "./pages/MentalWellness";
import Nutrition from "./pages/Nutrition";
import MaternalCare from "./pages/MaternalCare";
import HealthCalendar from "./pages/HealthCalendar";
import HealthDirectory from "./pages/HealthDirectory";
import Helplines from "./pages/Helplines";
import PdfLibrary from "./pages/PdfLibrary";
import FacilityDetail from "./pages/FacilityDetail";
import SchemeDetail from "./pages/SchemeDetail";
import OfflineFirstAid from "./pages/OfflineFirstAid";
import Dashboard from "./pages/Dashboard";
import Vitals from "./pages/Vitals";
import HealthVault from "./pages/HealthVault";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <HealthDataProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public Landing & Emergency Pages */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/offline-first-aid" element={<OfflineFirstAid />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected Core Platform Pages within MainLayout */}
                    <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                    <Route path="/vitals" element={<ProtectedRoute><MainLayout><Vitals /></MainLayout></ProtectedRoute>} />
                    <Route path="/vault" element={<ProtectedRoute><MainLayout><HealthVault /></MainLayout></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><MainLayout><Chat /></MainLayout></ProtectedRoute>} />
                    <Route path="/analysis" element={<ProtectedRoute><MainLayout><Analysis /></MainLayout></ProtectedRoute>} />
                    <Route path="/schemes" element={<ProtectedRoute><MainLayout><GovtSchemes /></MainLayout></ProtectedRoute>} />
                    <Route path="/scheme/:schemeName" element={<ProtectedRoute><MainLayout><SchemeDetail /></MainLayout></ProtectedRoute>} />
                    <Route path="/appointment" element={<ProtectedRoute><MainLayout><Appointment /></MainLayout></ProtectedRoute>} />
                    
                    {/* Health Awareness Hub & Content */}
                    <Route path="/health-hub" element={<ProtectedRoute><MainLayout><HealthHub /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-content/preventive-care" element={<ProtectedRoute><MainLayout><PreventiveCare /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-content/vaccination-schedules" element={<ProtectedRoute><MainLayout><VaccinationSchedules /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-content/hygiene-tips" element={<ProtectedRoute><MainLayout><HygieneTips /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-content/mental-wellness" element={<ProtectedRoute><MainLayout><MentalWellness /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-content/nutrition" element={<ProtectedRoute><MainLayout><Nutrition /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-content/maternal-care" element={<ProtectedRoute><MainLayout><MaternalCare /></MainLayout></ProtectedRoute>} />
                    
                    {/* Additional Resources */}
                    <Route path="/health-calendar" element={<ProtectedRoute><MainLayout><HealthCalendar /></MainLayout></ProtectedRoute>} />
                    <Route path="/health-directory" element={<ProtectedRoute><MainLayout><HealthDirectory /></MainLayout></ProtectedRoute>} />
                    <Route path="/helplines" element={<ProtectedRoute><MainLayout><Helplines /></MainLayout></ProtectedRoute>} />
                    <Route path="/pdf-library" element={<ProtectedRoute><MainLayout><PdfLibrary /></MainLayout></ProtectedRoute>} />
                    <Route path="/facility/:id" element={<ProtectedRoute><MainLayout><FacilityDetail /></MainLayout></ProtectedRoute>} />
                    
                    {/* Profile, Settings & Notifications */}
                    <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                    <Route path="/language" element={<ProtectedRoute><MainLayout><LanguageSettings /></MainLayout></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
                    
                    {/* Route Aliases / Redirects to Prevent 404s */}
                    <Route path="/directory" element={<Navigate to="/health-directory" replace />} />
                    <Route path="/help" element={<Navigate to="/helplines" replace />} />
                    <Route path="/settings" element={<Navigate to="/profile" replace />} />
                    <Route path="/personal-settings" element={<Navigate to="/profile" replace />} />
                    <Route path="/health-vault" element={<Navigate to="/vault" replace />} />
                    <Route path="/records" element={<Navigate to="/vault" replace />} />
                    
                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </HealthDataProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
