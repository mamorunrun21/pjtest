import { createClient } from '@supabase/supabase-js';

const isValidHttpUrl = (str: string) => {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL' && isValidHttpUrl(supabaseUrl) && supabaseAnonKey);

let clientInstance = null;
if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Supabase client failed to initialize:', error);
  }
}

export const supabase = clientInstance;

