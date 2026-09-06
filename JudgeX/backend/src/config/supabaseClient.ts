import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder_anon_key';

// Admin client with full service privileges (bypasses RLS on backend)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Standard client with anon key
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
