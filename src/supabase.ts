import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig =
  typeof supabaseUrl === "string" &&
  supabaseUrl.length > 0 &&
  typeof supabasePublicKey === "string" &&
  supabasePublicKey.length > 0;

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabasePublicKey as string, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  : null;
