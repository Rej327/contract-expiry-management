import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for general use (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Client with Service Role Key (bypasses RLS)
 * Use only for administrative tasks or internal processing
 * as this app is a feature proposal / prototype without authentication.
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey) 
  : null;
