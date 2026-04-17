import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useFocusState, uid, type ContractItem } from "@/lib/storage";
import { RadialTimer, useCountdown } from "@/components/focus/RadialTimer";
import { celebrate } from "@/components/focus/Confetti";
import { Ghost, Lock, Plus, Play, Pause, RotateCcw, Maximize2, X, Check } from "lucide-react";

export const Route = createFileRoute("/ghost")({
  head: () => ({
    meta: [
      { title: "Ghost Protocol Workspace — Focus OS" },
      {
        name: "description",
        content: "Sign a self-contract, enter the vault, and only exit on your terms.",
      },
      { property: "og:title", content: "Ghost Protocol Workspace — Focus OS" },
      {
        property: "og:description",
        content: "Self-contracts, fullscreen vault, penalties for breaks.",
      },
    ],
  }),
  component: GhostPage,
});

function GhostPage() {
  const [state, update] = useFocusState();
  const [contract, setContract] = useState("Finish 4 topics: Math Ch1–4");
  const [items, setItems] = useState<ContractItem[]>([
    { id: uid(), text: "Topic 1", done: false },
    { id: uid(), text: "Topic 2", done: false },
    { id: uid(), text: "Topic 3", done: false },
    { id: uid(), text: "Topic 4", done: false },
  ]);
  const [duration, setDuration] = useState(45);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [breakPrompt, setBreakPrompt] = useState(false);
  const [breakReason, setBreakReason] = useState("");
  const startedAtRef = useRef<number | null>(null);

  const timer = useCountdown(duration * 60);

  useEffect(() => {
    if (vaultOpen) timer.reset(duration * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, vaultOpen]);

  const itemsDone = items.filter((i) => i.done).length;
  const allDone = itemsDone === items.length && items.length > 0;

  const addItem = () =>
    setItems((p) => [...p, { id: uid(), text: `Topic ${p.length + 1}`, done: false }]);
  const toggleItem = (id: string) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const removeItem = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const updateItemText = (id: string, text: string) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, text } : i)));

  const enterVault = async () => {
    setVaultOpen(true);
    startedAtRef.current = Date.now();
    timer.reset(duration * 60);
    timer.start();
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      /* allowed */
    }
  };

  const exitVault = (completed: boolean) => {
    const startedAt = startedAtRef.current ?? Date.now();
    const elapsedMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    update((s) => ({
      ...s,
      sessions: [
        ...s.sessions,
        {
          id: uid(),
          ts: Date.now(),
          durationMin: elapsedMin,
          contract,
          itemsTotal: items.length,
          itemsDone,
          completed,
        },
      ],
    }));
    setVaultOpen(false);
    setBreakPrompt(false);
    timer.pause();
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    if (completed) celebrate();
  };

  const tryBreak = () => {
    if (allDone) {
      exitVault(true);
    } else {
      setBreakPrompt(true);
    }
  };

  const confirmBreak = () => {
    // Penalty: surface undone for next session — keep them in items (already there)
    update((s) => ({
      ...s,
      distractions: [
        ...s.distractions,
        { id: uid(), ts: Date.now(), text: `Break: ${breakReason || "no reason"}`, cleared: false },
      ],
    }));
    exitVault(false);
  };

  return (
    <div className="space-y-6">
      <header className="animate-slide-up flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-dream text-foreground shadow-soft">
          <Ghost className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-aurora">Ghost Protocol</span>
          </h1>
          <p className="text-muted-foreground">Sign your contract. Disappear. Deliver.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="animate-slide-up rounded-3xl glass p-6 shadow-soft">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Self-contract
          </label>
          <textarea
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-2xl bg-input/40 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-ring"
            placeholder="What MUST be true to leave this session?"
          />

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Exit conditions ({itemsDone}/{items.length})</span>
              <button onClick={addItem} className="liquid-press inline-flex items-center gap-1 rounded-xl glass px-2 py-1 text-xs">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-2 rounded-2xl glass px-3 py-2">
                  <button
                    onClick={() => toggleItem(it.id)}
                    className={`liquid-press grid h-7 w-7 shrink-0 place-items-center rounded-xl transition-all ${
                      it.done
                        ? "gradient-forest text-foreground shadow-soft"
                        : "neu-inset"
                    }`}
                  >
                    {it.done && <Check className="h-4 w-4" />}
                  </button>
                  <input
                    value={it.text}
                    onChange={(e) => updateItemText(it.id, e.target.value)}
                    className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${it.done ? "line-through opacity-60" : ""}`}
                  />
                  <button
                    onClick={() => removeItem(it.id)}
                    className="liquid-press grid h-7 w-7 place-items-center rounded-xl text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Duration: {duration} min
            </label>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="pastel-range"
            />
          </div>

          <button
            onClick={enterVault}
            className="liquid-press shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-aurora animate-gradient-shift px-5 py-3 text-sm font-semibold text-white shadow-soft hover-lift"
          >
            <Lock className="h-4 w-4" /> Enter the vault
          </button>
        </section>

        <section className="animate-slide-up rounded-3xl glass p-6 shadow-soft">
          <h3 className="mb-2 font-bold">Recent sessions</h3>
          {state.sessions.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No sessions yet. Sign a contract above. 🔒
            </div>
          ) : (
            <ul className="space-y-2">
              {[...state.sessions].reverse().slice(0, 6).map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between rounded-2xl glass px-4 py-2 text-sm ${
                    s.completed ? "" : "opacity-70"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.contract}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.durationMin}m · {s.itemsDone}/{s.itemsTotal} done
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      s.completed
                        ? "gradient-forest text-foreground"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {s.completed ? "fulfilled" : "broken"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* VAULT */}
      {vaultOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
          <div className="absolute inset-0 backdrop-blur-2xl bg-background/80" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full gradient-sunset opacity-40 blur-3xl animate-float-orb" />
            <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full gradient-forest opacity-40 blur-3xl animate-float-orb" />
          </div>
          <div className="relative z-10 w-full max-w-xl space-y-5 rounded-[2rem] glass p-6 shadow-soft animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Vault active
              </div>
              <button
                onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
                className="liquid-press grid h-8 w-8 place-items-center rounded-xl glass"
                aria-label="Fullscreen"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="rounded-2xl glass p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Contract</div>
              <div className="mt-1 font-semibold">{contract}</div>
            </div>

            <div className="grid place-items-center">
              <RadialTimer
                seconds={timer.seconds}
                totalSeconds={duration * 60}
                running={timer.running}
                size={240}
              />
            </div>

            <div className="flex justify-center gap-2">
              {timer.running ? (
                <button
                  onClick={timer.pause}
                  className="liquid-press inline-flex items-center gap-1.5 rounded-2xl glass px-4 py-2 text-sm font-semibold hover-lift"
                >
                  <Pause className="h-4 w-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={timer.start}
                  className="liquid-press inline-flex items-center gap-1.5 rounded-2xl gradient-aurora px-4 py-2 text-sm font-semibold text-white shadow-soft hover-lift"
                >
                  <Play className="h-4 w-4" /> Resume
                </button>
              )}
              <button
                onClick={() => timer.reset(duration * 60)}
                className="liquid-press inline-flex items-center gap-1.5 rounded-2xl glass px-4 py-2 text-sm hover-lift"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>

            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-2 rounded-2xl glass px-3 py-2">
                  <button
                    onClick={() => toggleItem(it.id)}
                    className={`liquid-press grid h-7 w-7 place-items-center rounded-xl ${
                      it.done ? "gradient-forest" : "neu-inset"
                    }`}
                  >
                    {it.done && <Check className="h-4 w-4" />}
                  </button>
                  <span className={`flex-1 text-sm ${it.done ? "line-through opacity-60" : ""}`}>
                    {it.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => allDone && exitVault(true)}
                disabled={!allDone}
                className={`liquid-press flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  allDone
                    ? "gradient-forest text-foreground shadow-soft hover-lift shine"
                    : "glass opacity-60"
                }`}
              >
                {allDone ? "✨ Fulfill contract" : `Complete all to exit (${itemsDone}/${items.length})`}
              </button>
              <button
                onClick={tryBreak}
                className="liquid-press rounded-2xl glass px-4 py-3 text-sm font-semibold text-destructive hover-lift"
              >
                Break
              </button>
            </div>
          </div>
        </div>
      )}

      {breakPrompt && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          <div className="relative w-full max-w-md rounded-3xl glass p-6 shadow-soft animate-slide-up">
            <h3 className="text-lg font-bold">Break the contract?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Log why — the unfinished items roll into your next session as a penalty.
            </p>
            <input
              autoFocus
              value={breakReason}
              onChange={(e) => setBreakReason(e.target.value)}
              placeholder="e.g. doom-scroll, hunger, emergency"
              className="mt-3 w-full rounded-2xl bg-input/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setBreakPrompt(false)}
                className="liquid-press flex-1 rounded-2xl glass px-4 py-2.5 text-sm font-semibold hover-lift"
              >
                Stay
              </button>
              <button
                onClick={confirmBreak}
                className="liquid-press flex-1 rounded-2xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover-lift"
              >
                Break anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
