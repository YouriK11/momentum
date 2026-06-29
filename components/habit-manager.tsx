"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Archive, ChevronRight } from "lucide-react";
import type { Habit, HabitLevel, HabitFrequency } from "@/lib/types";
import { createHabit, archiveHabit } from "@/app/(app)/habits/actions";
import { useToast } from "@/components/ui/toast";

// ── Constants ──────────────────────────────────────────────────────────────────
const DEFAULT_WEIGHT: Record<HabitLevel, number> = { facile: 1, moyen: 2, difficile: 3 };
const ACCENT: Record<HabitLevel, string> = {
  facile: "#37c97e", moyen: "#ffc24b", difficile: "#ec6480",
};
const LEVEL_LABEL: Record<HabitLevel, string> = {
  facile: "Facile", moyen: "Moyen", difficile: "Difficile",
};
const FREQ_LABEL: Record<HabitFrequency, string> = {
  daily:          "Quotidien",
  specific_days:  "Jours précis",
  x_per_week:     "X / semaine",
};
// Jours de la semaine — semaine française lun→dim (0=Dim en JS)
const DAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
] as const;
const EMOJIS = ["🏃","📚","💧","🧘","🥗","😴","🎯","🧹","💪","✍️","🎸","🚭","🛁","🏋️","🧠","🌿","☀️","🥦"];

// ── Types ──────────────────────────────────────────────────────────────────────
type Props = {
  userId: string;
  habits: Habit[];
  groups: { id: string; name: string }[];
};

// ── Main ───────────────────────────────────────────────────────────────────────
export function HabitManager({ userId, habits, groups }: Props) {
  const router    = useRouter();
  const { toast } = useToast();
  const [isOpen,    setIsOpen]    = useState(false);
  const [archiving, setArchiving] = useState<string | null>(null);

  async function archive(id: string) {
    setArchiving(id);
    const { error } = await archiveHabit(id);
    setArchiving(null);
    if (error) { toast("Impossible d'archiver cette habitude.", "error"); return; }
  }

  const mine   = habits.filter((h) => h.owner_id === userId);
  const others = habits.filter((h) => h.owner_id !== userId);

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-[18px] border border-dashed px-6 py-5 text-left transition-colors"
          style={{ borderColor: "rgba(252,82,0,0.25)", background: "rgba(252,82,0,0.04)" }}
        >
          <span className="flex items-center gap-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary"
              style={{ boxShadow: "0 0 16px rgba(252,82,0,0.4)" }}
            >
              <Plus size={18} className="text-white" />
            </span>
            <div>
              <span className="text-[15px] font-semibold text-foreground">Nouvelle habitude</span>
              <p className="text-[13px] text-muted">Ajoute une habitude à ta routine</p>
            </div>
          </span>
          <ChevronRight size={18} className="text-muted" />
        </motion.button>

        {/* My habits */}
        {mine.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Mes habitudes ({mine.length})
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {mine.map((h, i) => (
                  <HabitCard
                    key={h.id} habit={h} index={i}
                    isArchiving={archiving === h.id}
                    onArchive={() => archive(h.id)}
                    canArchive
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Group habits (read-only) */}
        {others.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Habitudes du groupe ({others.length})
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {others.map((h, i) => (
                  <HabitCard key={h.id} habit={h} index={i} isArchiving={false} onArchive={() => {}} canArchive={false} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Empty state */}
        {mine.length === 0 && others.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center gap-3 p-12 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(252,82,0,0.1)" }}>
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <p className="font-display font-bold">Lance-toi !</p>
              <p className="mt-1 text-sm text-muted">Crée ta première habitude avec le bouton ci-dessus.</p>
            </div>
          </motion.div>
        )}
      </div>

      <AddHabitSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        groups={groups}
        onSuccess={() => { setIsOpen(false); router.refresh(); }}
      />
    </>
  );
}

// ── HabitCard ─────────────────────────────────────────────────────────────────
function HabitCard({ habit: h, index, isArchiving, onArchive, canArchive }: {
  habit: Habit; index: number; isArchiving: boolean; onArchive: () => void; canArchive: boolean;
}) {
  const accent = ACCENT[h.level];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -64, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      className="card flex items-center gap-4 p-5"
    >
      <div
        className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] text-2xl"
        style={{ background: accent + "22" }}
      >
        {h.icon ?? "🎯"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-snug text-foreground">{h.name}</p>
        <p className="mt-0.5 text-[12px] text-muted">
          {h.scope === "commune" ? "Groupe" : "Perso"} · {FREQ_LABEL[h.frequency ?? "daily"]}
        </p>
      </div>

      <span
        className="shrink-0 rounded-[9px] px-2.5 py-1 text-[11px] font-semibold"
        style={{ background: accent + "1e", color: accent }}
      >
        {LEVEL_LABEL[h.level]}
      </span>

      {canArchive && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={onArchive}
          disabled={isArchiving}
          title="Archiver l'habitude"
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-40"
        >
          <Archive size={14} />
        </motion.button>
      )}
    </motion.div>
  );
}

// ── AddHabitSheet ─────────────────────────────────────────────────────────────
function AddHabitSheet({ isOpen, onClose, userId, groups, onSuccess }: {
  isOpen: boolean; onClose: () => void; userId: string;
  groups: { id: string; name: string }[]; onSuccess: () => void;
}) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [icon,        setIcon]        = useState("🎯");
  const [level,       setLevel]       = useState<HabitLevel>("moyen");
  const [weight,      setWeight]      = useState(2);
  const [target,      setTarget]      = useState("perso");
  const [frequency,   setFrequency]   = useState<HabitFrequency>("daily");
  const [freqDays,    setFreqDays]    = useState<number[]>([]);
  const [freqX,       setFreqX]       = useState(3);
  const [busy,        setBusy]        = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  function pickLevel(l: HabitLevel) { setLevel(l); setWeight(DEFAULT_WEIGHT[l]); }

  function toggleDay(v: number) {
    setFreqDays((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]
    );
  }

  function reset() {
    setName(""); setDescription(""); setIcon("🎯"); setLevel("moyen");
    setWeight(2); setTarget("perso"); setFrequency("daily");
    setFreqDays([]); setFreqX(3); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function create() {
    if (!name.trim()) { setError("Donne un nom à l'habitude."); return; }
    if (frequency === "specific_days" && freqDays.length === 0) {
      setError("Sélectionne au moins un jour."); return;
    }
    setBusy(true); setError(null);

    const result = await createHabit({
      userId,
      name:          name.trim(),
      description:   description.trim() || null,
      icon,
      level,
      weight,
      scope:         target === "perso" ? "perso" : "commune",
      groupId:       target === "perso" ? null : target,
      frequency,
      frequencyDays: frequency === "specific_days" ? freqDays : null,
      frequencyX:    frequency === "x_per_week" ? freqX : null,
    });

    setBusy(false);
    if (result.error) { setError(result.error); return; }
    reset();
    onSuccess();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-black/65"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 275, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-[28px]"
            style={{
              maxHeight: "92dvh",
              background: "var(--color-surface)",
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 40%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 -32px 96px -8px rgba(0,0,0,0.85)",
              paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-5 pt-3">
              <div>
                <h2 className="font-display text-xl font-black">Nouvelle habitude</h2>
                <p className="mt-0.5 text-xs text-muted">Ça commence par un premier pas.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-5 px-5 pb-2">

              {/* Name */}
              <Field label="Nom">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Méditer 10 min"
                  onKeyDown={(e) => e.key === "Enter" && create()}
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none transition-colors focus:border-primary/50"
                  style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                />
              </Field>

              {/* Description */}
              <Field label="Description" hint="optionnel">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="En quoi ça consiste ?"
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none transition-colors focus:border-primary/50"
                  style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                />
              </Field>

              {/* Icon picker */}
              <Field label="Icône">
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map((e) => (
                    <motion.button
                      key={e} type="button" onClick={() => setIcon(e)} whileTap={{ scale: 0.85 }}
                      className="flex h-11 w-full items-center justify-center rounded-[10px] border text-xl transition-all"
                      style={{
                        background:  icon === e ? "rgba(252,82,0,0.12)" : "var(--color-surface-2)",
                        borderColor: icon === e ? "rgba(252,82,0,0.38)" : "rgba(255,255,255,0.05)",
                        transform:   icon === e ? "scale(1.1)" : "scale(1)",
                        boxShadow:   icon === e ? "0 0 12px rgba(252,82,0,0.25)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >{e}</motion.button>
                  ))}
                </div>
              </Field>

              {/* Level */}
              <Field label="Difficulté">
                <div className="grid grid-cols-3 gap-2">
                  {(["facile", "moyen", "difficile"] as HabitLevel[]).map((l) => {
                    const c = ACCENT[l]; const active = level === l;
                    return (
                      <motion.button
                        key={l} type="button" onClick={() => pickLevel(l)} whileTap={{ scale: 0.94 }}
                        className="flex flex-col items-center gap-2 rounded-[13px] border py-3.5 transition-all"
                        style={{ background: active ? c + "18" : "var(--color-surface-2)", borderColor: active ? c + "45" : "rgba(255,255,255,0.06)" }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: active ? c : "rgba(255,255,255,0.18)" }} />
                        <span className="text-[11px] font-semibold" style={{ color: active ? c : "var(--color-muted)" }}>
                          {LEVEL_LABEL[l]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </Field>

              {/* Weight */}
              <Field label="Poids dans le score" hint={<span className="font-bold" style={{ color: "var(--color-primary)" }}>{weight}</span>}>
                <input
                  type="range" min={0.5} max={5} step={0.5}
                  value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-[11px] text-muted">Plus le poids est élevé, plus cette habitude pèse dans ton score.</p>
              </Field>

              {/* ── Fréquence ───────────────────────────────────────────────── */}
              <Field label="Fréquence">
                {/* 3 boutons de sélection */}
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "specific_days", "x_per_week"] as HabitFrequency[]).map((f) => {
                    const active = frequency === f;
                    return (
                      <motion.button
                        key={f} type="button" onClick={() => setFrequency(f)} whileTap={{ scale: 0.94 }}
                        className="flex flex-col items-center gap-1.5 rounded-[13px] border px-2 py-3 transition-all"
                        style={{
                          background:  active ? "rgba(252,82,0,0.12)" : "var(--color-surface-2)",
                          borderColor: active ? "rgba(252,82,0,0.35)"  : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: active ? "var(--color-primary)" : "rgba(255,255,255,0.18)" }}
                        />
                        <span className="text-center text-[10px] font-semibold leading-tight"
                          style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}>
                          {FREQ_LABEL[f]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sous-options selon le mode */}
                <AnimatePresence mode="wait">
                  {frequency === "specific_days" && (
                    <motion.div
                      key="days"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex gap-1.5">
                        {DAYS.map(({ value, label }) => {
                          const sel = freqDays.includes(value);
                          return (
                            <button
                              key={value} type="button" onClick={() => toggleDay(value)}
                              className="flex h-9 flex-1 items-center justify-center rounded-[9px] text-[11px] font-bold transition-all"
                              style={{
                                background:  sel ? "rgba(252,82,0,0.15)" : "var(--color-surface-2)",
                                borderWidth:  1,
                                borderStyle:  "solid",
                                borderColor: sel ? "rgba(252,82,0,0.4)"  : "rgba(255,255,255,0.06)",
                                color:       sel ? "var(--color-primary)" : "var(--color-muted)",
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {frequency === "x_per_week" && (
                    <motion.div
                      key="xperweek"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-[13px] text-muted">Combien de fois par semaine ?</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFreqX((x) => Math.max(1, x - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-[9px] font-bold text-muted transition hover:text-foreground"
                            style={{ background: "var(--color-surface-2)" }}
                          >−</button>
                          <span className="w-6 text-center font-display font-black text-primary">{freqX}</span>
                          <button
                            type="button"
                            onClick={() => setFreqX((x) => Math.min(7, x + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-[9px] font-bold text-muted transition hover:text-foreground"
                            style={{ background: "var(--color-surface-2)" }}
                          >+</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>

              {/* Scope */}
              {groups.length > 0 && (
                <Field label="Destination">
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "perso", label: "Perso (privé)" },
                      ...groups.map((g) => ({ value: g.id, label: `Groupe · ${g.name}` })),
                    ].map((opt) => {
                      const active = target === opt.value;
                      return (
                        <motion.button
                          key={opt.value} type="button" onClick={() => setTarget(opt.value)} whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 rounded-[13px] border px-4 py-3 text-left text-sm transition-all"
                          style={{
                            background:  active ? "rgba(252,82,0,0.08)" : "var(--color-surface-2)",
                            borderColor: active ? "rgba(252,82,0,0.3)"  : "rgba(255,255,255,0.06)",
                            color:       active ? "var(--color-foreground)" : "var(--color-muted)",
                          }}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: active ? "var(--color-primary)" : "rgba(255,255,255,0.2)" }} />
                          <span className="font-medium">{opt.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </Field>
              )}

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-[10px] px-4 py-3 text-sm font-medium"
                  style={{ background: "rgba(236,100,128,0.12)", color: "#ec6480", border: "1px solid rgba(236,100,128,0.2)" }}
                >{error}</motion.p>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={create} disabled={busy}
                className="w-full rounded-[14px] py-4 text-sm font-bold text-white transition-opacity disabled:opacity-60"
                style={{ background: "var(--color-primary)", boxShadow: "0 0 24px rgba(252,82,0,0.35), 0 4px 12px rgba(252,82,0,0.25)" }}
              >
                {busy ? "Création en cours…" : "Ajouter l'habitude"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
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
