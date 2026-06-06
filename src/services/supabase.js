import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail fast: Agar .env file mein credentials nahi hain, toh app ko error batana chahiye
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials.");
}

// Create and export the single Supabase client instance
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;
