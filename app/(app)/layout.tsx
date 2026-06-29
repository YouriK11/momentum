import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase.from("profiles").select("username,avatar_url").eq("id", userId).single(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false),
  ]);

  return (
    <ToastProvider>
      <AppShell
        username={profile?.username ?? "toi"}
        avatarUrl={profile?.avatar_url ?? null}
        unreadCount={unreadCount ?? 0}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
