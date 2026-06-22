import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// When Supabase env vars are absent the app runs in "demo mode": the login
// screen lets you jump straight into a dashboard and the backend should be run
// with AUTH_ENABLED=false.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
