import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient gère déjà un singleton : pas de risque de doublon.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}