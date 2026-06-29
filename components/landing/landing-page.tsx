"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  Flame,
  Users,
  Trophy,
  ArrowRight,
  ChevronRight,
  Check,
  Award,
  Zap,
  Star,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";

// ── Animation presets ──────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isVisible = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isVisible ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
      style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      <nav
        className="flex items-center justify-between px-6 py-4 md:px-12"
        style={{
          background: "linear-gradient(to bottom, rgba(11,11,13,0.92) 60%, transparent)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary"
            style={{ boxShadow: "none" }}
          >
            <Flame size={16} className="text-white" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">Momentum</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="group flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ boxShadow: "none" }}
          >
            Commencer
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
const DAYS = ["L", "M", "M", "J", "V", "S", "D"] as const;
const DONE = [true, true, true, true, true, false, false] as const;

function HeroVisual() {
  return (
    <div className="relative flex flex-col gap-3">
      {/* Main habit card */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        className="card relative overflow-hidden p-5"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Flame size={17} className="text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold">Course du matin</p>
              <p className="text-xs text-muted">5 km · Difficile</p>
            </div>
          </div>
          <span
            className="flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary"
          >
            <Flame size={11} />
            7j
          </span>
        </div>
        <div className="mt-4 flex gap-1">
          {DAYS.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[9px] uppercase text-muted">{d}</span>
              <div
                className={`flex aspect-square w-full max-w-9 items-center justify-center rounded-lg text-xs font-bold ${
                  DONE[i] ? "bg-primary text-white" : "bg-surface-2 text-muted/40"
                }`}
                style={DONE[i] ? { boxShadow: "none" } : undefined}
              >
                {DONE[i] ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row: stats + group card */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
          className="card p-4"
        >
          <p className="text-xs font-medium text-muted">Meilleure série</p>
          <p
            className="mt-1 font-display text-3xl font-semibold"
            style={{
              background: "linear-gradient(135deg, #cb8b6a, #d4a080)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            14j
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-success">
            <TrendingUp size={12} />
            +2 cette semaine
          </div>
        </motion.div>

        {/* Group card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
          className="card p-4"
        >
          <p className="text-xs font-medium text-muted">Groupe actif</p>
          <div className="mt-2 flex -space-x-2">
            {(["#cb8b6a", "#8faa7e", "#c4a882", "#cf8b88"] as const).map((bg, i) => (
              <span
                key={i}
                className="h-7 w-7 rounded-full border-2 border-surface"
                style={{ background: bg }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">4 amis actifs</p>
        </motion.div>
      </div>

      {/* Trophy notification */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
        className="card flex items-center gap-3 p-4"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15"
        >
          <Trophy size={17} className="text-warning" />
        </span>
        <div>
          <p className="text-sm font-semibold">Trophée débloqué !</p>
          <p className="text-xs text-muted">7 jours consécutifs · Flamme de la semaine</p>
        </div>
      </motion.div>

      {/* Floating badge (animated loop) */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="card absolute -right-6 top-6 z-10 flex items-center gap-1.5 px-3 py-2 text-xs shadow-2xl"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-success"
          style={{ boxShadow: "none" }}
        />
        <span className="font-semibold text-success">+12 pts</span>
        <span className="text-muted">ce matin</span>
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-dvh w-full items-center">
      {/* Full-bleed background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Orange glow — left/center */}
        <div
          className="absolute -top-40 left-0 h-[800px] w-[800px] rounded-full opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #cb8b6a 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        {/* Secondary orange — right */}
        <div
          className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #cb8b6a 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        {/* Green accent — bottom left */}
        <div
          className="absolute -bottom-20 left-1/4 h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #8faa7e 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        {/* Dot grid */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
        {/* Subtle horizontal line at the bottom */}
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(203,139,106,0.15), transparent)" }}
        />
      </div>

      {/* Content — 2 columns */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-12 pt-28 md:grid-cols-2 md:gap-16 md:px-12 lg:px-16">
        {/* Left: text */}
        <div className="flex flex-col items-start">
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur-sm"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-success"
              style={{ boxShadow: "none" }}
            />
            Défis de groupe disponibles
            <ChevronRight size={11} />
          </motion.span>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
            className="font-display text-5xl font-semibold leading-[1.04] tracking-tight lg:text-6xl xl:text-7xl"
          >
            Tes{" "}
            <span
              style={{
                background: "linear-gradient(110deg, #cb8b6a 20%, #d4a080 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              habitudes.
            </span>
            <br />
            Ton cercle.
            <br />
            Ta{" "}
            <span
              style={{
                background: "linear-gradient(110deg, #cb8b6a 20%, #d4a080 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              légende.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted lg:text-lg"
          >
            Suis tes habitudes quotidiennes, défie tes amis dans des groupes de
            challenge, et décroche des trophées qui prouvent ta discipline.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ boxShadow: "none" }}
            >
              Commencer gratuitement
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl border border-border bg-surface/50 px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition hover:bg-surface"
            >
              Se connecter
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {(["#cb8b6a", "#8faa7e", "#c4a882", "#cf8b88", "#a89e8d"] as const).map((bg, i) => (
                <span
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-background"
                  style={{ background: bg }}
                />
              ))}
            </div>
            <p className="text-xs text-muted">
              <span className="font-semibold text-foreground">1 247</span> utilisateurs actifs cette semaine
            </p>
          </motion.div>
        </div>

        {/* Right: visual */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.35, ease: EASE }}
          className="hidden md:block"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}

// ── Stats strip ────────────────────────────────────────────────────────────────
const STATS = [
  { value: "1 247", label: "Habitudes actives" },
  { value: "89", label: "Groupes formés" },
  { value: "342", label: "Trophées décernés" },
] as const;

function Stats() {
  return (
    <section className="w-full border-y border-border/50 bg-surface/30 px-6 py-12">
      <Reveal className="mx-auto grid max-w-3xl grid-cols-3 gap-8 text-center">
        {STATS.map((s, i) => (
          <motion.div key={i} variants={fadeUp}>
            <p
              className="font-display text-3xl font-semibold tracking-tight md:text-4xl"
              style={{
                background: "linear-gradient(135deg, #f6f6f7 30%, #a6a6b0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </motion.div>
        ))}
      </Reveal>
    </section>
  );
}

// ── Feature visuals ────────────────────────────────────────────────────────────
const HEAT = [2, 0, 1, 2, 1, 0, 2, 1, 2, 2, 0, 1, 2, 1, 0, 2, 1, 2, 2, 1, 0, 1, 2, 0, 2, 1, 2, 1] as const;

function StreakVisual() {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
      {HEAT.map((v, i) => (
        <div
          key={i}
          className="aspect-square rounded-sm"
          style={{
            background:
              v === 2 ? "#cb8b6a" : v === 1 ? "rgba(203,139,106,0.28)" : "rgba(255,255,255,0.05)",
            boxShadow: "none",
          }}
        />
      ))}
    </div>
  );
}

const GROUP_MEMBERS = [
  { name: "Alex", score: 92, color: "#cb8b6a" },
  { name: "Sam", score: 78, color: "#8faa7e" },
  { name: "Jules", score: 65, color: "#c4a882" },
  { name: "Mia", score: 45, color: "#cf8b88" },
] as const;

function GroupVisual() {
  return (
    <div className="space-y-2.5">
      {GROUP_MEMBERS.map((m, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 text-center text-[10px] font-medium text-muted">#{i + 1}</span>
          <span
            className="h-5 w-5 shrink-0 rounded-full border border-border/50"
            style={{ background: m.color }}
          />
          <span className="flex-1 text-xs font-medium">{m.name}</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${m.score}%`, background: m.color }} />
          </div>
          <span className="w-7 text-right text-[10px] text-muted">{m.score}</span>
        </div>
      ))}
    </div>
  );
}

type TrophyItem = {
  Icon: React.ElementType;
  name: string;
  unlocked: boolean;
};

const TROPHY_ITEMS: TrophyItem[] = [
  { Icon: Award, name: "1ère série", unlocked: true },
  { Icon: Flame, name: "7 jours", unlocked: true },
  { Icon: Zap, name: "Sprint", unlocked: true },
  { Icon: Star, name: "Légende", unlocked: false },
  { Icon: Shield, name: "Bouclier", unlocked: false },
  { Icon: Target, name: "Précision", unlocked: false },
];

function TrophyVisual() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TROPHY_ITEMS.map(({ Icon, name, unlocked }, i) => (
        <div
          key={i}
          className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
            unlocked
              ? "border-warning/30 bg-warning/10"
              : "border-border/40 bg-surface-2 opacity-40"
          }`}
        >
          <Icon size={18} className={unlocked ? "text-warning" : "text-muted"} />
          <span className="text-center text-[9px] font-medium leading-tight text-muted">{name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────────
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  visual: React.ReactNode;
  accentColor: string;
};

function FeatureCard({ icon, title, desc, visual, accentColor }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, transition: { duration: 0.25, ease: EASE } }}
      className="card group relative flex flex-col overflow-hidden p-6"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 40% 0%, ${accentColor}18 0%, transparent 65%)` }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }}
      />
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: `${accentColor}20` }}
      >
        {icon}
      </span>
      <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{desc}</p>
      <div className="mt-6">{visual}</div>
    </motion.div>
  );
}

// ── Features section ───────────────────────────────────────────────────────────
function Features() {
  return (
    <section className="w-full px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-14 flex flex-col items-center text-center">
          <motion.span
            variants={fadeUp}
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            Fonctionnalités
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Tout ce dont tu as besoin
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-lg text-base text-muted">
            Trois piliers pour construire une routine solide et rester motivé au quotidien.
          </motion.p>
        </Reveal>

        <Reveal className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Flame size={22} className="text-primary" />}
            title="Habitudes"
            desc="Crée et suis tes habitudes quotidiennes avec un système de séries qui récompense ta régularité."
            visual={<StreakVisual />}
            accentColor="#cb8b6a"
          />
          <FeatureCard
            icon={<Users size={22} className="text-success" />}
            title="Groupes"
            desc="Rejoins des groupes de challenge. La compétition saine comme moteur de ta progression."
            visual={<GroupVisual />}
            accentColor="#8faa7e"
          />
          <FeatureCard
            icon={<Trophy size={22} className="text-warning" />}
            title="Trophées"
            desc="Débloque des achievements qui matérialisent ta progression. Chaque effort est récompensé."
            visual={<TrophyVisual />}
            accentColor="#c4a882"
          />
        </Reveal>
      </div>
    </section>
  );
}

// ── How it works ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Crée ton compte",
    desc: "Inscription en 30 secondes. Aucune carte bancaire requise.",
  },
  {
    num: "02",
    title: "Ajoute tes habitudes",
    desc: "Définis tes objectifs, choisis la difficulté et visualise ta progression.",
  },
  {
    num: "03",
    title: "Invite tes amis",
    desc: "Forme un groupe de challenge et restez motivés ensemble.",
  },
] as const;

function HowItWorks() {
  return (
    <section className="w-full px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-14 flex flex-col items-center text-center">
          <motion.span
            variants={fadeUp}
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            Comment ça marche
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Aussi simple que ça
          </motion.h2>
        </Reveal>

        <Reveal className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative flex flex-col items-center text-center"
            >
              {i < STEPS.length - 1 && (
                <div
                  className="absolute top-6 hidden h-px bg-gradient-to-r from-primary/30 to-transparent md:block"
                  style={{ left: "calc(50% + 28px)", width: "calc(100% - 56px)" }}
                />
              )}
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 font-display text-sm font-semibold text-primary">
                {s.num}
              </span>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </motion.div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="w-full px-6 py-24">
      <Reveal className="mx-auto max-w-3xl">
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-primary/20 p-10 text-center md:p-14"
          style={{
            background: "linear-gradient(135deg, rgba(203,139,106,0.1) 0%, rgba(22,20,15,0.85) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.28]"
            style={{
              background: "radial-gradient(circle, #cb8b6a 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Prêt à devenir une légende ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted">
            Rejoins des milliers d&apos;utilisateurs qui transforment leur routine chaque jour.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white transition hover:brightness-110"
              style={{ boxShadow: "none" }}
            >
              Commencer gratuitement
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted">
            {["Gratuit pour toujours", "Sans carte bancaire", "Synchronisation instantanée"].map(
              (f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check size={11} className="text-success" />
                  {f}
                </li>
              )
            )}
          </ul>
        </motion.div>
      </Reveal>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="w-full border-t border-border/50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-muted md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <Flame size={12} className="text-white" />
          </span>
          <span className="font-display font-semibold text-foreground">Momentum</span>
          <span className="ml-2 text-muted/50">© 2026</span>
        </div>
        <nav className="flex gap-6">
          {(
            [
              ["Connexion", "/login"],
              ["Inscription", "/signup"],
            ] as const
          ).map(([label, href]) => (
            <Link key={href} href={href} className="transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex w-full flex-col">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
