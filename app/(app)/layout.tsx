import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("username,avatar_url").eq("id", userId).single();

  return (
    <ToastProvider>
      <AppShell username={profile?.username ?? "toi"} avatarUrl={profile?.avatar_url ?? null}>
        {children}
      </AppShell>
    </ToastProvider>
  );
}