import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFocusState, uid } from "@/lib/storage";
import { Sparkles, X, Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/distractions")({
  head: () => ({
    meta: [
      { title: "Reward Queue — Focus OS" },
      {
        name: "description",
        content: "Park temptations now. Enjoy them after the sprint.",
      },
      { property: "og:title", content: "Reward Queue — Focus OS" },
      {
        property: "og:description",
        content: "Anti-context-switch log: capture distractions, queue them as rewards.",
      },
    ],
  }),
  component: DistractionsPage,
});

function DistractionsPage() {
  const [state, update] = useFocusState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const active = state.distractions.filter((d) => !d.cleared);
  const done = state.distractions.filter((d) => d.cleared);

  const add = () => {
    if (!text.trim()) return;
    update((s) => ({
      ...s,
      distractions: [...s.distractions, { id: uid(), ts: Date.now(), text: text.trim(), cleared: false }],
    }));
    setText("");
    setOpen(false);
  };

  const toggle = (id: string) =>
    update((s) => ({
      ...s,
      distractions: s.distractions.map((d) => (d.id === id ? { ...d, cleared: !d.cleared } : d)),
    }));

  const remove = (id: string) =>
    update((s) => ({ ...s, distractions: s.distractions.filter((d) => d.id !== id) }));

  const clearAll = () =>
    update((s) => ({ ...s, distractions: [] }));

  return (
    <div className="space-y-6">
      <header className="animate-slide-up flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-forest text-foreground shadow-soft">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-aurora">Reward Queue</span>
          </h1>
          <p className="text-muted-foreground">Don't deny — defer. Park it, finish work, then enjoy.</p>
        </div>
      </header>

      <button
        onClick={() => setOpen(true)}
        className="liquid-press shine relative w-full overflow-hidden rounded-3xl gradient-aurora animate-gradient-shift p-6 text-left text-white shadow-soft hover-lift"
      >
        <div className="text-2xl font-extrabold">I'm distracted 😩</div>
        <div className="text-sm opacity-90">Tap to park what's tempting you</div>
      </button>

      <section className="animate-slide-up rounded-3xl glass p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Parked rewards ({active.length})</h2>
          {state.distractions.length > 0 && (
            <button
              onClick={clearAll}
              className="liquid-press inline-flex items-center gap-1 rounded-xl glass px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>
        {active.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Nothing parked. You're laser-focused ✨
          </div>
        ) : (
          <ul className="space-y-2">
            {active.map((d) => (
              <li key={d.id} className="flex items-center gap-2 rounded-2xl glass px-3 py-2">
                <button
                  onClick={() => toggle(d.id)}
                  className="liquid-press grid h-8 w-8 place-items-center rounded-xl neu-inset"
                  aria-label="Mark enjoyed"
                >
                  <Check className="h-4 w-4" />
                </button>
                <span className="flex-1 text-sm">{d.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                  onClick={() => remove(d.id)}
                  className="liquid-press grid h-7 w-7 place-items-center rounded-xl text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section className="rounded-3xl glass p-5 shadow-soft">
          <h2 className="mb-3 font-bold">Enjoyed ({done.length})</h2>
          <ul className="space-y-2">
            {done.slice(-6).reverse().map((d) => (
              <li key={d.id} className="flex items-center gap-2 rounded-2xl glass px-3 py-2 opacity-60">
                <span className="flex-1 text-sm line-through">{d.text}</span>
                <button
                  onClick={() => toggle(d.id)}
                  className="liquid-press text-xs text-muted-foreground hover:text-foreground"
                >
                  undo
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl glass p-6 shadow-soft animate-slide-up">
            <h3 className="text-lg font-bold">What's tempting you?</h3>
            <p className="text-sm text-muted-foreground">Be specific. We'll save it for after.</p>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Instagram, chips, that one tab…"
              className="mt-3 w-full rounded-2xl bg-input/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="liquid-press flex-1 rounded-2xl glass px-4 py-2.5 text-sm font-semibold hover-lift"
              >
                Cancel
              </button>
              <button
                onClick={add}
                className="liquid-press shine flex-1 rounded-2xl gradient-aurora px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover-lift"
              >
                Park it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
