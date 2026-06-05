import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Fail fast: Agar .env file mein credentials nahi hain, toh app ko error batana chahiye
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials! Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file.");
}

// Create and export the single Supabase client instance
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co', 
  supabaseAnonKey || 'missing-key'
);

export default supabase;
