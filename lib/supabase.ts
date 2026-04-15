import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for general use (respects RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Client with Service Role Key (bypasses RLS)
 * Use only for administrative tasks or internal processing
 * as this app is a feature proposal / prototype without authentication.
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(supabaseUrl, serviceRoleKey)
  : null;

// -------------------------------------------------------
// Connection check — call this in a Server Component
// Stripped automatically in production via removeConsole
// -------------------------------------------------------
export async function checkSupabaseConnection(): Promise<void> {
  // Only execute on server
  if (typeof window !== "undefined") return;

  try {
    const { error } = await supabase
      .from("contract")
      .select("contract_id")
      .limit(1);

    if (error) {
      console.error(
        "Supabase connection error details:",
        JSON.stringify(error, null, 2),
      );
      throw new Error(error.message || "Unknown Supabase error");
    }
    console.log("Supabase connected successfully:", supabaseUrl);
  } catch (err: any) {
    console.error(
      "Supabase connection failed:",
      err?.message || err || "Unknown error",
    );
  }
}
