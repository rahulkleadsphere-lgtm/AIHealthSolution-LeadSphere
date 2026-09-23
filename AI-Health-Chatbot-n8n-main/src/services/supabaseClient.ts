import { createClient } from "@supabase/supabase-js";

// Read from Vite environment variables with graceful project fallbacks
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  "https://xavptbutadtrjrcenqmk.supabase.co";

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdnB0YnV0YWR0cmpyY2VucW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjYxMzUsImV4cCI6MjEwNTY0MjEzNX0.D8-gkvPbMyCvDKbAUrMJ_59kMvggXgFPPCnkAza6s8g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Initiates Supabase Google OAuth Flow
 * Redirects the patient to Google Sign-In and returns to the dashboard
 */
export const signInWithGoogle = async (redirectTo?: string) => {
  const targetUrl = redirectTo || `${window.location.origin}/dashboard`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Supabase Google Auth Error:", error);
    throw error;
  }

  return data;
};

/**
 * Checks current active Supabase user/session
 */
export const getCurrentSupabaseUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch (err) {
    console.error("Failed to fetch Supabase session:", err);
    return null;
  }
};
