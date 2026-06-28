"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function GroupActions({
  groupId, inviteCode, isOwner, memberCount,
}: { groupId: string; inviteCode: string; isOwner: boolean; memberCount: number }) {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function addMember() {
    if (!username.trim()) return;
    setMsg(null);
    const { error } = await supabase.rpc("add_member_by_username", {
      p_group: groupId, p_username: username.trim(),
    });
    if (error) return setMsg(error.message);
    setUsername("");
    setMsg("Membre ajouté ✓");
    router.refresh();
  }

  async function leave() {
    if (!confirm("Quitter ce groupe ?")) return;
    const { error } = await supabase.rpc("leave_group", { p_group: groupId });
    if (error) return setMsg(error.message);
    router.push("/groupes");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">
            Code d'invitation · {memberCount} membre{memberCount > 1 ? "s" : ""}
          </p>
          <p className="font-mono text-lg tracking-widest text-orange-300">{inviteCode}</p>
        </div>
        <button
          onClick={copyCode}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>

      {isOwner && (
        <div className="flex gap-2 border-t border-neutral-800 pt-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ajouter par pseudo…"
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          <button
            onClick={addMember}
            className="rounded-lg bg-orange-600 px-4 text-sm font-medium hover:bg-orange-500"
          >
            Ajouter
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        {msg && <p className="text-xs text-neutral-400">{msg}</p>}
        {!isOwner && (
          <button onClick={leave} className="ml-auto text-xs text-neutral-500 hover:text-red-300">
            Quitter le groupe
          </button>
        )}
      </div>
    </div>
  );
}