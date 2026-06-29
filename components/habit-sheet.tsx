"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Habit, HabitLevel, HabitFrequency } from "@/lib/types";
import { createHabit, updateHabit } from "@/app/(app)/habits/actions";

// ── Constants ──────────────────────────────────────────────────────────────────
const DEFAULT_WEIGHT: Record<HabitLevel, number> = { facile: 1, moyen: 2, difficile: 3 };
const ACCENT: Record<HabitLevel, string> = {
  facile: "#37c97e", moyen: "#ffc24b", difficile: "#ec6480",
};
const LEVEL_LABEL: Record<HabitLevel, string> = {
  facile: "Facile", moyen: "Moyen", difficile: "Difficile",
};
const FREQ_LABEL: Record<HabitFrequency, string> = {
  daily: "Quotidien", specific_days: "Jours précis", x_per_week: "X / semaine",
};
const DAYS = [
  { value: 1, label: "Lun" }, { value: 2, label: "Mar" }, { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" }, { value: 5, label: "Ven" }, { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
] as const;
const EMOJIS = ["🏃","📚","💧","🧘","🥗","😴","🎯","🧹","💪","✍️","🎸","🚭","🛁","🏋️","🧠","🌿","☀️","🥦"];

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  groups: { id: string; name: string }[];
  onSuccess: () => void;
  habitToEdit?: Habit;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function HabitSheet({ isOpen, onClose, userId, groups, onSuccess, habitToEdit }: Props) {
  const isEdit = Boolean(habitToEdit);

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

  // Sync fields when switching between habits (or opening for create)
  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description ?? "");
      setIcon(habitToEdit.icon ?? "🎯");
      setLevel(habitToEdit.level);
      setWeight(habitToEdit.weight);
      setTarget(habitToEdit.group_id ?? "perso");
      setFrequency(habitToEdit.frequency ?? "daily");
      setFreqDays(habitToEdit.frequency_days ?? []);
      setFreqX(habitToEdit.frequency_x ?? 3);
    } else {
      setName(""); setDescription(""); setIcon("🎯"); setLevel("moyen");
      setWeight(2); setTarget("perso"); setFrequency("daily");
      setFreqDays([]); setFreqX(3);
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  function pickLevel(l: HabitLevel) { setLevel(l); setWeight(DEFAULT_WEIGHT[l]); }

  function toggleDay(v: number) {
    setFreqDays((prev) => prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]);
  }

  function handleClose() { onClose(); }

  async function submit() {
    if (!name.trim()) { setError("Donne un nom à l'habitude."); return; }
    if (frequency === "specific_days" && freqDays.length === 0) {
      setError("Sélectionne au moins un jour."); return;
    }
    setBusy(true); setError(null);

    const payload = {
      name:          name.trim(),
      description:   description.trim() || null,
      icon,
      level,
      weight,
      scope:         (target === "perso" ? "perso" : "commune") as "perso" | "commune",
      groupId:       target === "perso" ? null : target,
      frequency,
      frequencyDays: frequency === "specific_days" ? freqDays : null,
      frequencyX:    frequency === "x_per_week" ? freqX : null,
    };

    const result = isEdit && habitToEdit
      ? await updateHabit(habitToEdit.id, payload)
      : await createHabit({ userId, ...payload });

    setBusy(false);
    if (result.error) { setError(result.error); return; }
    onSuccess();
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
                <h2 className="font-display text-xl font-black">
                  {isEdit ? "Modifier l'habitude" : "Nouvelle habitude"}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {isEdit ? "Ajuste les paramètres de cette habitude." : "Ça commence par un premier pas."}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-5 px-5 pb-2">

              {/* Name */}
              <Field label="Nom">
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Méditer 10 min"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
                  style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
                />
              </Field>

              {/* Description */}
              <Field label="Description" hint="optionnel">
                <input
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="En quoi ça consiste ?"
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
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
                        className="flex flex-col items-center gap-2 rounded-[13px] border py-3.5"
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

              {/* Fréquence */}
              <Field label="Fréquence">
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "specific_days", "x_per_week"] as HabitFrequency[]).map((f) => {
                    const active = frequency === f;
                    return (
                      <motion.button
                        key={f} type="button" onClick={() => setFrequency(f)} whileTap={{ scale: 0.94 }}
                        className="flex flex-col items-center gap-1.5 rounded-[13px] border px-2 py-3"
                        style={{
                          background:  active ? "rgba(252,82,0,0.12)" : "var(--color-surface-2)",
                          borderColor: active ? "rgba(252,82,0,0.35)" : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <span className="h-2 w-2 rounded-full"
                          style={{ background: active ? "var(--color-primary)" : "rgba(255,255,255,0.18)" }} />
                        <span className="text-center text-[10px] font-semibold leading-tight"
                          style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}>
                          {FREQ_LABEL[f]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {frequency === "specific_days" && (
                    <motion.div key="days"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex gap-1.5">
                        {DAYS.map(({ value, label }) => {
                          const sel = freqDays.includes(value);
                          return (
                            <button key={value} type="button" onClick={() => toggleDay(value)}
                              className="flex h-9 flex-1 items-center justify-center rounded-[9px] text-[11px] font-bold"
                              style={{
                                background:  sel ? "rgba(252,82,0,0.15)" : "var(--color-surface-2)",
                                borderWidth: 1, borderStyle: "solid",
                                borderColor: sel ? "rgba(252,82,0,0.4)" : "rgba(255,255,255,0.06)",
                                color:       sel ? "var(--color-primary)" : "var(--color-muted)",
                              }}
                            >{label}</button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                  {frequency === "x_per_week" && (
                    <motion.div key="xperweek"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-[13px] text-muted">Combien de fois par semaine ?</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button type="button" onClick={() => setFreqX((x) => Math.max(1, x - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-[9px] font-bold text-muted hover:text-foreground"
                            style={{ background: "var(--color-surface-2)" }}>−</button>
                          <span className="w-6 text-center font-display font-black text-primary">{freqX}</span>
                          <button type="button" onClick={() => setFreqX((x) => Math.min(7, x + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-[9px] font-bold text-muted hover:text-foreground"
                            style={{ background: "var(--color-surface-2)" }}>+</button>
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
                          className="flex items-center gap-3 rounded-[13px] border px-4 py-3 text-left text-sm"
                          style={{
                            background:  active ? "rgba(252,82,0,0.08)" : "var(--color-surface-2)",
                            borderColor: active ? "rgba(252,82,0,0.3)" : "rgba(255,255,255,0.06)",
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
                onClick={submit} disabled={busy}
                className="w-full rounded-[14px] py-4 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: "var(--color-primary)", boxShadow: "0 0 24px rgba(252,82,0,0.35), 0 4px 12px rgba(252,82,0,0.25)" }}
              >
                {busy
                  ? (isEdit ? "Enregistrement…" : "Création en cours…")
                  : (isEdit ? "Enregistrer les modifications" : "Ajouter l'habitude")}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
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
