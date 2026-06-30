"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import type { Habit, HabitLevel, HabitFrequency } from "@/lib/types";
import { createHabit, updateHabit } from "@/app/(app)/habits/actions";

const DAYS = [
  { value: 1, label: "Lun" }, { value: 2, label: "Mar" }, { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" }, { value: 5, label: "Ven" }, { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
] as const;

const EMOJIS = ["🏃","📚","💧","🧘","🥗","😴","🎯","🧹","💪","✍️","🎸","🚭","🛁","🏋️","🧠","🌿","☀️","🥦"];

const TEMPLATES = [
  { icon: "📚", name: "Lire" },
  { icon: "🧘", name: "Méditer" },
  { icon: "🚶", name: "Marcher" },
  { icon: "💧", name: "Boire de l'eau" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  groups: { id: string; name: string }[];
  onSuccess: () => void;
  habitToEdit?: Habit;
}

export function HabitSheet({ isOpen, onClose, userId, groups, onSuccess, habitToEdit }: Props) {
  const isEdit = Boolean(habitToEdit);
  const nameRef = useRef<HTMLInputElement>(null);

  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [icon,        setIcon]        = useState("🌱");
  const [customEmoji, setCustomEmoji] = useState("");
  const [target,      setTarget]      = useState("perso");
  const [frequency,   setFrequency]   = useState<HabitFrequency>("daily");
  const [freqDays,    setFreqDays]    = useState<number[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description ?? "");
      setIcon(habitToEdit.icon ?? "🌱");
      setCustomEmoji("");
      setTarget(habitToEdit.group_id ?? "perso");
      const freq = habitToEdit.frequency ?? "daily";
      setFrequency(freq === "x_per_week" ? "daily" : freq);
      setFreqDays(habitToEdit.frequency_days ?? []);
      const hasExtra = !!(
        habitToEdit.description ||
        habitToEdit.frequency !== "daily" ||
        habitToEdit.group_id
      );
      setShowOptions(hasExtra);
    } else {
      setName(""); setDescription(""); setIcon("🌱"); setCustomEmoji("");
      setTarget("perso"); setFrequency("daily"); setFreqDays([]); setShowOptions(false);
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  // Autofocus name on open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => nameRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function toggleDay(v: number) {
    setFreqDays((prev) => prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]);
  }

  function applyTemplate(t: { icon: string; name: string }) {
    setIcon(t.icon);
    setCustomEmoji("");
    setName(t.name);
    nameRef.current?.focus();
  }

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
      level:         "moyen" as HabitLevel,
      weight:        1,
      scope:         (target === "perso" ? "perso" : "commune") as "perso" | "commune",
      groupId:       target === "perso" ? null : target,
      frequency,
      frequencyDays: frequency === "specific_days" ? freqDays : null,
      frequencyX:    null,
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
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 275, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="habit-sheet-title"
            className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-[28px]"
            style={{
              maxHeight: "92dvh",
              background: "var(--color-surface)",
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 40%)",
              borderTop: "1px solid var(--color-border)",
              boxShadow: "0 -24px 72px -8px rgba(0,0,0,0.7)",
              paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full" style={{ background: "var(--color-border)" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-3">
              <div>
                <h2 id="habit-sheet-title" className="text-xl font-semibold">
                  {isEdit ? "Modifier l'habitude" : "Nouvelle habitude"}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {isEdit ? "Ajuste les paramètres." : "Ça commence par un premier pas."}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                onClick={onClose}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
              >
                <X size={16} />
              </motion.button>
            </div>

            <div className="flex flex-col gap-4 px-5 pb-2">

              {/* ── 1. Nom (autofocus) ── */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="habit-name"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted"
                >
                  Nom de l&apos;habitude
                </label>
                <input
                  id="habit-name"
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Méditer 10 min"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none"
                  style={{
                    background: "var(--color-surface-2)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(203,139,106,0.4)")}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>

              {/* ── 2. Templates rapides — création seulement ── */}
              {!isEdit && (
                <div
                  className="flex gap-2 overflow-x-auto pb-0.5"
                  style={{ scrollbarWidth: "none" }}
                >
                  {TEMPLATES.map((t) => {
                    const active = name === t.name && icon === t.icon;
                    return (
                      <motion.button
                        key={t.name}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        whileTap={{ scale: 0.94 }}
                        className="flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-1.5 text-[13px] font-medium"
                        style={{
                          background:  active ? "rgba(203,139,106,0.1)" : "var(--color-surface-2)",
                          borderColor: active ? "rgba(203,139,106,0.3)" : "var(--color-border)",
                          color:       active ? "var(--color-primary)"  : "var(--color-muted)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* ── 3. Icône — ligne horizontale compacte ── */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Icône
                </label>
                <div
                  className="flex gap-2 overflow-x-auto pb-0.5"
                  style={{ scrollbarWidth: "none" }}
                >
                  {EMOJIS.map((e) => (
                    <motion.button
                      key={e}
                      type="button"
                      onClick={() => { setIcon(e); setCustomEmoji(""); }}
                      whileTap={{ scale: 0.85 }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border text-xl"
                      style={{
                        background:  icon === e && !customEmoji ? "rgba(203,139,106,0.1)" : "var(--color-surface-2)",
                        borderColor: icon === e && !customEmoji ? "rgba(203,139,106,0.35)" : "var(--color-border)",
                        transition: "all 0.15s ease",
                      }}
                    >{e}</motion.button>
                  ))}
                </div>
              </div>

              {/* ── Options toggle ── */}
              <button
                type="button"
                onClick={() => setShowOptions((v) => !v)}
                className="flex items-center gap-2 self-start text-[13px] font-medium text-muted transition-colors hover:text-foreground"
              >
                <motion.span animate={{ rotate: showOptions ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={15} />
                </motion.span>
                {showOptions ? "Moins d'options" : "Options"}
              </button>

              <AnimatePresence initial={false}>
                {showOptions && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-5 overflow-hidden"
                  >
                    {/* Emoji personnalisé */}
                    <Field label="Emoji personnalisé">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Colle un emoji…"
                          value={customEmoji}
                          onChange={(e) => {
                            const chars = [...e.target.value]; // Unicode-aware split
                            if (chars.length > 0) {
                              const first = chars[0];
                              setCustomEmoji(first);
                              setIcon(first);
                            } else {
                              setCustomEmoji("");
                            }
                          }}
                          className="w-full rounded-[10px] border py-2 pl-3 pr-10 text-sm outline-none"
                          style={{
                            background: customEmoji ? "rgba(203,139,106,0.08)" : "var(--color-surface-2)",
                            borderColor: customEmoji ? "rgba(203,139,106,0.35)" : "var(--color-border)",
                            color: "var(--color-foreground)",
                            transition: "border-color 0.15s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(203,139,106,0.4)")}
                          onBlur={(e)  => (e.target.style.borderColor = customEmoji ? "rgba(203,139,106,0.35)" : "var(--color-border)")}
                        />
                        {customEmoji && (
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                            {customEmoji}
                          </span>
                        )}
                      </div>
                    </Field>

                    {/* Description */}
                    <Field label="Description" hint="optionnel">
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="En quoi ça consiste ?"
                        className="w-full rounded-[13px] border px-4 py-3 text-sm outline-none"
                        style={{
                          background: "var(--color-surface-2)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-foreground)",
                          transition: "border-color 0.15s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(203,139,106,0.4)")}
                        onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
                      />
                    </Field>

                    {/* Fréquence */}
                    <Field label="Fréquence">
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { value: "daily",         label: "Chaque jour" },
                          { value: "specific_days", label: "Jours précis" },
                        ] as { value: HabitFrequency; label: string }[]).map(({ value: f, label }) => {
                          const active = frequency === f;
                          return (
                            <motion.button
                              key={f} type="button" onClick={() => setFrequency(f)} whileTap={{ scale: 0.94 }}
                              className="flex items-center gap-2.5 rounded-[13px] border px-4 py-3"
                              style={{
                                background:  active ? "rgba(203,139,106,0.1)" : "var(--color-surface-2)",
                                borderColor: active ? "rgba(203,139,106,0.3)" : "var(--color-border)",
                              }}
                            >
                              <span className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: active ? "var(--color-primary)" : "rgba(255,255,255,0.18)" }} />
                              <span className="text-[12px] font-semibold"
                                style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}>
                                {label}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      <AnimatePresence mode="wait">
                        {frequency === "specific_days" && (
                          <motion.div
                            key="days"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 flex gap-1.5">
                              {DAYS.map(({ value, label }) => {
                                const sel = freqDays.includes(value);
                                return (
                                  <button
                                    key={value} type="button" onClick={() => toggleDay(value)}
                                    className="flex h-9 flex-1 items-center justify-center rounded-[9px] border text-[11px] font-semibold"
                                    style={{
                                      background:  sel ? "rgba(203,139,106,0.12)" : "var(--color-surface-2)",
                                      borderColor: sel ? "rgba(203,139,106,0.35)" : "var(--color-border)",
                                      color:       sel ? "var(--color-primary)"   : "var(--color-muted)",
                                    }}
                                  >{label}</button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Field>

                    {/* Destination */}
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
                                  background:  active ? "rgba(203,139,106,0.08)" : "var(--color-surface-2)",
                                  borderColor: active ? "rgba(203,139,106,0.25)" : "var(--color-border)",
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Erreur */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-[10px] px-4 py-3 text-sm font-medium"
                  style={{
                    background: "rgba(207,139,136,0.1)",
                    color:      "var(--color-danger)",
                    border:     "1px solid rgba(207,139,136,0.2)",
                  }}
                >{error}</motion.p>
              )}

              {/* Soumettre */}
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={submit} disabled={busy}
                className="w-full rounded-[14px] py-4 text-sm font-semibold disabled:opacity-60"
                style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
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
