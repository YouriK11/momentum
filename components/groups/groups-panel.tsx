"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Users, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";

type Group = { id: string; name: string; description: string | null };

export function GroupsPanel({ groups }: { groups: Group[] }) {
  const router   = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [name,  setName]  = useState("");
  const [code,  setCode]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createGroup() {
    if (!name.trim()) return setError("Donne un nom au groupe.");
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("create_group", { p_name: name.trim() });
    setBusy(false);
    if (error) { setError(error.message); return; }
    toast("Groupe créé !", "success");
    router.push(`/groupes/${data}`);
  }

  async function joinGroup() {
    if (!code.trim()) return setError("Entre un code d'invitation.");
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("join_group_by_code", { p_code: code.trim() });
    setBusy(false);
    if (error) { setError(error.message); return; }
    toast("Groupe rejoint !", "success");
    router.push(`/groupes/${data}`);
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Actions — grille 2 colonnes ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Créer un groupe */}
        <div
          className="card flex flex-col gap-6 p-8"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(252,82,0,0.06) 0%, transparent 60%)",
          }}
        >
          <div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[14px]"
              style={{
                background: "rgba(252,82,0,0.12)",
                border: "1px solid rgba(252,82,0,0.22)",
                boxShadow: "0 0 18px rgba(252,82,0,0.15)",
              }}
            >
              <Plus size={22} style={{ color: "var(--color-primary)" }} />
            </div>
            <h2 className="mt-4 font-display text-xl font-black tracking-tight">
              Créer un groupe
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Nomme ton cercle et invite tes amis avec un code unique.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createGroup()}
              placeholder="Ex. Les warriors"
              className="auth-input"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={createGroup}
              disabled={busy}
              className="auth-submit group"
            >
              {busy ? "Création…" : (
                <>
                  Créer le groupe
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Rejoindre avec un code */}
        <div
          className="card flex flex-col gap-6 p-8"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(55,201,126,0.05) 0%, transparent 60%)",
          }}
        >
          <div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[14px]"
              style={{
                background: "rgba(55,201,126,0.12)",
                border: "1px solid rgba(55,201,126,0.22)",
              }}
            >
              <Users size={22} style={{ color: "var(--color-success)" }} />
            </div>
            <h2 className="mt-4 font-display text-xl font-black tracking-tight">
              Rejoindre avec un code
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Ton ami t&apos;a partagé un code d&apos;invitation ? Entre-le ici.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinGroup()}
              placeholder="Ex. A1B2C3"
              className="auth-input"
              style={{ letterSpacing: "0.1em" }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={joinGroup}
              disabled={busy}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[15px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55"
              style={{
                background: "rgba(55,201,126,0.1)",
                border: "1px solid rgba(55,201,126,0.22)",
                color: "var(--color-success)",
              }}
            >
              {busy ? "Recherche…" : (
                <>
                  Rejoindre le groupe
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Erreur globale ─────────────────────────────────────────────── */}
      {error && (
        <p
          className="rounded-[12px] px-5 py-3.5 text-[14px] font-medium"
          style={{
            background: "rgba(236,100,128,0.1)",
            border: "1px solid rgba(236,100,128,0.2)",
            color: "var(--color-danger)",
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      {/* ── Liste des groupes ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Tes groupes
          </p>
          <span
            className="rounded-[6px] px-2 py-0.5 text-[11px] font-black tabular-nums"
            style={{ background: "rgba(252,82,0,0.12)", color: "var(--color-primary)" }}
          >
            {groups.length}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/groupes/${g.id}`}
                className="card-interactive flex items-center gap-5 p-5"
              >
                {/* Group avatar */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] font-display text-lg font-black"
                  style={{
                    background: "rgba(252,82,0,0.1)",
                    border: "1px solid rgba(252,82,0,0.15)",
                    color: "var(--color-primary)",
                  }}
                >
                  {g.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug">{g.name}</p>
                  {g.description ? (
                    <p className="mt-0.5 truncate text-[13px] text-muted">{g.description}</p>
                  ) : (
                    <p className="mt-0.5 text-[13px] text-muted">Voir le classement →</p>
                  )}
                </div>

                <ChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            </motion.div>
          ))}

          {groups.length === 0 && (
            <div
              className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed p-12 text-center"
              style={{ borderColor: "rgba(255,255,255,0.09)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Users size={24} className="text-muted" />
              </div>
              <div>
                <p className="font-semibold">Aucun groupe pour l&apos;instant</p>
                <p className="mt-1 text-[14px] text-muted">
                  Crée ton premier groupe ou rejoins-en un avec un code.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
