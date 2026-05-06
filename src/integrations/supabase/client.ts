import { createClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    supabase?: ReturnType<typeof createClient>;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Казваме му: "Търси ANON_KEY, но ако не го намериш, вземи PUBLISHABLE_KEY"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// само за development: да можем да дебъгваме от DevTools
if (import.meta.env.DEV) {
    window.supabase = supabase;
  }
