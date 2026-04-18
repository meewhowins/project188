import { useEffect, useRef, useState } from "react";
import { useCalibrated } from "@/lib/storage";
import { celebrate } from "@/components/focus/Confetti";
import { ShieldCheck, Target, Eye, Sparkles, Check } from "lucide-react";

const PURGE_TARGET = 10;
const STROOP_TARGET = 5;
const COLORS = [
  { name: "RED", value: "oklch(0.55 0.22 25)" },
  { name: "BLUE", value: "oklch(0.45 0.2 250)" },
  { name: "GREEN", value: "oklch(0.5 0.18 150)" },
  { name: "YELLOW", value: "oklch(0.75 0.16 90)" },
  { name: "PURPLE", value: "oklch(0.45 0.2 305)" },
];

export function GatekeeperOverlay() {
  const [calibrated, setCalibrated] = useCalibrated();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [purgeHits, setPurgeHits] = useState(0);
  const [activeCircle, setActiveCircle] = useState<number>(-1);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopWord, setStroopWord] = useState(0);
  const [stroopColor, setStroopColor] = useState(1);
  const [stroopOptions, setStroopOptions] = useState<number[]>([0, 1, 2]);
  const [stroopTimeLeft, setStroopTimeLeft] = useState(1500);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const [hideOverlay, setHideOverlay] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stroopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stroopDeadlineRef = useRef<number>(0);

  // Purge: flash a random circle every 0.8s
  useEffect(() => {
    if (calibrated || step !== 1) return;
    intervalRef.current = setInterval(() => {
      setActiveCircle(Math.floor(Math.random() * 9));
    }, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step, calibrated]);

  const newStroop = () => {
    const w = Math.floor(Math.random() * COLORS.length);
    let c = Math.floor(Math.random() * COLORS.length);
    while (c === w) c = Math.floor(Math.random() * COLORS.length);
    const others = COLORS.map((_, i) => i).filter((i) => i !== c);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const opts = [c, others[0], others[1]];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setStroopWord(w);
    setStroopColor(c);
    setStroopOptions(opts);
    setStroopTimeLeft(1500);
    stroopDeadlineRef.current = Date.now() + 1500;
  };

  useEffect(() => {
    if (step === 2) newStroop();
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;
    stroopTimerRef.current = setInterval(() => {
      const remaining = stroopDeadlineRef.current - Date.now();
      if (remaining <= 0) {
        setFeedback("bad");
        setTimeout(() => setFeedback(null), 350);
        newStroop();
      } else {
        setStroopTimeLeft(remaining);
      }
    }, 50);
    return () => {
      if (stroopTimerRef.current) clearInterval(stroopTimerRef.current);
    };
  }, [step]);

  // After step 3 shows, fade away
  useEffect(() => {
    if (step !== 3) return;
    const t = setTimeout(() => {
      setHideOverlay(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [step]);

  if (calibrated && hideOverlay) return null;
  if (calibrated && step !== 3) return null;

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
        if (stroopTimerRef.current) clearInterval(stroopTimerRef.current);
        setStep(3);
        setCalibrated(true);
        celebrate();
      } else {
        newStroop();
      }
    } else {
      setFeedback("bad");
      setTimeout(() => setFeedback(null), 350);
      newStroop();
    }
  };

  const purgePct = (purgeHits / PURGE_TARGET) * 100;
  const stroopPct = (stroopScore / STROOP_TARGET) * 100;

  return (
    <div
      className={`fixed inset-0 z-[60] grid place-items-center overflow-y-auto px-4 py-6 transition-all duration-700 ${
        step === 3 ? "animate-fade-in" : ""
      } ${hideOverlay ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{
        background:
          "radial-gradient(1000px 700px at 20% 0%, oklch(0.92 0.04 295 / 95%), transparent 60%), radial-gradient(900px 700px at 80% 100%, oklch(0.88 0.05 220 / 95%), transparent 60%), oklch(0.985 0.01 320 / 92%)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Focus Gatekeeper Calibration"
    >
      <div className="w-full max-w-2xl space-y-5">
        <header className="animate-slide-up flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-sunset text-white shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-deep-gradient">Focus Gatekeeper</span>
            </h1>
            <p className="text-sm font-medium text-foreground sm:text-base">
              Earn your focus. Pass calibration to unlock the modules.
            </p>
          </div>
        </header>

        {step !== 3 && (
          <div className="grid grid-cols-2 gap-3">
            <StepBadge n={1} label="The Purge" active={step === 1} done={step > 1} icon={Target} />
            <StepBadge n={2} label="Stroop Test" active={step === 2} done={step > 2} icon={Eye} />
          </div>
        )}

        {step === 1 && (
          <section className="animate-slide-up rounded-3xl glass p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Step 1 — The Purge</h2>
                <p className="text-sm font-medium text-foreground/90">
                  A circle flashes every 0.8s. Tap it. Land {PURGE_TARGET} hits.
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
                    className={`liquid-press aspect-square rounded-full border-2 transition-all ${
                      isActive
                        ? "border-transparent scale-110 shadow-[0_0_40px_oklch(0.7_0.2_150_/_80%)]"
                        : "bg-muted/70 border-border hover:bg-muted"
                    }`}
                    style={
                      isActive
                        ? { background: "oklch(0.72 0.22 145)" }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-slide-up rounded-3xl glass p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Step 2 — Stroop Test</h2>
                <p className="text-sm font-medium text-foreground/90">
                  Tap the <span className="font-bold">font color</span>, not the word. 1.5s per round.
                </p>
              </div>
              <span className="rounded-full gradient-dream px-3 py-1 text-sm font-bold text-foreground shadow-soft tabular-nums">
                {stroopScore}/{STROOP_TARGET}
              </span>
            </div>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-dream transition-all"
                style={{ width: `${stroopPct}%` }}
              />
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
              <div
                className="h-full gradient-sunset transition-[width] duration-75 ease-linear"
                style={{ width: `${Math.max(0, (stroopTimeLeft / 1500) * 100)}%` }}
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

            <div className="mt-5 grid grid-cols-3 gap-3">
              {stroopOptions.map((i) => {
                const c = COLORS[i];
                return (
                  <button
                    key={c.name}
                    onClick={() => handleStroopAnswer(i)}
                    className="liquid-press rounded-2xl px-3 py-4 text-sm font-extrabold text-white shadow-soft hover-lift"
                    style={{ background: c.value, textShadow: "0 1px 2px oklch(0 0 0 / 50%)" }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-slide-up relative overflow-hidden rounded-[2rem] glass p-8 text-center shadow-elevated sm:p-12">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full gradient-forest opacity-50 blur-3xl animate-float-orb" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full gradient-dream opacity-50 blur-3xl animate-float-orb" />
            <div className="relative">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl gradient-forest text-foreground shadow-soft animate-pulse-glow">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                System Initialized
              </div>
              <h2 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-6xl">
                <span className="text-deep-gradient">SESSION ACTIVE</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm font-medium text-foreground sm:text-base">
                Calibration complete. Unlocking modules…
              </p>
            </div>
          </section>
        )}
      </div>
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
          : "glass text-foreground"
      }`}
    >
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/40">
        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Step {n}</div>
        <div className="text-sm font-bold">{label}</div>
      </div>
    </div>
  );
}
