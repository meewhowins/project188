import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { prescribe } from "@/lib/focus-utils";
import {
  useFocusState,
  uid,
  SUBJECTS,
  type Noise,
  type Subject,
  type TaskComplexity,
} from "@/lib/storage";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Stethoscope, MapPin, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/triage")({
  head: () => ({
    meta: [
      { title: "The Echo — Aperion" },
      {
        name: "description",
        content: "Energy + complexity + noise + subject → prescribed sprint type, length, and spot.",
      },
      { property: "og:title", content: "The Echo — Aperion" },
      {
        property: "og:description",
        content: "A pre-flight checklist for your brain before a deep work session.",
      },
    ],
  }),
  component: TriagePage,
});

const complexities: { value: TaskComplexity; label: string; emoji: string }[] = [
  { value: "simple", label: "Simple", emoji: "📖" },
  { value: "med", label: "Medium", emoji: "✍️" },
  { value: "hard", label: "Hard", emoji: "🧠" },
];

const noises: { value: Noise; label: string; emoji: string }[] = [
  { value: "quiet", label: "Quiet", emoji: "🤫" },
  { value: "noisy", label: "Noisy", emoji: "🔊" },
];

function TriagePage() {
  const [state, update] = useFocusState();
  const [energy, setEnergy] = useState(7);
  const [complexity, setComplexity] = useState<TaskComplexity>("hard");
  const [noise, setNoise] = useState<Noise>("quiet");
  const [subject, setSubject] = useState<Subject>("Computer Science");

  const rx = useMemo(
    () => prescribe({ energy, complexity, noise, subject }),
    [energy, complexity, noise, subject]
  );

  const save = () => {
    update((s) => ({
      ...s,
      triage: [
        ...s.triage,
        {
          id: uid(),
          ts: Date.now(),
          energy,
          complexity,
          noise,
          subject,
          prescription: rx.type,
          location: rx.location,
          durationMin: rx.durationMin,
        },
      ],
    }));
  };

  const chartData = state.triage.slice(-12).map((t, i) => ({
    name: `#${i + 1}`,
    energy: t.energy,
    minutes: t.durationMin,
  }));

  return (
    <div className="space-y-6">
      <header className="animate-slide-up flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-aurora animate-gradient-shift text-white shadow-soft">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            <span className="text-aurora">The Echo</span>
          </h1>
          <p className="text-foreground/70">A 4-question check before takeoff.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="animate-slide-up space-y-5 rounded-3xl glass p-6 shadow-soft">
          <div>
            <label className="mb-1 flex items-center justify-between font-semibold text-foreground">
              <span>Energy</span>
              <span className="text-aurora text-lg font-bold tabular-nums">{energy}/10</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="pastel-range"
            />
          </div>

          <div>
            <div className="mb-2 font-semibold text-foreground">Task complexity</div>
            <div className="grid grid-cols-3 gap-2">
              {complexities.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setComplexity(c.value)}
                  className={`liquid-press rounded-2xl px-2 py-3 text-sm font-medium ${
                    complexity === c.value ? "gradient-sunset text-white shadow-soft" : "glass text-foreground hover-lift"
                  }`}
                >
                  <div className="text-2xl">{c.emoji}</div>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-semibold text-foreground">Surrounding noise</div>
            <div className="grid grid-cols-2 gap-2">
              {noises.map((n) => (
                <button
                  key={n.value}
                  onClick={() => setNoise(n.value)}
                  className={`liquid-press rounded-2xl px-2 py-3 text-sm font-medium ${
                    noise === n.value ? "gradient-dream text-foreground shadow-soft" : "glass text-foreground hover-lift"
                  }`}
                >
                  <div className="text-2xl">{n.emoji}</div>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-semibold text-foreground">
              Subject <span className="text-xs font-normal text-foreground/60">({SUBJECTS.length} options)</span>
            </div>
            <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-2xl p-1">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`liquid-press rounded-full px-4 py-1.5 text-sm font-medium ${
                    subject === s ? "gradient-forest text-foreground shadow-soft" : "glass text-foreground hover-lift"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="animate-slide-up relative overflow-hidden rounded-3xl glass p-6 shadow-soft">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full gradient-dream opacity-50 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
              Prescription
            </div>
            <div className="mt-1 text-aurora text-3xl font-extrabold sm:text-4xl">{rx.type}</div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl glass p-3">
                <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <Clock className="h-3.5 w-3.5" /> Length
                </div>
                <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">{rx.durationMin}m</div>
              </div>
              <div className="rounded-2xl glass p-3">
                <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <MapPin className="h-3.5 w-3.5" /> Where
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{rx.location}</div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl gradient-aurora animate-gradient-shift p-4 text-white shadow-soft">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest opacity-90">
                <Sparkles className="h-3.5 w-3.5" /> Tip
              </div>
              <p className="mt-1 text-sm font-medium">{rx.tip}</p>
            </div>

            <button
              onClick={save}
              className="liquid-press shine mt-5 w-full rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground hover-lift"
            >
              Save prescription
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl glass p-5 shadow-soft animate-slide-up">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-foreground">Energy × planned minutes</h2>
          <span className="text-xs text-foreground/70">Last {chartData.length} echoes</span>
        </div>
        {chartData.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-foreground/70">
            Run your first echo to populate this graph 💚
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--foreground)" fontSize={11} />
                <YAxis stroke="var(--foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Area type="monotone" dataKey="energy" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="minutes" stroke="var(--chart-2)" fill="url(#g2)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
