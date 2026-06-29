"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Archive, ChevronRight, Pencil, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitLevel, HabitFrequency } from "@/lib/types";
import { archiveHabit } from "@/app/(app)/habits/actions";
import { HabitSheet } from "@/components/habits/habit-sheet";
import { useToast } from "@/components/ui/toast";

// ── Constants ──────────────────────────────────────────────────────────────────
const ACCENT: Record<HabitLevel, string> = {
  facile: "#8faa7e", moyen: "#c4a882", difficile: "#cf8b88",
};
const LEVEL_LABEL: Record<HabitLevel, string> = {
  facile: "Facile", moyen: "Moyen", difficile: "Difficile",
};
const FREQ_LABEL: Record<HabitFrequency, string> = {
  daily:         "Quotidien",
  specific_days: "Jours précis",
  x_per_week:    "X / semaine",
};

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
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState<Habit | undefined>(undefined);
  const [archiving,   setArchiving]   = useState<string | null>(null);

  function openCreate() { setEditTarget(undefined); setSheetOpen(true); }
  function openEdit(h: Habit) { setEditTarget(h); setSheetOpen(true); }

  async function archive(id: string) {
    setArchiving(id);
    const { error } = await archiveHabit(id);
    setArchiving(null);
    if (error) { toast("Impossible d'archiver cette habitude.", "error"); return; }
    router.refresh();
  }

  const mine   = habits.filter((h) => h.owner_id === userId);
  const others = habits.filter((h) => h.owner_id !== userId);

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex w-full items-center justify-between rounded-[18px] border border-dashed px-6 py-5 text-left"
          style={{ borderColor: "rgba(203,139,106,0.2)", background: "rgba(203,139,106,0.03)" }}
        >
          <span className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary"
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
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
                    userId={userId}
                    isArchiving={archiving === h.id}
                    onArchive={() => archive(h.id)}
                    onEdit={() => openEdit(h)}
                    canManage
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
                  <HabitCard key={h.id} habit={h} index={i} userId={userId}
                    isArchiving={false} onArchive={() => {}} onEdit={() => {}} canManage={false} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Empty state */}
        {mine.length === 0 && others.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center gap-3 p-12 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--color-surface-2)" }}>
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <p className="font-semibold">Lance-toi !</p>
              <p className="mt-1 text-sm text-muted">Crée ta première habitude avec le bouton ci-dessus.</p>
            </div>
          </motion.div>
        )}
      </div>

      <HabitSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        userId={userId}
        groups={groups}
        habitToEdit={editTarget}
        onSuccess={() => { setSheetOpen(false); router.refresh(); }}
      />
    </>
  );
}

// ── HabitCard ─────────────────────────────────────────────────────────────────
function HabitCard({ habit: h, index, userId, isArchiving, onArchive, onEdit, canManage }: {
  habit: Habit; index: number; userId: string;
  isArchiving: boolean; onArchive: () => void; onEdit: () => void; canManage: boolean;
}) {
  const accent      = ACCENT[h.level];
  const supabase    = useMemo(() => createClient(), []);
  const [showHist,  setShowHist]  = useState(false);
  const [histDates, setHistDates] = useState<string[]>([]);
  const [histBusy,  setHistBusy]  = useState(false);

  async function toggleHistory() {
    if (!showHist && histDates.length === 0) {
      setHistBusy(true);
      const from = new Date(Date.now() - 27 * 864e5).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("habit_logs")
        .select("log_date")
        .eq("habit_id", h.id)
        .eq("user_id", userId)
        .eq("status", true)
        .gte("log_date", from);
      setHistDates((data ?? []).map((l) => l.log_date));
      setHistBusy(false);
    }
    setShowHist((v) => !v);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -64, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      className="card flex flex-col overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] text-2xl"
          style={{ background: accent + "22" }}>
          {h.icon ?? "🎯"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug text-foreground">{h.name}</p>
          <p className="mt-0.5 text-[12px] text-muted">
            {h.scope === "commune" ? "Groupe" : "Perso"} · {FREQ_LABEL[h.frequency ?? "daily"]}
          </p>
        </div>

        <span className="shrink-0 rounded-[9px] px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: accent + "1e", color: accent }}>
          {LEVEL_LABEL[h.level]}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
            onClick={toggleHistory}
            title="Voir l'historique"
            disabled={histBusy}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
          >
            <CalendarDays size={14} />
          </motion.button>

          {canManage && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                onClick={onEdit}
                title="Modifier l'habitude"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-muted transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Pencil size={13} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                onClick={onArchive} disabled={isArchiving}
                title="Archiver l'habitude"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-40"
              >
                <Archive size={14} />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* History heatmap */}
      <AnimatePresence>
        {showHist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <HabitHeatmap dates={histDates} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── HabitHeatmap — 28 derniers jours en grille 4×7 ───────────────────────────
function HabitHeatmap({ dates }: { dates: string[] }) {
  const doneSet = new Set(dates);

  // Générer les 28 derniers jours (du plus ancien au plus récent)
  const today = new Date().toISOString().slice(0, 10);
  const days  = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(Date.now() - (27 - i) * 864e5);
    return d.toISOString().slice(0, 10);
  });

  // Découper en 4 semaines
  const weeks = [days.slice(0, 7), days.slice(7, 14), days.slice(14, 21), days.slice(21, 28)];

  const MONTHS_FR = ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
  const firstDay  = new Date(days[0]);
  const lastDay   = new Date(days[27]);
  const rangeLabel = firstDay.getMonth() === lastDay.getMonth()
    ? `${MONTHS_FR[firstDay.getMonth()]}`
    : `${MONTHS_FR[firstDay.getMonth()]} – ${MONTHS_FR[lastDay.getMonth()]}`;

  return (
    <div className="px-5 pb-5 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          28 derniers jours
        </p>
        <p className="text-[11px] text-muted">{rangeLabel}</p>
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((date) => {
              const done    = doneSet.has(date);
              const isToday = date === today;
              return (
                <motion.div
                  key={date}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wi * 7 + week.indexOf(date)) * 0.012, duration: 0.2 }}
                  title={date}
                  className="flex-1 rounded-[4px]"
                  style={{
                    height: 14,
                    background: done
                      ? "var(--color-primary)"
                      : "rgba(255,255,255,0.05)",
                    boxShadow: "none",
                    outline: isToday ? "1px solid rgba(203,139,106,0.4)" : "none",
                    outlineOffset: 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-right text-[11px] text-muted">
        {dates.length} / 28 jours complétés
      </p>
    </div>
  );
}
