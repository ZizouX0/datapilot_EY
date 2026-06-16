import { createClient } from '@supabase/supabase-js';

// Public, browser-safe values. The anon key is meant to be exposed — Row Level
// Security on the database (not key secrecy) is what protects the data. The
// service_role key must NEVER live in the frontend; keep it server-side only.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lets the UI degrade gracefully (show a setup notice) instead of white-screening
// when a teammate runs the app before the Supabase env vars are configured.
export const isSupabaseConfigured = Boolean(url && anonKey);

// When unconfigured we still create a client with harmless placeholders so that
// importing this module never throws; calls simply fail and are handled in the UI.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
