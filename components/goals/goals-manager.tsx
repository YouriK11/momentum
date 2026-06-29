"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createGoal, updateGoalProgress, markGoalDone } from "@/app/(app)/objectifs/actions";
import type { Goal } from "@/lib/types";

type Props = { goals: Goal[] };

export function GoalsManager({ goals: initialGoals }: Props) {
  const [goals,   setGoals]   = useState<Goal[]>(initialGoals);
  const [isOpen,  setIsOpen]  = useState(false);
  const { toast } = useToast();

  function onCreated(g: Goal) {
    setGoals((prev) => [g, ...prev]);
    setIsOpen(false);
  }

  function onUpdated(id: string, currentValue: number) {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, current_value: currentValue } : g));
  }

  function onDone(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast("Objectif atteint — bien joué !", "success");
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-[18px] border border-dashed px-6 py-5 text-left"
          style={{ borderColor: "rgba(203,139,106,0.25)", background: "rgba(203,139,106,0.04)" }}
        >
          <span className="flex items-center gap-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary"
              style={{ boxShadow: "none" }}
            >
              <Plus size={18} className="text-white" />
            </span>
            <div>
              <span className="text-[15px] font-semibold text-foreground">Nouvel objectif</span>
              <p className="text-[13px] text-muted">Définis une cible mesurable</p>
            </div>
          </span>
        </motion.button>

        {/* Goals list */}
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center gap-3 p-12 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(203,139,106,0.1)" }}>
              <Target size={24} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="font-display font-bold">Pas encore d&apos;objectif</p>
              <p className="mt-1 text-sm text-muted">Crée ton premier objectif pour suivre ta progression.</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {goals.map((g, i) => (
              <GoalCard
                key={g.id} goal={g} index={i}
                onUpdated={onUpdated}
                onDone={onDone}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add goal sheet */}
      <AddGoalSheet isOpen={isOpen} onClose={() => setIsOpen(false)} onCreated={onCreated} />
    </>
  );
}

// ── GoalCard ──────────────────────────────────────────────────────────────────
function GoalCard({ goal: g, index, onUpdated, onDone }: {
  goal: Goal; index: number;
  onUpdated: (id: string, v: number) => void;
  onDone: (id: string) => void;
}) {
  const { toast } = useToast();
  const [editing,   setEditing]   = useState(false);
  const [inputVal,  setInputVal]  = useState(String(g.current_value));
  const [busy,      setBusy]      = useState(false);

  const pct      = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
  const isComplete = pct >= 100;

  const deadlineLabel = g.deadline
    ? new Date(g.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : null;

  async function saveProgress() {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0) { toast("Valeur invalide.", "error"); return; }
    setBusy(true);
    const { error } = await updateGoalProgress(g.id, val);
    setBusy(false);
    if (error) { toast("Impossible de mettre à jour.", "error"); return; }
    onUpdated(g.id, val);
    setEditing(false);
    if (val >= g.target_value) {
      const { error: doneErr } = await markGoalDone(g.id);
      if (!doneErr) onDone(g.id);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -64, transition: { duration: 0.22 } }}
      className="card flex flex-col gap-4 p-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: "rgba(203,139,106,0.12)" }}
        >
          <Target size={18} style={{ color: "var(--color-primary)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">{g.title}</p>
          {deadlineLabel && (
            <p className="mt-0.5 text-[12px] text-muted">Échéance : {deadlineLabel}</p>
          )}
        </div>
        <span
          className="shrink-0 rounded-[9px] px-2.5 py-1 text-[12px] font-bold tabular-nums"
          style={{
            background: isComplete ? "rgba(143,170,126,0.15)" : "rgba(203,139,106,0.1)",
            color:      isComplete ? "var(--color-success)"  : "var(--color-primary)",
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 16 }}
          style={{
            background: isComplete ? "var(--color-success)" : "var(--color-primary)",
            boxShadow:  "none",
          }}
        />
      </div>

      {/* Values + action */}
      <div className="flex items-center justify-between">
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveProgress(); if (e.key === "Escape") setEditing(false); }}
              className="w-24 rounded-[10px] border px-3 py-1.5 text-sm outline-none focus:border-primary/50"
              style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.1)", color: "var(--color-foreground)" }}
              autoFocus
            />
            {g.unit && <span className="text-[13px] text-muted">{g.unit}</span>}
            <Button onClick={saveProgress} disabled={busy} className="ml-1 h-8 px-3 text-xs">
              {busy ? "…" : <Check size={12} />}
            </Button>
            <button onClick={() => setEditing(false)} className="ml-1 text-muted hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <span className="text-[13px] text-muted">
              <span className="font-semibold tabular-nums" style={{ color: "var(--color-foreground)" }}>
                {g.current_value}
              </span>
              {" / "}{g.target_value}{g.unit ? ` ${g.unit}` : ""}
            </span>
            <button
              onClick={() => { setInputVal(String(g.current_value)); setEditing(true); }}
              className="text-[12px] font-medium text-muted underline-offset-2 hover:text-primary hover:underline"
            >
              Mettre à jour
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── AddGoalSheet ──────────────────────────────────────────────────────────────
function AddGoalSheet({ isOpen, onClose, onCreated }: {
  isOpen: boolean; onClose: () => void; onCreated: (g: Goal) => void;
}) {
  const { toast } = useToast();
  const [title,    setTitle]    = useState("");
  const [target,   setTarget]   = useState("");
  const [unit,     setUnit]     = useState("");
  const [deadline, setDeadline] = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  function reset() { setTitle(""); setTarget(""); setUnit(""); setDeadline(""); setError(null); }
  function handleClose() { reset(); onClose(); }

  async function create() {
    if (!title.trim()) { setError("Donne un titre à l'objectif."); return; }
    const tv = parseFloat(target);
    if (isNaN(tv) || tv <= 0) { setError("La valeur cible doit être un nombre positif."); return; }
    setBusy(true); setError(null);

    const result = await createGoal({
      title:       title.trim(),
      targetValue: tv,
      unit:        unit.trim() || null,
      deadline:    deadline || null,
    });

    setBusy(false);
    if (result.error) { setError(result.error); return; }

    // Optimistic : construire le Goal localement pour mise à jour instantanée
    onCreated({
      id:            crypto.randomUUID(),
      user_id:       "",
      title:         title.trim(),
      target_value:  tv,
      current_value: 0,
      unit:          unit.trim() || null,
      deadline:      deadline || null,
      is_done:       false,
      created_at:    new Date().toISOString(),
    });
    toast("Objectif créé.", "success");
    reset();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-black/65"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 275, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px]"
            style={{
              background: "var(--color-surface)",
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 40%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 -32px 96px -8px rgba(0,0,0,0.85)",
              paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 pb-5 pt-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Nouvel objectif</h2>
                <p className="mt-0.5 text-xs text-muted">Qu'est-ce que tu veux atteindre ?</p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5 px-5 pb-2">
              <GField label="Titre">
                <input
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Courir 100 km ce mois-ci"
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
                  style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                />
              </GField>

              <div className="grid grid-cols-2 gap-3">
                <GField label="Cible">
                  <input
                    type="number" value={target} onChange={(e) => setTarget(e.target.value)}
                    placeholder="100"
                    className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
                    style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                  />
                </GField>
                <GField label="Unité" hint="optionnel">
                  <input
                    value={unit} onChange={(e) => setUnit(e.target.value)}
                    placeholder="km, livres…"
                    className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
                    style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                  />
                </GField>
              </div>

              <GField label="Échéance" hint="optionnel">
                <input
                  type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
                  style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                />
              </GField>

              {error && (
                <p className="rounded-[10px] px-4 py-3 text-sm font-medium"
                  style={{ background: "rgba(207,139,136,0.12)", color: "var(--color-danger)", border: "1px solid rgba(207,139,136,0.2)" }}>
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={create} disabled={busy}
                className="w-full rounded-[14px] py-4 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: "var(--color-primary)" }}
              >
                {busy ? "Création…" : "Créer l'objectif"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function GField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</label>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
