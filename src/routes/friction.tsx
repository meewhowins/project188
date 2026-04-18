import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calcSessionMinutes, frictionTip } from "@/lib/focus-utils";
import { useFocusState, uid, type StressLevel, type Mood } from "@/lib/storage";
import { Moon, Smile, Meh, Frown, Heart, Zap } from "lucide-react";

export const Route = createFileRoute("/friction")({
  head: () => ({
    meta: [
      { title: "The Vibe Check — Aperion" },
      {
        name: "description",
        content: "Tell Aperion your sleep & stress. Get a session length your biology can actually sustain.",
      },
      { property: "og:title", content: "The Vibe Check — Aperion" },
      {
        property: "og:description",
        content: "Sleep × stress → personalized sprint length and biology tips.",
      },
    ],
  }),
  component: FrictionPage,
});

const stressOpts: { value: StressLevel; label: string; emoji: string }[] = [
  { value: "low", label: "Low", emoji: "😌" },
  { value: "med", label: "Medium", emoji: "😐" },
  { value: "high", label: "High", emoji: "😣" },
];

const moodOpts: { value: Mood; label: string; Icon: typeof Smile }[] = [
  { value: "great", label: "Great", Icon: Heart },
  { value: "ok", label: "OK", Icon: Smile },
  { value: "meh", label: "Meh", Icon: Meh },
  { value: "tired", label: "Tired", Icon: Frown },
];

function FrictionPage() {
  const [state, update] = useFocusState();
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState<StressLevel>("low");
  const [mood, setMood] = useState<Mood>("ok");

  const minutes = useMemo(() => calcSessionMinutes(sleep, stress), [sleep, stress]);
  const tip = useMemo(() => frictionTip(sleep, stress), [sleep, stress]);

  const save = () => {
    update((s) => ({
      ...s,
      friction: [
        ...s.friction,
        { id: uid(), ts: Date.now(), sleep, stress, mood, recommendedMinutes: minutes },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <header className="animate-slide-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          <span className="text-aurora">The Vibe Check</span>
        </h1>
        <p className="mt-1 text-foreground/70">
          Your biology sets the budget. We size the sprint.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="animate-slide-up rounded-3xl glass p-6 shadow-soft">
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <Moon className="h-4 w-4 text-primary" /> Hours slept last night
          </label>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={sleep}
            onChange={(e) => setSleep(parseFloat(e.target.value))}
            className="pastel-range"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>0h</span>
            <span className="text-base font-bold text-foreground tabular-nums">{sleep}h</span>
            <span>12h</span>
          </div>

          <div className="mt-6">
            <div className="mb-2 font-semibold">Stress level</div>
            <div className="grid grid-cols-3 gap-2">
              {stressOpts.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStress(o.value)}
                  className={`liquid-press rounded-2xl px-3 py-3 text-sm font-medium transition-all ${
                    stress === o.value
                      ? "gradient-aurora text-white shadow-soft"
                      : "glass hover-lift"
                  }`}
                >
                  <div className="text-2xl">{o.emoji}</div>
                  <div>{o.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 font-semibold">Mood</div>
            <div className="grid grid-cols-4 gap-2">
              {moodOpts.map((o) => {
                const Icon = o.Icon;
                return (
                  <button
                    key={o.value}
                    onClick={() => setMood(o.value)}
                    className={`liquid-press flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-medium transition-all ${
                      mood === o.value
                        ? "gradient-sunset text-white shadow-soft"
                        : "glass hover-lift"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="animate-slide-up relative overflow-hidden rounded-3xl glass p-6 shadow-soft">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full gradient-sunset opacity-40 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your plan
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-aurora text-6xl font-extrabold tabular-nums">
                {minutes}
              </span>
              <span className="text-xl font-semibold text-foreground/70">min sprint</span>
            </div>

            <div className="mt-4 rounded-2xl neu-inset p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Formula</div>
              <div className="mt-1 font-mono text-sm">
                90 ×{" "}
                <span className="rounded-md gradient-dream px-1.5 py-0.5 text-foreground">
                  sleep {(0.5 + sleep / 10).toFixed(2)}
                </span>{" "}
                ×{" "}
                <span className="rounded-md gradient-forest px-1.5 py-0.5 text-foreground">
                  stress {stress === "low" ? 1.2 : stress === "med" ? 1.0 : 0.8}
                </span>{" "}
                ≈ <span className="font-bold">{minutes}m</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl glass p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-primary" /> Biology says:
              </div>
              <p className="mt-1 text-sm">{tip}</p>
            </div>

            <button
              onClick={save}
              className="liquid-press shine mt-5 w-full rounded-2xl gradient-aurora animate-gradient-shift px-5 py-3 text-sm font-semibold text-white shadow-soft hover-lift"
            >
              Save to history
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl glass p-5 shadow-soft animate-slide-up">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">History</h2>
          <span className="text-xs text-muted-foreground">{state.friction.length} entries</span>
        </div>
        {state.friction.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Save your first check to see history ✨
          </div>
        ) : (
          <ul className="space-y-2">
            {[...state.friction].reverse().slice(0, 8).map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-2xl glass px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{f.recommendedMinutes}m</span>
                  <span className="text-muted-foreground">·</span>
                  <span>💤 {f.sleep}h</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="capitalize">{f.stress} stress</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(f.ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
