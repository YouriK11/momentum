"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Camera, Users, ListChecks, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { createHabit } from "@/app/(app)/habits/actions";
import type { HabitLevel } from "@/lib/types";

// ── Habit templates ────────────────────────────────────────────────────────────
const TEMPLATES: { icon: string; name: string; desc: string; level: HabitLevel }[] = [
  { icon: "🏃", name: "Sport",        desc: "30 min d'activité physique",   level: "facile" },
  { icon: "📚", name: "Lecture",      desc: "20 min de lecture",            level: "facile" },
  { icon: "💧", name: "Hydratation",  desc: "Boire 2 litres d'eau",         level: "facile" },
  { icon: "😴", name: "Sommeil",      desc: "Se coucher avant 23h",         level: "moyen"  },
  { icon: "🧘", name: "Méditation",   desc: "5 min de pleine conscience",   level: "facile" },
];

const DEFAULT_WEIGHT: Record<HabitLevel, number> = { facile: 1, moyen: 2, difficile: 3 };

type Step = 1 | 2 | 3;

// ── Main ───────────────────────────────────────────────────────────────────────
export function OnboardingModal({
  userId, username, avatarUrl,
}: {
  userId: string;
  username: string;
  avatarUrl: string | null;
}) {
  const router   = useRouter();
  const supabase = createClient();

  const [step,       setStep]       = useState<Step>(1);
  const [visible,    setVisible]    = useState(true);
  const [groupName,  setGroupName]  = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupBusy,  setGroupBusy]  = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [selected,   setSelected]   = useState<Set<number>>(new Set());
  const [habitBusy,  setHabitBusy]  = useState(false);

  async function markDone() {
    await supabase.from("profiles").update({ onboarded: true }).eq("id", userId);
    setVisible(false);
    router.refresh();
  }

  async function createGroup() {
    if (!groupName.trim()) { setGroupError("Donne un nom au groupe."); return; }
    setGroupBusy(true); setGroupError(null);
    const { error } = await supabase.rpc("create_group", { p_name: groupName.trim() });
    setGroupBusy(false);
    if (error) { setGroupError(error.message); return; }
    setStep(3);
  }

  async function joinGroup() {
    if (!inviteCode.trim()) { setGroupError("Entre un code d'invitation."); return; }
    setGroupBusy(true); setGroupError(null);
    const { error } = await supabase.rpc("join_group_by_code", { p_code: inviteCode.trim() });
    setGroupBusy(false);
    if (error) { setGroupError(error.message); return; }
    setStep(3);
  }

  async function createSelectedHabits() {
    if (selected.size === 0) { await markDone(); return; }
    setHabitBusy(true);
    await Promise.all(
      [...selected].map((i) => {
        const t = TEMPLATES[i];
        return createHabit({
          userId,
          name:          t.name,
          description:   t.desc,
          icon:          t.icon,
          level:         t.level,
          weight:        DEFAULT_WEIGHT[t.level],
          scope:         "perso",
          groupId:       null,
          frequency:     "daily",
          frequencyDays: null,
          frequencyX:    null,
        });
      })
    );
    setHabitBusy(false);
    await markDone();
  }

  function toggleTemplate(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const nextStep = () => setStep((s) => Math.min(3, s + 1) as Step);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black/70"
        style={{ backdropFilter: "blur(8px)" }}
        onClick={markDone}
      />

      {/* Modal panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center sm:inset-0 sm:items-center sm:px-4">
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Configuration du compte"
          className="relative w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[28px]"
          style={{
            background: "var(--color-surface)",
            backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 40%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 -24px 80px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5)",
            maxHeight: "90dvh",
            overflow: "hidden auto",
            paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
          }}
        >
          {/* ── Header: progress + close ──────────────────────────────────── */}
          <div
            className="sticky top-0 z-10 flex items-center gap-3 px-5 pt-4 pb-3"
            style={{ background: "var(--color-surface)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex flex-1 items-center gap-2">
              {([1, 2, 3] as Step[]).map((s) => (
                <motion.span
                  key={s}
                  animate={{
                    width: step === s ? 22 : 6,
                    background: step >= s ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="h-1.5 rounded-full"
                  style={{ display: "inline-block" }}
                />
              ))}
              <span className="ml-1 text-[11px] font-semibold text-muted">{step}/3</span>
            </div>
            <button
              onClick={markDone}
              aria-label="Passer l'onboarding"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Step content ─────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6 px-5 pt-5"
            >
              {step === 1 && (
                <AvatarStep userId={userId} username={username} avatarUrl={avatarUrl} />
              )}
              {step === 2 && (
                <GroupStep
                  groupName={groupName}   setGroupName={setGroupName}
                  inviteCode={inviteCode} setInviteCode={setInviteCode}
                  busy={groupBusy}        error={groupError}
                  onCreate={createGroup}  onJoin={joinGroup}
                />
              )}
              {step === 3 && (
                <HabitsStep selected={selected} onToggle={toggleTemplate} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
            <button
              onClick={markDone}
              className="text-[13px] font-medium text-muted transition-colors hover:text-foreground"
            >
              {step === 3 ? "Terminer sans ajouter" : "Passer →"}
            </button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={habitBusy}
              onClick={step === 3 ? createSelectedHabits : nextStep}
              className="flex items-center gap-2 rounded-[14px] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: "var(--color-primary)" }}
            >
              {step === 3
                ? habitBusy
                  ? "Création…"
                  : selected.size > 0
                  ? `Créer ${selected.size} habitude${selected.size > 1 ? "s" : ""}`
                  : "Terminer"
                : <><span>Suivant</span><ArrowRight size={14} /></>}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Step 1: Avatar ─────────────────────────────────────────────────────────────
function AvatarStep({ userId, username, avatarUrl }: {
  userId: string; username: string; avatarUrl: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-6 pb-4">
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]"
          style={{ background: "rgba(203,139,106,0.12)", border: "1px solid rgba(203,139,106,0.2)" }}
        >
          <Camera size={22} style={{ color: "var(--color-primary)" }} />
        </div>
        <h2 className="font-display text-xl font-semibold">Photo de profil</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Mets un visage sur ton compte — c&apos;est plus sympa pour ton groupe.
        </p>
      </div>
      <AvatarUploader userId={userId} username={username} avatarUrl={avatarUrl} />
    </div>
  );
}

// ── Step 2: Groupe ─────────────────────────────────────────────────────────────
function GroupStep({ groupName, setGroupName, inviteCode, setInviteCode, busy, error, onCreate, onJoin }: {
  groupName: string;  setGroupName: (v: string) => void;
  inviteCode: string; setInviteCode: (v: string) => void;
  busy: boolean; error: string | null;
  onCreate: () => void; onJoin: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]"
          style={{ background: "rgba(143,170,126,0.12)", border: "1px solid rgba(143,170,126,0.2)" }}
        >
          <Users size={22} style={{ color: "var(--color-success)" }} />
        </div>
        <h2 className="font-display text-xl font-semibold">Rejoins ou crée un groupe</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Progresse en équipe et compare ta constance à celle de tes amis.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Create */}
        <div className="flex gap-2">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
            placeholder="Nom du groupe"
            className="flex-1 rounded-[13px] border px-4 py-3 text-sm outline-none focus:border-primary/50"
            style={{ background: "var(--color-surface-2)", borderColor: "rgba(255,255,255,0.07)", color: "var(--color-foreground)" }}
          />
          <button
            onClick={onCreate}
            disabled={busy || !groupName.trim()}
            className="shrink-0 rounded-[13px] px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "rgba(203,139,106,0.12)", color: "var(--color-primary)", border: "1px solid rgba(203,139,106,0.2)" }}
          >
            {busy ? "…" : "Créer"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">ou</span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Join */}
        <div className="flex gap-2">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && onJoin()}
            placeholder="Code d'invitation"
            className="flex-1 rounded-[13px] border px-4 py-3 text-sm uppercase outline-none focus:border-success/50"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "rgba(255,255,255,0.07)",
              color: "var(--color-foreground)",
              letterSpacing: "0.08em",
            }}
          />
          <button
            onClick={onJoin}
            disabled={busy || !inviteCode.trim()}
            className="shrink-0 rounded-[13px] px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "rgba(143,170,126,0.12)", color: "var(--color-success)", border: "1px solid rgba(143,170,126,0.2)" }}
          >
            {busy ? "…" : "Rejoindre"}
          </button>
        </div>

        {error && (
          <p
            className="rounded-[10px] px-4 py-3 text-sm"
            style={{ background: "rgba(207,139,136,0.12)", color: "var(--color-danger)", border: "1px solid rgba(207,139,136,0.2)" }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Step 3: Habits ────────────────────────────────────────────────────────────
function HabitsStep({ selected, onToggle }: { selected: Set<number>; onToggle: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]"
          style={{ background: "rgba(203,139,106,0.12)", border: "1px solid rgba(203,139,106,0.2)" }}
        >
          <ListChecks size={22} style={{ color: "var(--color-primary)" }} />
        </div>
        <h2 className="font-display text-xl font-semibold">Tes premières habitudes</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Sélectionne celles qui te parlent — tu pourras en ajouter d&apos;autres plus tard.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {TEMPLATES.map((t, i) => {
          const isSelected = selected.has(i);
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.985 }}
              onClick={() => onToggle(i)}
              className="flex items-center gap-4 rounded-[16px] border px-4 py-3.5 text-left"
              style={{
                background:  isSelected ? "rgba(203,139,106,0.08)" : "var(--color-surface-2)",
                borderColor: isSelected ? "rgba(203,139,106,0.28)" : "rgba(255,255,255,0.07)",
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
            >
              <span className="text-2xl leading-none">{t.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-snug">{t.name}</p>
                <p className="text-[12px] text-muted">{t.desc}</p>
              </div>
              <motion.div
                animate={
                  isSelected
                    ? { scale: 1, opacity: 1, backgroundColor: "var(--color-primary)" }
                    : { scale: 0.65, opacity: 0.25, backgroundColor: "rgba(255,255,255,0.08)" }
                }
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              >
                <Check size={10} strokeWidth={3.5} className="text-white" />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
