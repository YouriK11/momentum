"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, UserMinus, Trash2, UserPlus, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface GroupMember {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

interface Props {
  groupId: string;
  groupName: string;
  inviteCode: string;
  isOwner: boolean;
  members: GroupMember[];
  meId: string;
}

export function GroupActions({ groupId, groupName, inviteCode, isOwner, members, meId }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [username,    setUsername]    = useState("");
  const [busy,        setBusy]        = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [removing,    setRemoving]    = useState<string | null>(null);

  // ── Copier le code ──────────────────────────────────────────────────────────
  function copyCode() {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Ajouter un membre ───────────────────────────────────────────────────────
  async function addMember() {
    const name = username.trim();
    if (!name) return;
    setBusy(true);
    const { error } = await supabase.rpc("add_member_by_username", {
      p_group: groupId, p_username: name,
    });
    setBusy(false);
    if (error) {
      toast(error.message === "user_not_found"
        ? `Aucun utilisateur avec le pseudo « ${name} ».`
        : `Impossible d'ajouter ce membre : ${error.message}`, "error");
      return;
    }
    setUsername("");
    toast(`${name} a été ajouté au groupe.`, "success");
    router.refresh();
  }

  // ── Quitter le groupe ───────────────────────────────────────────────────────
  async function leave() {
    setBusy(true);
    const { error } = await supabase.rpc("leave_group", { p_group: groupId });
    setBusy(false);
    if (error) { toast(`Erreur : ${error.message}`, "error"); return; }
    router.push("/groupes");
  }

  // ── Retirer un membre ───────────────────────────────────────────────────────
  async function removeMember(userId: string, name: string) {
    setRemoving(userId);
    const { error } = await supabase.rpc("remove_member", {
      p_group: groupId, p_user: userId,
    });
    setRemoving(null);
    if (error) { toast(`Impossible de retirer ce membre : ${error.message}`, "error"); return; }
    toast(`${name} a été retiré du groupe.`, "success");
    router.refresh();
  }

  // ── Supprimer le groupe ─────────────────────────────────────────────────────
  async function deleteGroup() {
    setBusy(true);
    const { error } = await supabase.rpc("delete_group", { p_group: groupId });
    setBusy(false);
    setShowDelete(false);
    if (error) { toast(`Impossible de supprimer le groupe : ${error.message}`, "error"); return; }
    router.push("/groupes");
  }

  return (
    <>
      <div className="card flex flex-col gap-5 p-6">

        {/* Code d'invitation */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Code d'invitation · {members.length} membre{members.length > 1 ? "s" : ""}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="flex-1 rounded-[10px] px-4 py-2.5 font-mono text-lg tracking-[0.15em] text-primary"
              style={{ background: "var(--color-surface-2)", border: "1px solid rgba(252,82,0,0.2)" }}
            >
              {inviteCode}
            </span>
            <Button variant="outline" onClick={copyCode} className="shrink-0 gap-2">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
        </div>

        {/* Ajouter un membre (owner) */}
        {isOwner && (
          <div className="border-t border-border pt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Ajouter par pseudo
            </p>
            <div className="flex gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                placeholder="@pseudo"
                className="auth-input flex-1 px-4"
                aria-label="Pseudo du membre à ajouter"
              />
              <Button onClick={addMember} disabled={busy || !username.trim()} className="shrink-0">
                <UserPlus size={14} />
                Ajouter
              </Button>
            </div>
          </div>
        )}

        {/* Liste des membres (owner peut retirer) */}
        {members.length > 0 && (
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Membres
            </p>
            <ul className="flex flex-col gap-2" role="list">
              {members.map((m) => (
                <li
                  key={m.userId}
                  className="flex items-center gap-3 rounded-[12px] px-3 py-2"
                  style={{ background: "var(--color-surface-2)" }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(252,82,0,0.15)",
                      color: "var(--color-primary)",
                    }}
                    aria-hidden
                  >
                    {m.username[0]?.toUpperCase()}
                  </span>
                  <span className="flex-1 text-[14px] font-medium">
                    {m.username}
                    {m.userId === meId && (
                      <span className="ml-2 text-[11px] text-muted">(toi)</span>
                    )}
                  </span>
                  {isOwner && m.userId !== meId && (
                    <button
                      onClick={() => removeMember(m.userId, m.username)}
                      disabled={removing === m.userId}
                      aria-label={`Retirer ${m.username} du groupe`}
                      className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions footer */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          {!isOwner && (
            <Button variant="ghost" onClick={leave} disabled={busy} className="text-danger hover:text-danger">
              Quitter le groupe
            </Button>
          )}
          {isOwner && (
            <Button
              variant="danger"
              onClick={() => setShowDelete(true)}
              className="ml-auto gap-2"
            >
              <Trash2 size={14} />
              Supprimer le groupe
            </Button>
          )}
        </div>
      </div>

      {/* Modale de confirmation suppression */}
      <AnimatePresence>
        {showDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70"
              style={{ backdropFilter: "blur(4px)" }}
              onClick={() => setShowDelete(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              className="card fixed left-1/2 top-1/2 z-50 w-[min(90vw,400px)] -translate-x-1/2 -translate-y-1/2 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(236,100,128,0.12)" }}>
                <AlertTriangle size={22} style={{ color: "var(--color-danger)" }} />
              </div>
              <h2 id="delete-dialog-title" className="font-display text-lg font-black">
                Supprimer « {groupName} » ?
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                Cette action est définitive. Le groupe et ses habitudes communes seront supprimés pour tous les membres.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDelete(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={deleteGroup}
                  disabled={busy}
                  className="flex-1"
                >
                  {busy ? "Suppression…" : "Supprimer"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
