import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/focus-utils";

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  running: boolean;
  size?: number;
}

export function RadialTimer({ seconds, totalSeconds, running, size = 220 }: TimerProps) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, 1 - seconds / Math.max(1, totalSeconds)));
  const offset = c * (1 - progress);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--pink)" />
            <stop offset="50%" stopColor="var(--lavender)" />
            <stop offset="100%" stopColor="var(--mint)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
          opacity={0.4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s linear", filter: "drop-shadow(0 0 12px var(--primary))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className={`font-bold tabular-nums tracking-tight ${size > 200 ? "text-5xl" : "text-3xl"} ${running ? "animate-pulse-glow" : ""}`}>
            {formatTime(seconds)}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {running ? "in flow" : "ready"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function useCountdown(initialSec: number) {
  const [seconds, setSeconds] = useState(initialSec);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          beep();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  return {
    seconds,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (n?: number) => {
      setRunning(false);
      setSeconds(n ?? initialSec);
    },
    setSeconds,
  };
}

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 660;
    o.type = "sine";
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch {
    /* noop */
  }
}
