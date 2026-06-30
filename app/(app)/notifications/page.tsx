import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";
import Link from "next/link";

type RawNotif = {
  id: string;
  type: "reaction" | "encouragement";
  actor_id: string | null;
  event_id: string | null;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
  actor: { username: string; avatar_url: string | null } | null;
};

const REACTION_EMOJI: Record<string, string> = {
  bravo:     "👏",
  force:     "🔥",
  coeur:     "❤️",
  applaudir: "🙌",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return "à l'instant";
  if (min < 60)  return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7)     return `il y a ${d} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function notifText(n: RawNotif): string {
  const who = n.actor?.username ?? "Quelqu'un";
  if (n.type === "encouragement") {
    return `${who} t'a envoyé un encouragement`;
  }
  const emoji = REACTION_EMOJI[(n.payload.reaction_type as string) ?? ""] ?? "🙏";
  return `${who} a réagi ${emoji} à l'un de tes progrès`;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch notifications with actor profile (bypassing TypeScript join inference)
  const { data: rawData } = await (supabase
    .from("notifications")
    .select(`
      id, type, actor_id, event_id, payload, read, created_at,
      actor:profiles!actor_id (username, avatar_url)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50) as unknown as Promise<{ data: RawNotif[] | null; error: unknown }>);

  const notifs = rawData ?? [];

  // Mark all as read (fire and forget — revalidates on next navigation)
  if (notifs.some((n) => !n.read)) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    revalidatePath("/", "layout");
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Soutien</p>
        <h1
          className="mt-1 font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Notifications
        </h1>
      </header>

      {notifs.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed p-14 text-center"
          style={{ borderColor: "rgba(255,255,255,0.09)" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[18px]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Bell size={24} className="text-muted" />
          </div>
          <div>
            <p className="font-display font-semibold">Tout calme pour l&apos;instant</p>
            <p className="mt-1 text-[13px] text-muted">
              Tes amis te soutiendront bientôt.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifs.map((n) => (
            <Link
              key={n.id}
              href={n.actor_id ? `/profil/${n.actor_id}` : "/profil"}
              className="flex items-center gap-4 rounded-[16px] px-4 py-4 transition-opacity hover:opacity-90"
              style={{
                background: n.read ? "rgba(255,255,255,0.02)" : "rgba(203,139,106,0.06)",
                border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : "rgba(203,139,106,0.18)"}`,
              }}
              aria-label={`Voir le profil de ${n.actor?.username ?? "cet utilisateur"}`}
            >
              {/* Actor avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold"
                style={{ background: "rgba(203,139,106,0.15)", color: "var(--color-primary)" }}
              >
                {n.actor?.username?.charAt(0).toUpperCase() ?? "?"}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug">{notifText(n)}</p>
                {n.type === "encouragement" && typeof n.payload.message === "string" && (
                  <p
                    className="mt-1 text-[12px] italic"
                    style={{ color: "var(--color-muted)" }}
                  >
                    &ldquo;{n.payload.message}&rdquo;
                  </p>
                )}
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
                  {timeAgo(n.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
