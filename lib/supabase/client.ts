import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// createBrowserClient gère déjà un singleton : pas de risque de doublon.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}