import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCalibrated } from "@/lib/storage";
import { celebrate } from "@/components/focus/Confetti";
import { ShieldCheck, Target, Eye, Sparkles, RotateCcw, Check } from "lucide-react";

export const Route = createFileRoute("/gatekeeper")({
  head: () => ({
    meta: [
      { title: "Focus Gatekeeper — Aperion" },
      {
        name: "description",
        content: "A 2-step calibration sequence to unlock deep work mode.",
      },
      { property: "og:title", content: "Focus Gatekeeper — Aperion" },
      {
        property: "og:description",
        content: "Earn your focus. Pass the Purge and Stroop tests to enter session mode.",
      },
    ],
  }),
  component: GatekeeperPage,
});

const PURGE_TARGET = 10;
const STROOP_TARGET = 5;
const COLORS = [
  { name: "RED", value: "oklch(0.65 0.22 25)" },
  { name: "BLUE", value: "oklch(0.55 0.2 250)" },
  { name: "GREEN", value: "oklch(0.65 0.18 150)" },
  { name: "YELLOW", value: "oklch(0.85 0.16 90)" },
  { name: "PURPLE", value: "oklch(0.55 0.2 305)" },
];

function GatekeeperPage() {
  const [calibrated, setCalibrated] = useCalibrated();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [purgeHits, setPurgeHits] = useState(0);
  const [activeCircle, setActiveCircle] = useState<number>(() => 0);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopWord, setStroopWord] = useState(0);
  const [stroopColor, setStroopColor] = useState(1);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Purge: flash a random circle every 500ms
  useEffect(() => {
    if (step !== 1) return;
    intervalRef.current = setInterval(() => {
      setActiveCircle(Math.floor(Math.random() * 9));
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step]);

  // Pick a fresh stroop pair where word !== color
  const newStroop = () => {
    const w = Math.floor(Math.random() * COLORS.length);
    let c = Math.floor(Math.random() * COLORS.length);
    while (c === w) c = Math.floor(Math.random() * COLORS.length);
    setStroopWord(w);
    setStroopColor(c);
  };

  useEffect(() => {
    if (step === 2) newStroop();
  }, [step]);

  const handleCircleClick = (i: number) => {
    if (i !== activeCircle) return;
    const next = purgeHits + 1;
    setPurgeHits(next);
    setActiveCircle(-1);
    if (next >= PURGE_TARGET) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStep(2);
    }
  };

  const handleStroopAnswer = (idx: number) => {
    if (idx === stroopColor) {
      const next = stroopScore + 1;
      setStroopScore(next);
      setFeedback("good");
      setTimeout(() => setFeedback(null), 250);
      if (next >= STROOP_TARGET) {
        setStep(3);
        setCalibrated(true);
        celebrate();
      } else {
        newStroop();
      }
    } else {
      setFeedback("bad");
      setTimeout(() => setFeedback(null), 350);
    }
  };

  const reset = () => {
    setCalibrated(false);
    setStep(1);
    setPurgeHits(0);
    setStroopScore(0);
    setFeedback(null);
  };

  const purgePct = (purgeHits / PURGE_TARGET) * 100;
  const stroopPct = (stroopScore / STROOP_TARGET) * 100;

  // Already calibrated landing
  if (calibrated && step !== 3) {
    return (
      <div className="space-y-6">
        <SessionActiveCard onReset={reset} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="animate-slide-up flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-sunset text-white shadow-soft">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            <span className="text-aurora">Focus Gatekeeper</span>
          </h1>
          <p className="text-foreground/70">
            Earn your focus. Pass calibration to unlock the modules.
          </p>
        </div>
      </header>

      {/* Progress rail */}
      <div className="grid grid-cols-2 gap-3">
        <StepBadge n={1} label="The Purge" active={step === 1} done={step > 1} icon={Target} />
        <StepBadge n={2} label="Stroop Test" active={step === 2} done={step > 2} icon={Eye} />
      </div>

      {step === 1 && (
        <section className="animate-slide-up rounded-3xl glass p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Step 1 — The Purge</h2>
              <p className="text-sm text-foreground/70">
                A circle flashes every 0.5s. Tap it. Land {PURGE_TARGET} hits.
              </p>
            </div>
            <span className="rounded-full gradient-aurora px-3 py-1 text-sm font-bold text-white shadow-soft tabular-nums">
              {purgeHits}/{PURGE_TARGET}
            </span>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full gradient-aurora transition-all"
              style={{ width: `${purgePct}%` }}
            />
          </div>
          <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => {
              const isActive = i === activeCircle;
              return (
                <button
                  key={i}
                  onClick={() => handleCircleClick(i)}
                  aria-label={`Target ${i + 1}`}
                  className={`liquid-press aspect-square rounded-full border transition-all ${
                    isActive
                      ? "gradient-sunset border-transparent scale-105 shadow-[0_0_30px_oklch(0.86_0.09_12_/_70%)]"
                      : "bg-muted/60 border-border hover:bg-muted"
                  }`}
                />
              );
            })}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="animate-slide-up rounded-3xl glass p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Step 2 — Stroop Test</h2>
              <p className="text-sm text-foreground/70">
                Tap the <span className="font-bold">font color</span>, not the word.
              </p>
            </div>
            <span className="rounded-full gradient-dream px-3 py-1 text-sm font-bold text-foreground shadow-soft tabular-nums">
              {stroopScore}/{STROOP_TARGET}
            </span>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full gradient-dream transition-all"
              style={{ width: `${stroopPct}%` }}
            />
          </div>

          <div
            className={`grid place-items-center rounded-3xl glass p-10 transition-all ${
              feedback === "good"
                ? "ring-4 ring-mint"
                : feedback === "bad"
                ? "ring-4 ring-destructive animate-shake"
                : ""
            }`}
          >
            <div
              className="text-6xl font-extrabold tracking-widest sm:text-8xl"
              style={{ color: COLORS[stroopColor].value }}
            >
              {COLORS[stroopWord].name}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {COLORS.map((c, i) => (
              <button
                key={c.name}
                onClick={() => handleStroopAnswer(i)}
                className="liquid-press rounded-2xl px-3 py-3 text-sm font-bold text-white shadow-soft hover-lift"
                style={{ background: c.value }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && <SessionActiveCard onReset={reset} />}
    </div>
  );
}

function StepBadge({
  n,
  label,
  active,
  done,
  icon: Icon,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  icon: typeof Target;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-soft transition-all ${
        done
          ? "gradient-forest text-foreground"
          : active
          ? "gradient-aurora text-white"
          : "glass text-foreground/70"
      }`}
    >
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/30">
        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Step {n}</div>
        <div className="text-sm font-bold">{label}</div>
      </div>
    </div>
  );
}

function SessionActiveCard({ onReset }: { onReset: () => void }) {
  const modules = useMemo(
    () => [
      { to: "/friction" as const, label: "The Vibe Check" },
      { to: "/ghost" as const, label: "The Focus Vault" },
      { to: "/triage" as const, label: "The Echo" },
      { to: "/dashboard" as const, label: "Dashboard" },
    ],
    []
  );
  return (
    <section className="animate-slide-up relative overflow-hidden rounded-[2rem] glass p-8 text-center shadow-soft sm:p-12">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full gradient-forest opacity-50 blur-3xl animate-float-orb" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full gradient-dream opacity-50 blur-3xl animate-float-orb" />
      <div className="relative">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl gradient-forest text-foreground shadow-soft animate-pulse-glow">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/70">
          System Initialized
        </div>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          <span className="text-aurora">SESSION ACTIVE</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
          Calibration complete. Your modules are unlocked. Choose your next move.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {modules.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="liquid-press hover-lift rounded-2xl glass px-4 py-2 text-sm font-semibold text-foreground"
            >
              {m.label}
            </Link>
          ))}
        </div>
        <button
          onClick={onReset}
          className="liquid-press mt-5 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-foreground/70 hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" /> Recalibrate
        </button>
      </div>
    </section>
  );
}
