"use client";

import { useState } from "react";
import { X, Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { sendEncouragement } from "@/app/(app)/home/actions";
import { useToast } from "@/components/ui/toast";

// ── Activity line ─────────────────────────────────────────────────────────────
function activityText(friends: { username: string }[]): string {
  if (friends.length === 0) return "";
  if (friends.length === 1) return `${friends[0].username} a déjà avancé aujourd'hui.`;
  if (friends.length === 2) return `${friends[0].username} et ${friends[1].username} ont avancé aujourd'hui.`;
  return `${friends[0].username}, ${friends[1].username} et ${friends.length - 2} autre${friends.length - 2 > 1 ? "s" : ""} ont avancé aujourd'hui.`;
}

// ── Encouragement sheet ───────────────────────────────────────────────────────
type GroupMember = { user_id: string; username: string; avatar_url: string | null };

function EncourageSheet({
  currentUserId,
  onClose,
}: {
  currentUserId: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const supabase = createClient();

  const [members, setMembers]   = useState<GroupMember[] | null>(null);
  const [selected, setSelected] = useState<GroupMember | null>(null);
  const [message, setMessage]   = useState("");
  const [busy, setBusy]         = useState(false);

  // Lazy-load group members when sheet opens
  useState(() => {
    (async () => {
      type RawMember = { user_id: string; member: { username: string; avatar_url: string | null } | null };
      const { data } = await (supabase
        .from("group_members")
        .select("user_id, member:profiles!user_id (username, avatar_url)")
        .neq("user_id", currentUserId) as unknown as Promise<{ data: RawMember[] | null; error: unknown }>);

      if (!data) { setMembers([]); return; }

      // Deduplicate
      const seen = new Set<string>();
      const unique: GroupMember[] = [];
      for (const r of data) {
        if (!seen.has(r.user_id) && r.member) {
          seen.add(r.user_id);
          unique.push({ user_id: r.user_id, username: r.member.username, avatar_url: r.member.avatar_url });
        }
      }
      setMembers(unique);
    })();
  });

  async function send() {
    if (!selected) return;
    setBusy(true);
    const { error } = await sendEncouragement(selected.user_id, message || undefined);
    setBusy(false);
    if (error) { toast(error, "error"); return; }
    toast(`Encouragement envoyé à ${selected.username} 💙`, "success");
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/60"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px]"
        style={{
          background: "var(--color-surface)",
          backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 40%)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 -24px 80px rgba(0,0,0,0.8)",
          paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-start justify-between px-5 pt-3 pb-5">
          <div>
            <h2 className="font-display text-lg font-semibold">Envoyer un soutien</h2>
            <p className="mt-0.5 text-[13px] text-muted">Un petit mot qui compte.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-2">
          {/* Member picker */}
          {members === null ? (
            <p className="text-[13px] text-muted">Chargement…</p>
          ) : members.length === 0 ? (
            <p className="text-[13px] text-muted">Aucun ami dans tes groupes pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.user_id}
                  onClick={() => setSelected(m)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all"
                  style={{
                    background: selected?.user_id === m.user_id ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
                    color: selected?.user_id === m.user_id ? "#fff" : "var(--color-foreground)",
                    border: `1px solid ${selected?.user_id === m.user_id ? "transparent" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    {m.username.charAt(0).toUpperCase()}
                  </span>
                  {m.username}
                </button>
              ))}
            </div>
          )}

          {/* Optional message */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Message (optionnel)
            </label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Continue comme ça 💙"
              maxLength={120}
              className="w-full rounded-[13px] border px-4 py-3 text-[14px] outline-none focus:border-primary/50"
              style={{
                background: "var(--color-surface-2)",
                borderColor: "rgba(255,255,255,0.07)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={send}
            disabled={!selected || busy}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] py-4 text-[15px] font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--color-primary)" }}
          >
            <Send size={15} />
            {busy ? "Envoi…" : "Envoyer le soutien"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── FriendActivityBar ─────────────────────────────────────────────────────────
interface Props {
  friends: { username: string; user_id: string }[];
  currentUserId: string;
}

export function FriendActivityBar({ friends, currentUserId }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (friends.length === 0) return null;

  return (
    <>
      <div
        className="flex items-center justify-between gap-4 rounded-[16px] px-4 py-3"
        style={{
          background: "rgba(143,170,126,0.07)",
          border: "1px solid rgba(143,170,126,0.18)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Heart size={14} style={{ color: "var(--color-success)", flexShrink: 0 }} />
          <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>
            {activityText(friends)}
          </p>
        </div>

        <button
          onClick={() => setSheetOpen(true)}
          className="shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold transition-all hover:opacity-80"
          style={{
            background: "rgba(143,170,126,0.18)",
            color: "var(--color-success)",
          }}
        >
          Encourager
        </button>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <EncourageSheet
            currentUserId={currentUserId}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
