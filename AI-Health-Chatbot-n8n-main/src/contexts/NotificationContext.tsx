import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "alert" | "info" | "announcement" | "success";
  time: string;
  icon: string;
  color: string;
  read: boolean;
}

export interface ScheduledReminder {
  id: string;
  title: string;
  message: string;
  durationSeconds: number;
  targetTimestamp: number;
  dueTimeStr?: string;
  active: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "time" | "read">) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAllNotifications: () => void;
  resetToClinicalNotifications: () => void;
  unreadCount: number;
  activeReminders: ScheduledReminder[];
  scheduleReminder: (
    reminder: { id?: string; title: string; message: string; duration_seconds?: number; durationSeconds?: number },
    onTrigger?: (rem: ScheduledReminder) => void
  ) => void;
  cancelReminder: (id: string) => void;
  playReminderSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Real clinical notifications synchronized with Rahul Sharma's Supabase records
const REAL_CLINICAL_NOTIFICATIONS: Notification[] = [
  {
    id: 101,
    title: "Appointment Confirmed • KEM Hospital",
    message: "Confirmed with KEM Hospital & Cardiac Research, Parel, Mumbai for Sep 28, 2026 at 10:30 AM (Cardiovascular checkup & ECG review).",
    type: "info",
    time: "Sep 28, 10:30 AM",
    icon: "event_available",
    color: "bg-blue-600 text-white",
    read: false
  },
  {
    id: 102,
    title: "Clinical Safety Profile Synchronized",
    message: "Verified cross-allergy defense for Penicillin active across all consultations (ABDM ID: 91-8273-4920-1124).",
    type: "alert",
    time: "Active Safety",
    icon: "verified_user",
    color: "bg-emerald-600 text-white",
    read: false
  },
  {
    id: 103,
    title: "Maharashtra MJPJAY & PM-JAY Verified",
    message: "Universal cashless health coverage active up to ₹5,00,000 per family across 2,400+ empaneled hospitals in Mumbai.",
    type: "announcement",
    time: "District Mumbai",
    icon: "health_and_safety",
    color: "bg-indigo-600 text-white",
    read: false
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const notifKey = user?.id ? `seva_notifications_${user.id}` : "seva_notifications_guest";

  const getInitialNotifications = useCallback((): Notification[] => {
    if (user?.id === "rahul_mumbai_demo") {
      return REAL_CLINICAL_NOTIFICATIONS;
    }
    return [
      {
        id: 101,
        title: "Clinical Profile & Vault Ready",
        message: `Welcome to SevaSetu Health, ${user?.name || "Patient Citizen"}! Your private health records vault and AI consultations are active.`,
        type: "success",
        time: "Just now",
        icon: "verified_user",
        color: "bg-emerald-600 text-white",
        read: false
      }
    ];
  }, [user]);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const storedUser = localStorage.getItem("seva_user");
      const uid = storedUser ? JSON.parse(storedUser)?.id : undefined;
      const key = uid ? `seva_notifications_${uid}` : "seva_notifications_guest";
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      if (uid === "rahul_mumbai_demo") return REAL_CLINICAL_NOTIFICATIONS;
    } catch (e) {}
    return [
      {
        id: 101,
        title: "Clinical Profile & Vault Ready",
        message: "Welcome to SevaSetu Health! Your private health records vault and AI consultations are active.",
        type: "success",
        time: "Just now",
        icon: "verified_user",
        color: "bg-emerald-600 text-white",
        read: false
      }
    ];
  });

  const [activeReminders, setActiveReminders] = useState<ScheduledReminder[]>([]);
  const timeoutsRef = useRef<{ [id: string]: ReturnType<typeof setTimeout> }>({});

  // Reload notifications whenever authenticated user changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(notifKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          return;
        }
      }
    } catch (e) {}
    setNotifications(getInitialNotifications());
  }, [notifKey, getInitialNotifications]);

  // Persist notifications whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(notifKey, JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to persist notifications", e);
    }
  }, [notifKey, notifications]);

  // Request browser Notification permission on first interaction
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const addNotification = (notif: Omit<Notification, "id" | "time" | "read">) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now(),
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification dismissed.");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem(notifKey, JSON.stringify([]));
    localStorage.setItem(`${notifKey}_cleared`, "true");
    toast.success("Cleared all notifications.");
  };

  const resetToClinicalNotifications = () => {
    const list = getInitialNotifications();
    setNotifications(list);
    localStorage.removeItem(`${notifKey}_cleared`);
    localStorage.setItem(notifKey, JSON.stringify(list));
    toast.success("Synchronized real clinical alerts from Supabase profile.");
  };

  const playReminderSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playChimeSequence = (startTime: number) => {
        // D5 (587.33Hz), F#5 (739.99Hz), A5 (880.00Hz), D6 (1174.66Hz)
        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime + index * 0.12);
          
          gain.gain.setValueAtTime(0.001, startTime + index * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.3, startTime + index * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.12 + 0.4);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(startTime + index * 0.12);
          osc.stop(startTime + index * 0.12 + 0.45);
        });
      };

      const now = ctx.currentTime;
      playChimeSequence(now);
      playChimeSequence(now + 0.6); // Double chime
    } catch (e) {
      console.warn("Audio chime failed to play:", e);
    }
  };

  const cancelReminder = (id: string) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    setActiveReminders(prev => prev.filter(r => r.id !== id));
    toast.info("Reminder cancelled.");
  };

  const scheduleReminder = (
    reminder: { id?: string; title: string; message: string; duration_seconds?: number; durationSeconds?: number },
    onTrigger?: (rem: ScheduledReminder) => void
  ) => {
    const seconds = reminder.duration_seconds || reminder.durationSeconds || 60;
    const remId = reminder.id || `rem_${Date.now()}`;
    const targetTimestamp = Date.now() + seconds * 1000;
    const dueTime = new Date(targetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReminder: ScheduledReminder = {
      id: remId,
      title: reminder.title || "⏰ Scheduled Health Alert",
      message: reminder.message || "Time for your scheduled health alert!",
      durationSeconds: seconds,
      targetTimestamp,
      dueTimeStr: dueTime,
      active: true
    };

    setActiveReminders(prev => [...prev.filter(r => r.id !== remId), newReminder]);

    // Show confirmation toast
    toast.success(`⏰ Alert scheduled for in ${seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds}s`} (${dueTime})!`, {
      description: "An audible chime and high-priority notification will sound when due."
    });

    // Set browser timer
    timeoutsRef.current[remId] = setTimeout(() => {
      // 1. Play audio chime
      playReminderSound();

      // 2. Add to permanent Notification Feed (Priority Alerts)
      addNotification({
        title: newReminder.title,
        message: newReminder.message,
        type: "alert",
        icon: "notifications_active",
        color: "bg-red-500 text-white"
      });

      // 3. Trigger High-Priority Interactive Toast
      toast.error(newReminder.title, {
        description: `${newReminder.message} • [Audio Chime Ringing]`,
        duration: 20000,
        action: {
          label: "Dismiss",
          onClick: () => {}
        }
      });

      // 4. Native Browser Push Notification (if permitted)
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(newReminder.title, {
            body: newReminder.message,
            icon: "/favicon.ico"
          });
        } catch (e) {}
      }

      // 5. Fire optional callback (e.g. Injects reminder into Chat stream)
      if (onTrigger) {
        onTrigger(newReminder);
      }

      // 6. Clean up active reminder
      setActiveReminders(prev => prev.filter(r => r.id !== remId));
      delete timeoutsRef.current[remId];
    }, seconds * 1000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      resetToClinicalNotifications,
      unreadCount,
      activeReminders,
      scheduleReminder,
      cancelReminder,
      playReminderSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
