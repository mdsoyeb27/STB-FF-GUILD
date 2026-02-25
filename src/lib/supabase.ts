import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for development if keys are not set yet
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co';

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const useSupabase = () => {
  if (!supabase) {
    console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }
  return supabase;
};
