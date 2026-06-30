"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Flame, ListChecks, Target, CalendarDays, Trash2, PartyPopper, ChevronDown, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createGoalV2, celebrateGoal, deleteGoal } from "@/app/(app)/objectifs/actions";
import type { Habit, GoalType, GoalV2 } from "@/lib/types";

// ── Goal type definitions ──────────────────────────────────────────────────────
const GOAL_TYPES: {
  type: GoalType;
  icon: React.ReactNode;
  label: string;
  needsHabit: boolean;
  defaultCount: number;
}[] = [
  { type: "count_week",        icon: <ListChecks size={14} />, label: "Cette semaine",  needsHabit: true,  defaultCount: 5  },
  { type: "count_month",       icon: <CalendarDays size={14} />, label: "Ce mois",      needsHabit: true,  defaultCount: 15 },
  { type: "streak",            icon: <Flame size={14} />,      label: "Série",          needsHabit: false, defaultCount: 30 },
  { type: "active_days_month", icon: <Target size={14} />,     label: "Jours actifs",   needsHabit: false, defaultCount: 20 },
];

const GOAL_META = Object.fromEntries(GOAL_TYPES.map((g) => [g.type, g])) as Record<GoalType, typeof GOAL_TYPES[0]>;

function buildSentence(type: GoalType, count: number, habitName: string | null): string {
  switch (type) {
    case "count_week":        return `Faire ${habitName ?? "une habitude"} ${count} fois cette semaine`;
    case "count_month":       return `Faire ${habitName ?? "une habitude"} ${count} fois ce mois`;
    case "streak":            return `Atteindre ${count} jours de série consécutifs`;
    case "active_days_month": return `Être actif ${count} jours ce mois`;
  }
}

function buildTitle(type: GoalType, count: number, habitName: string | null): string {
  switch (type) {
    case "count_week":        return `${habitName ?? "l'habitude"} ${count} fois cette semaine`;
    case "count_month":       return `${habitName ?? "l'habitude"} ${count} fois ce mois`;
    case "streak":            return `Tenir une série de ${count} jours`;
    case "active_days_month": return `Être actif ${count} jours ce mois`;
  }
}

// ── GoalCard ──────────────────────────────────────────────────────────────────
function GoalCard({ goal, index, onDone, onDeleted }: {
  goal: GoalV2; index: number;
  onDone: (id: string) => void;
  onDeleted: (id: string) => void;
}) {
  const { toast } = useToast();
  const [busy,    setBusy]    = useState(false);
  const [confirm, setConfirm] = useState(false);

  const meta       = GOAL_META[goal.goal_type];
  const pct        = Math.min(100, Math.round((goal.progress / goal.target) * 100));
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
      {isComplete && (
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(143,170,126,0.4), transparent)" }} />
      )}

      <div className="flex items-start gap-3">
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

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>
          <span className="font-semibold tabular-nums" style={{ color: "var(--color-foreground)" }}>
            {goal.progress}
          </span>
          {" / "}{goal.target}{" "}
          <span style={{ color: "var(--color-muted)" }}>
            {goal.goal_type === "count_week" ? "cette semaine"
             : goal.goal_type === "count_month" || goal.goal_type === "active_days_month" ? "ce mois"
             : "jours"}
          </span>
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

          {/* Delete with inline confirm */}
          <AnimatePresence mode="wait">
            {confirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.14 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={() => { setConfirm(false); handleDelete(); }}
                  disabled={busy}
                  className="flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold"
                  style={{ background: "rgba(207,139,136,0.18)", color: "var(--color-danger)" }}
                >
                  <Check size={10} />
                  Oui
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  className="flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  Non
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="delete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirm(true)}
                disabled={busy}
                title="Supprimer"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-danger transition-colors"
              >
                <Trash2 size={12} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── AddGoalSheet ──────────────────────────────────────────────────────────────
function AddGoalSheet({ isOpen, onClose, onCreated, habits }: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (g: GoalV2) => void;
  habits: Habit[];
}) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [habitId,      setHabitId]      = useState<string>("");
  const [count,        setCount]        = useState(5);
  const [showHabits,   setShowHabits]   = useState(false);
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const meta      = selectedType ? GOAL_META[selectedType] : null;
  const habitName = habits.find((h) => h.id === habitId)?.name ?? null;

  function selectType(type: GoalType) {
    setSelectedType(type);
    setHabitId("");
    setShowHabits(false);
    setCount(GOAL_META[type].defaultCount);
    setError(null);
  }

  function reset() {
    setSelectedType(null);
    setHabitId("");
    setCount(5);
    setShowHabits(false);
    setError(null);
  }

  function handleClose() { reset(); onClose(); }

  function decrement() { setCount((c) => Math.max(1, c - 1)); }
  function increment() { setCount((c) => c + 1); }

  async function create() {
    if (!selectedType) { setError("Choisis un type d'intention."); return; }
    if (count < 1) { setError("Le nombre cible doit être au moins 1."); return; }
    if (meta?.needsHabit && !habitId) { setError("Choisis une habitude."); return; }

    setBusy(true); setError(null);
    const title = buildTitle(selectedType, count, habitName);
    const { error: err } = await createGoalV2({
      goalType: selectedType,
      habitId:  meta?.needsHabit ? habitId : null,
      target:   count,
      title,
    });
    setBusy(false);
    if (err) { setError(err); return; }

    onCreated({
      id:          crypto.randomUUID(),
      user_id:     "",
      title,
      goal_type:   selectedType,
      habit_id:    meta?.needsHabit ? habitId : null,
      target:      count,
      start_date:  null,
      end_date:    null,
      is_achieved: false,
      created_at:  new Date().toISOString(),
      progress:    0,
      habit_name:  habitName,
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

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-5 pt-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Nouvelle intention</h2>
                <p className="mt-0.5 text-[13px] text-muted">Qu&apos;est-ce que tu veux ancrer ?</p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5 px-5 pb-2">

              {/* ── Type selector: pill row ── */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Type d&apos;intention
                </p>
                <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                  {GOAL_TYPES.map((gt) => {
                    const active = selectedType === gt.type;
                    return (
                      <button
                        key={gt.type}
                        onClick={() => selectType(gt.type)}
                        className="flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-[13px] font-semibold transition-all"
                        style={{
                          background:  active ? "rgba(203,139,106,0.12)" : "rgba(255,255,255,0.04)",
                          borderColor: active ? "rgba(203,139,106,0.35)" : "rgba(255,255,255,0.08)",
                          color:       active ? "var(--color-primary)"   : "var(--color-muted)",
                        }}
                      >
                        <span style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}>
                          {gt.icon}
                        </span>
                        <span>{gt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Sentence builder ── */}
              <AnimatePresence>
                {selectedType && (
                  <motion.div
                    key={selectedType}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[18px] flex flex-col gap-4 p-5"
                    style={{
                      background:  "rgba(203,139,106,0.05)",
                      border:      "1px solid rgba(203,139,106,0.15)",
                    }}
                  >
                    {/* Sentence with inline tokens */}
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[16px] leading-[1.8]">
                      {(selectedType === "count_week" || selectedType === "count_month") && (
                        <>
                          <span style={{ color: "var(--color-muted)" }}>Faire</span>

                          {/* Habit token */}
                          <button
                            onClick={() => setShowHabits((v) => !v)}
                            className="inline-flex items-center gap-1 rounded-[8px] px-2 py-0.5 text-[15px] font-semibold transition-all"
                            style={{
                              background:  habitId ? "rgba(203,139,106,0.12)" : "rgba(255,255,255,0.06)",
                              border:      `1px solid ${habitId ? "rgba(203,139,106,0.3)" : "rgba(255,255,255,0.1)"}`,
                              color:       habitId ? "var(--color-foreground)" : "var(--color-muted)",
                            }}
                          >
                            {habitId ? (habitName ?? "une habitude") : "une habitude"}
                            <ChevronDown
                              size={12}
                              style={{
                                opacity: 0.6,
                                transform: showHabits ? "rotate(180deg)" : "rotate(0)",
                                transition: "transform 0.18s ease",
                              }}
                            />
                          </button>

                          {/* Count token */}
                          <span
                            className="inline-flex items-center overflow-hidden rounded-[8px]"
                            style={{ border: "1px solid rgba(203,139,106,0.25)", background: "rgba(203,139,106,0.08)" }}
                          >
                            <button
                              onClick={decrement}
                              className="flex h-7 w-7 items-center justify-center text-[16px] font-bold transition-colors hover:bg-primary/10"
                              style={{ color: "var(--color-primary)" }}
                              aria-label="Diminuer"
                            >−</button>
                            <span
                              className="min-w-[1.75rem] text-center text-[15px] font-bold tabular-nums"
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {count}
                            </span>
                            <button
                              onClick={increment}
                              className="flex h-7 w-7 items-center justify-center text-[16px] font-bold transition-colors hover:bg-primary/10"
                              style={{ color: "var(--color-primary)" }}
                              aria-label="Augmenter"
                            >+</button>
                          </span>

                          <span style={{ color: "var(--color-muted)" }}>
                            fois {selectedType === "count_week" ? "cette semaine" : "ce mois"}
                          </span>
                        </>
                      )}

                      {selectedType === "streak" && (
                        <>
                          <span style={{ color: "var(--color-muted)" }}>Atteindre</span>
                          <span
                            className="inline-flex items-center overflow-hidden rounded-[8px]"
                            style={{ border: "1px solid rgba(203,139,106,0.25)", background: "rgba(203,139,106,0.08)" }}
                          >
                            <button onClick={decrement} className="flex h-7 w-7 items-center justify-center text-[16px] font-bold hover:bg-primary/10" style={{ color: "var(--color-primary)" }} aria-label="Diminuer">−</button>
                            <span className="min-w-[1.75rem] text-center text-[15px] font-bold tabular-nums" style={{ color: "var(--color-foreground)" }}>{count}</span>
                            <button onClick={increment} className="flex h-7 w-7 items-center justify-center text-[16px] font-bold hover:bg-primary/10" style={{ color: "var(--color-primary)" }} aria-label="Augmenter">+</button>
                          </span>
                          <span style={{ color: "var(--color-muted)" }}>jours de série consécutifs</span>
                        </>
                      )}

                      {selectedType === "active_days_month" && (
                        <>
                          <span style={{ color: "var(--color-muted)" }}>Être actif</span>
                          <span
                            className="inline-flex items-center overflow-hidden rounded-[8px]"
                            style={{ border: "1px solid rgba(203,139,106,0.25)", background: "rgba(203,139,106,0.08)" }}
                          >
                            <button onClick={decrement} className="flex h-7 w-7 items-center justify-center text-[16px] font-bold hover:bg-primary/10" style={{ color: "var(--color-primary)" }} aria-label="Diminuer">−</button>
                            <span className="min-w-[1.75rem] text-center text-[15px] font-bold tabular-nums" style={{ color: "var(--color-foreground)" }}>{count}</span>
                            <button onClick={increment} className="flex h-7 w-7 items-center justify-center text-[16px] font-bold hover:bg-primary/10" style={{ color: "var(--color-primary)" }} aria-label="Augmenter">+</button>
                          </span>
                          <span style={{ color: "var(--color-muted)" }}>jours ce mois</span>
                        </>
                      )}
                    </div>

                    {/* Habit list (expandable) */}
                    <AnimatePresence initial={false}>
                      {showHabits && meta?.needsHabit && (
                        <motion.div
                          key="habit-list"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="flex flex-col rounded-[12px] overflow-hidden"
                            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                          >
                            {habits.length === 0 ? (
                              <p className="px-4 py-3 text-[13px] text-muted">
                                Aucune habitude active. Crée-en une d&apos;abord.
                              </p>
                            ) : (
                              habits.map((h) => (
                                <button
                                  key={h.id}
                                  onClick={() => { setHabitId(h.id); setShowHabits(false); }}
                                  className="flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium transition-colors"
                                  style={{
                                    background: habitId === h.id ? "rgba(203,139,106,0.1)" : "rgba(255,255,255,0.02)",
                                    color:      habitId === h.id ? "var(--color-primary)" : "var(--color-foreground)",
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                  }}
                                >
                                  <span className="text-xl">{h.icon ?? "🎯"}</span>
                                  <span>{h.name}</span>
                                  {habitId === h.id && (
                                    <Check size={14} className="ml-auto shrink-0" style={{ color: "var(--color-primary)" }} />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Preview sentence */}
                    <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>
                      →{" "}
                      <span style={{ color: "var(--color-foreground)", fontStyle: "italic" }}>
                        &quot;{buildSentence(selectedType, count, habitName)}&quot;
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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
  function onDone(id: string)    { setGoals((prev) => prev.filter((g) => g.id !== id)); }
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
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary">
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(203,139,106,0.1)" }}>
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
