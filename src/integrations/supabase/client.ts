import { createClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    supabase?: unknown;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

if (import.meta.env.DEV) {
  window.supabase = supabase;
}
