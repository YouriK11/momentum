"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Users, ChevronRight, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";

type Group = { id: string; name: string; description: string | null };

export function GroupsPanel({ groups }: { groups: Group[] }) {
  const router   = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [name,     setName]     = useState("");
  const [code,     setCode]     = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [expanded, setExpanded] = useState(groups.length === 0);

  async function createGroup() {
    if (!name.trim()) return setError("Donne un nom au groupe.");
    setBusy(true); setError(null);
    const { data, error } = await supabase.rpc("create_group", { p_name: name.trim() });
    setBusy(false);
    if (error) { setError(error.message); return; }
    toast("Groupe créé !", "success");
    router.push(`/groupes/${data}`);
  }

  async function joinGroup() {
    if (!code.trim()) return setError("Entre un code d'invitation.");
    setBusy(true); setError(null);
    const { data, error } = await supabase.rpc("join_group_by_code", { p_code: code.trim() });
    setBusy(false);
    if (error) { setError(error.message); return; }
    toast("Groupe rejoint !", "success");
    router.push(`/groupes/${data}`);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── 1. Tes groupes — en premier ────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Tes groupes
          </p>
          <span
            className="rounded-[6px] px-2 py-0.5 text-[11px] font-semibold tabular-nums"
            style={{ background: "rgba(203,139,106,0.12)", color: "var(--color-primary)" }}
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
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] font-display text-lg font-semibold"
                  style={{
                    background: "rgba(203,139,106,0.1)",
                    border: "1px solid rgba(203,139,106,0.15)",
                    color: "var(--color-primary)",
                  }}
                >
                  {g.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug">{g.name}</p>
                  <p className="mt-0.5 truncate text-[13px] text-muted">
                    {g.description ?? "Voir le classement →"}
                  </p>
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
                  Crée ton premier cercle ou rejoins-en un avec un code.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Créer / Rejoindre — secondaire ──────────────────────────── */}
      <section className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 self-start text-[13px] font-medium text-muted transition-colors hover:text-foreground"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} />
          </motion.span>
          {expanded ? "Masquer" : (groups.length === 0 ? "Créer ou rejoindre un groupe" : "Nouveau groupe ou code")}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="forms"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-1">

                {error && (
                  <p
                    className="rounded-[12px] px-5 py-3.5 text-[14px] font-medium"
                    style={{
                      background: "rgba(207,139,136,0.1)",
                      border: "1px solid rgba(207,139,136,0.2)",
                      color: "var(--color-danger)",
                    }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                  {/* Créer un groupe */}
                  <div
                    className="card flex flex-col gap-4 p-6"
                    style={{ backgroundImage: "linear-gradient(135deg, rgba(203,139,106,0.06) 0%, transparent 60%)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                        style={{ background: "rgba(203,139,106,0.12)", border: "1px solid rgba(203,139,106,0.22)" }}
                      >
                        <Plus size={18} style={{ color: "var(--color-primary)" }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold">Créer un groupe</p>
                        <p className="text-[12px] text-muted">Invite tes amis avec un code.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createGroup()}
                        placeholder="Ex. Mes amis"
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
                            Créer
                            <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Rejoindre avec un code */}
                  <div
                    className="card flex flex-col gap-4 p-6"
                    style={{ backgroundImage: "linear-gradient(135deg, rgba(143,170,126,0.05) 0%, transparent 60%)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                        style={{ background: "rgba(143,170,126,0.12)", border: "1px solid rgba(143,170,126,0.22)" }}
                      >
                        <Users size={18} style={{ color: "var(--color-success)" }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold">Rejoindre avec un code</p>
                        <p className="text-[12px] text-muted">Entre le code d&apos;un ami.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
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
                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[14px] font-semibold transition-all disabled:opacity-55"
                        style={{
                          background: "rgba(143,170,126,0.1)",
                          border: "1px solid rgba(143,170,126,0.22)",
                          color: "var(--color-success)",
                        }}
                      >
                        {busy ? "Recherche…" : (
                          <>
                            Rejoindre
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </div>
  );
}
