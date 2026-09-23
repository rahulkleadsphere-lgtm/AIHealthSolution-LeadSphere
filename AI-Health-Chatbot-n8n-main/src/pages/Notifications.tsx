import React from "react";
import { toast } from "sonner";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { Clock, X, Trash2, Bell, CheckCheck, ShieldCheck, Calendar, BellRing, RefreshCw } from "lucide-react";

const Notifications: React.FC = () => {
  const { 
    notifications, 
    markAllAsRead, 
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    resetToClinicalNotifications,
    activeReminders, 
    cancelReminder
  } = useNotifications();
  const { user } = useAuth();

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeReminders = Array.isArray(activeReminders) ? activeReminders : [];

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-10 pb-24">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200/80 backdrop-blur-md">
          <BellRing className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[10px] font-black uppercase tracking-widest">Priority Health Alerts</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black font-headline leading-[0.9] tracking-tighter text-slate-900">
              Stay <span className="text-blue-600 italic underline decoration-blue-200 decoration-8">Informed</span>.
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
              Real-time clinical alerts, appointment reminders, and welfare updates for {user?.name || "Patient"}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {safeNotifications.length > 0 ? (
              <>
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 hover:bg-blue-100 transition-all rounded-xl shadow-xs active:scale-95"
                >
                  Mark all read
                </button>
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 px-3.5 py-2 transition-all rounded-xl shadow-xs active:scale-95"
                >
                  Clear all
                </button>
                <button 
                  onClick={resetToClinicalNotifications}
                  title="Re-sync notifications"
                  className="p-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-xs active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={resetToClinicalNotifications}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 hover:bg-blue-100 transition-all rounded-xl shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Supabase Records</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Active Scheduled Reminders (if any are currently running) */}
      {safeReminders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Active Countdown Timers ({safeReminders.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {safeReminders.map((rem) => (
              <div 
                key={rem.id} 
                className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400 rounded-3xl flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce">
                    <BellRing className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900">{rem.title}</h3>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded-full text-[10px] font-black uppercase">
                        Active Timer
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {rem.message} • Due at <strong>{rem.dueTimeStr}</strong> (Audio Chime Active)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => cancelReminder(rem.id)}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-xs border border-transparent hover:border-red-200"
                  title="Cancel reminder"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notification Feed */}
      <section className="space-y-3">
        {safeNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] border border-slate-200/80 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCheck className="w-8 h-8 text-blue-600 stroke-2" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">Clean Slate • All Caught Up!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                Demo placeholder data has been cleared. When new clinical alerts or medication reminders arrive, they will appear here.
              </p>
            </div>
            <div>
              <button
                onClick={resetToClinicalNotifications}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Verified Records From Supabase</span>
              </button>
            </div>
          </div>
        ) : (
          safeNotifications.map((notification) => (
            <div 
              key={notification.id} 
              onClick={() => markAsRead(notification.id)}
              className={`group p-5 rounded-[28px] border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99] ${
                notification.read 
                  ? "bg-white/80 border-slate-200/70 opacity-75 hover:opacity-100" 
                  : "bg-white border-blue-200 shadow-md shadow-blue-50/50"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-2xl ${notification.color} flex items-center justify-center shadow-md shrink-0`}>
                  {notification.type === "alert" ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : notification.type === "info" ? (
                    <Calendar className="w-6 h-6" />
                  ) : (
                    <Bell className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm sm:text-base truncate ${notification.read ? "font-bold text-slate-700" : "font-black text-slate-900"}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                    {notification.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Dismiss alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* System Integrity Bento */}
      <section className="bg-slate-100/70 rounded-[32px] p-6 sm:p-8 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Live Clinical Link Active
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Connected to <strong>{user?.profile?.district ? `${user.profile.district} Health District Registry` : "National Digital Health Mission"}</strong>. Real-time audio alerts are powered by the Web Audio API.
          </p>
          <p className="text-[11px] font-mono text-slate-400 font-semibold">
            ABHA ID: {user?.profile?.abha_id || "ABHA Active"} • Blood Group: {user?.profile?.blood_group || "Registered"} • Verified Patient: {user?.name || "Patient"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            District: {user?.profile?.district || "India"}
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black shadow-2xs">
            100% Online
          </div>
        </div>
      </section>
    </div>
  );
};

export default Notifications;

