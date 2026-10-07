import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Admin client with full service privileges (bypasses RLS on backend to securely fetch hidden testcases & record progress)
export const supabaseAdmin = createClient(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || 'placeholder_key', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Standard client with anon key
export const supabaseClient = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY || 'placeholder_key'
);

