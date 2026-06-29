"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Flame, ListChecks, Target, CalendarDays, Trash2, PartyPopper } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createGoalV2, celebrateGoal, deleteGoal } from "@/app/(app)/objectifs/actions";
import type { Habit, GoalType, GoalV2 } from "@/lib/types";

// ── Goal type definitions ──────────────────────────────────────────────────────
const GOAL_TYPES: {
  type: GoalType;
  icon: React.ReactNode;
  label: string;
  description: string;
  needsHabit: boolean;
  unitLabel: (n: number, habitName?: string | null) => string;
  periodLabel: string;
}[] = [
  {
    type: "count_week",
    icon: <ListChecks size={18} />,
    label: "X fois cette semaine",
    description: "Faire une habitude un nombre de fois par semaine.",
    needsHabit: true,
    unitLabel: (n, h) => `${h ?? "l'habitude"} ${n} fois cette semaine`,
    periodLabel: "cette semaine",
  },
  {
    type: "count_month",
    icon: <CalendarDays size={18} />,
    label: "X fois ce mois",
    description: "Faire une habitude un nombre de fois dans le mois.",
    needsHabit: true,
    unitLabel: (n, h) => `${h ?? "l'habitude"} ${n} fois ce mois`,
    periodLabel: "ce mois",
  },
  {
    type: "streak",
    icon: <Flame size={18} />,
    label: "Série de X jours",
    description: "Tenir une série active pendant X jours consécutifs.",
    needsHabit: false,
    unitLabel: (n) => `Tenir une série de ${n} jours`,
    periodLabel: "consécutifs",
  },
  {
    type: "active_days_month",
    icon: <Target size={18} />,
    label: "Actif X jours ce mois",
    description: "Avoir un score positif au moins X jours dans le mois.",
    needsHabit: false,
    unitLabel: (n) => `Être actif ${n} jours ce mois`,
    periodLabel: "ce mois",
  },
];

const GOAL_TYPE_META = Object.fromEntries(GOAL_TYPES.map((g) => [g.type, g])) as Record<
  GoalType,
  typeof GOAL_TYPES[0]
>;

// ── GoalCard ──────────────────────────────────────────────────────────────────
function GoalCard({
  goal,
  index,
  onDone,
  onDeleted,
}: {
  goal: GoalV2;
  index: number;
  onDone: (id: string) => void;
  onDeleted: (id: string) => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const meta = GOAL_TYPE_META[goal.goal_type];
  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
  const isComplete = pct >= 100;

  async function handleCelebrate() {
    setBusy(true);
    const { error } = await celebrateGoal(goal.id);
    setBusy(false);
    if (error) { toast(error, "error"); return; }
    onDone(goal.id);
    toast("Objectif atteint — bien joué ! 🎉", "success");
  }

  async function handleDelete() {
    setBusy(true);
    const { error } = await deleteGoal(goal.id);
    setBusy(false);
    if (error) { toast(error, "error"); return; }
    onDeleted(goal.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -64, transition: { duration: 0.22 } }}
      className="card relative overflow-hidden flex flex-col gap-4 p-5"
      style={{
        backgroundImage: isComplete
          ? "linear-gradient(135deg, rgba(143,170,126,0.07) 0%, transparent 60%)"
          : undefined,
      }}
    >
      {/* Shine line when complete */}
      {isComplete && (
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(143,170,126,0.4), transparent)" }} />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]"
          style={{
            background: isComplete ? "rgba(143,170,126,0.15)" : "rgba(203,139,106,0.12)",
            color: isComplete ? "var(--color-success)" : "var(--color-primary)",
          }}
        >
          {meta.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">{goal.title}</p>
          {goal.habit_name && (
            <p className="mt-0.5 text-[12px]" style={{ color: "var(--color-muted)" }}>
              {goal.habit_name}
            </p>
          )}
        </div>

        {/* Percentage badge */}
        <span
          className="shrink-0 rounded-[8px] px-2 py-0.5 text-[12px] font-bold tabular-nums"
          style={{
            background: isComplete ? "rgba(143,170,126,0.15)" : "rgba(203,139,106,0.1)",
            color: isComplete ? "var(--color-success)" : "var(--color-primary)",
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 16 }}
          style={{ background: isComplete ? "var(--color-success)" : "var(--color-primary)" }}
        />
      </div>

      {/* Progress label */}
      <div className="flex items-center justify-between">
        <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>
          <span className="font-semibold tabular-nums" style={{ color: "var(--color-foreground)" }}>
            {goal.progress}
          </span>
          {" / "}{goal.target}{" "}
          <span style={{ color: "var(--color-muted)" }}>{meta.periodLabel}</span>
        </p>

        <div className="flex items-center gap-2">
          {isComplete && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleCelebrate}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
              style={{ background: "rgba(143,170,126,0.18)", color: "var(--color-success)" }}
            >
              <PartyPopper size={12} />
              Célébrer
            </motion.button>
          )}
          <button
            onClick={handleDelete}
            disabled={busy}
            title="Supprimer"
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-danger transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── AddGoalSheet ──────────────────────────────────────────────────────────────
function AddGoalSheet({
  isOpen,
  onClose,
  onCreated,
  habits,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (g: GoalV2) => void;
  habits: Habit[];
}) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [habitId,  setHabitId]  = useState<string>("");
  const [count,    setCount]    = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const meta = selectedType ? GOAL_TYPE_META[selectedType] : null;
  const habitName = habits.find((h) => h.id === habitId)?.name ?? null;

  function autoTitle(): string {
    if (!meta) return "";
    return meta.unitLabel(parseInt(count) || meta.type === "active_days_month" ? parseInt(count) || 0 : parseInt(count) || 0, habitName);
  }

  function reset() {
    setSelectedType(null);
    setHabitId("");
    setCount("");
    setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function create() {
    if (!selectedType) { setError("Choisis un type d'intention."); return; }
    const n = parseInt(count);
    if (isNaN(n) || n < 1) { setError("Entre un nombre cible valide (≥ 1)."); return; }
    if (meta?.needsHabit && !habitId) { setError("Choisis une habitude."); return; }

    setBusy(true); setError(null);
    const title = autoTitle();
    const { error: err } = await createGoalV2({
      goalType: selectedType,
      habitId:  meta?.needsHabit ? habitId : null,
      target:   n,
      title,
    });
    setBusy(false);
    if (err) { setError(err); return; }

    onCreated({
      id:         crypto.randomUUID(),
      user_id:    "",
      title,
      goal_type:  selectedType,
      habit_id:   meta?.needsHabit ? habitId : null,
      target:     n,
      start_date: null,
      end_date:   null,
      is_done:    false,
      created_at: new Date().toISOString(),
      progress:   0,
      habit_name: habitName,
    });
    toast("Intention créée.", "success");
    reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
              maxHeight: "90dvh",
              overflowY: "auto",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 pb-5 pt-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Nouvelle intention</h2>
                <p className="mt-0.5 text-[13px] text-muted">Qu&apos;est-ce que tu veux ancrer ?</p>
              </div>
              <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5 px-5 pb-2">
              {/* Type selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Type d&apos;intention
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TYPES.map((gt) => {
                    const active = selectedType === gt.type;
                    return (
                      <button
                        key={gt.type}
                        onClick={() => { setSelectedType(gt.type); setHabitId(""); setCount(""); }}
                        className="flex flex-col items-start gap-2 rounded-[14px] p-4 text-left transition-all"
                        style={{
                          background: active ? "rgba(203,139,106,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? "rgba(203,139,106,0.35)" : "rgba(255,255,255,0.07)"}`,
                          color: active ? "var(--color-primary)" : "var(--color-muted)",
                        }}
                      >
                        <span className={active ? "text-primary" : ""}>{gt.icon}</span>
                        <span className="text-[12px] font-semibold leading-tight" style={{ color: "var(--color-foreground)" }}>
                          {gt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Habit picker — only for frequency types */}
              {meta?.needsHabit && (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Habitude
                  </label>
                  {habits.length === 0 ? (
                    <p className="text-[13px] text-muted">Aucune habitude active. Crée-en une d&apos;abord.</p>
                  ) : (
                    <select
                      value={habitId}
                      onChange={(e) => setHabitId(e.target.value)}
                      className="w-full rounded-[13px] border px-4 py-3 text-[14px] outline-none focus:border-primary/50"
                      style={{
                        background: "var(--color-surface-2)",
                        borderColor: "rgba(255,255,255,0.07)",
                        color: habitId ? "var(--color-foreground)" : "var(--color-muted)",
                      }}
                    >
                      <option value="">Choisir une habitude…</option>
                      {habits.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Target count */}
              {selectedType && (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Cible (nombre)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    placeholder={selectedType === "active_days_month" ? "Ex. 20" : selectedType === "streak" ? "Ex. 30" : "Ex. 5"}
                    className="w-full rounded-[13px] border px-4 py-3 text-[14px] outline-none focus:border-primary/50"
                    style={{
                      background: "var(--color-surface-2)",
                      borderColor: "rgba(255,255,255,0.07)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  {count && parseInt(count) >= 1 && (
                    <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>
                      → <span style={{ color: "var(--color-foreground)" }}>{autoTitle()}</span>
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p
                  className="rounded-[10px] px-4 py-3 text-[13px] font-medium"
                  style={{ background: "rgba(207,139,136,0.12)", color: "var(--color-danger)", border: "1px solid rgba(207,139,136,0.2)" }}
                >
                  {error}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={create}
                disabled={busy || !selectedType}
                className="w-full rounded-[14px] py-4 text-[15px] font-bold text-white disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
              >
                {busy ? "Création…" : "Ancrer cette intention"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── GoalsManager ──────────────────────────────────────────────────────────────
export function GoalsManager({ goals: initialGoals, habits }: { goals: GoalV2[]; habits: Habit[] }) {
  const [goals,  setGoals]  = useState<GoalV2[]>(initialGoals);
  const [isOpen, setIsOpen] = useState(false);

  function onCreated(g: GoalV2) { setGoals((prev) => [g, ...prev]); }
  function onDone(id: string) { setGoals((prev) => prev.filter((g) => g.id !== id)); }
  function onDeleted(id: string) { setGoals((prev) => prev.filter((g) => g.id !== id)); }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-4 rounded-[18px] border border-dashed px-6 py-5 text-left"
          style={{ borderColor: "rgba(203,139,106,0.25)", background: "rgba(203,139,106,0.04)" }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary"
          >
            <Plus size={18} className="text-white" />
          </span>
          <div>
            <span className="text-[15px] font-semibold text-foreground">Nouvelle intention</span>
            <p className="text-[13px] text-muted">Définis ce que tu veux ancrer.</p>
          </div>
        </motion.button>

        {/* Goals list */}
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center gap-4 p-12 text-center"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(203,139,106,0.1)" }}
            >
              <Target size={24} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="font-display font-bold">Aucune intention pour l&apos;instant</p>
              <p className="mt-1 text-[14px] text-muted">
                Choisis quelque chose que tu veux ancrer dans ta routine.
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {goals.map((g, i) => (
              <GoalCard key={g.id} goal={g} index={i} onDone={onDone} onDeleted={onDeleted} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <AddGoalSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreated={onCreated}
        habits={habits}
      />
    </>
  );
}
