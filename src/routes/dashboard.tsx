import { createFileRoute } from "@tanstack/react-router";
import { useFocusState } from "@/lib/storage";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aperion" },
      {
        name: "description",
        content: "Sleep trends and your focus streak at a glance.",
      },
      { property: "og:title", content: "Dashboard — Aperion" },
      {
        property: "og:description",
        content: "Track sleep, focus streak, and momentum over time.",
      },
    ],
  }),
  component: DashboardPage,
});

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DashboardPage() {
  const [state] = useFocusState();

  // Build last-7-day sleep trend (one point per day, latest entry per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { name: string; sleep: number | null; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ name: DAY_LABELS[d.getDay()], sleep: null, date: d });
  }
  state.friction.forEach((f) => {
    const fd = new Date(f.ts);
    fd.setHours(0, 0, 0, 0);
    const slot = days.find((d) => d.date.getTime() === fd.getTime());
    if (slot) slot.sleep = f.sleep;
  });
  const sleepData = days.map((d) => ({ name: d.name, sleep: d.sleep ?? 0 }));

  // Focus streak: last 30 days, filled if a completed session that day
  const streakDays: { date: Date; filled: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    streakDays.push({ date: d, filled: false });
  }
  state.sessions.forEach((s) => {
    if (!s.completed) return;
    const sd = new Date(s.ts);
    sd.setHours(0, 0, 0, 0);
    const slot = streakDays.find((x) => x.date.getTime() === sd.getTime());
    if (slot) slot.filled = true;
  });

  const currentStreak = (() => {
    let n = 0;
    for (let i = streakDays.length - 1; i >= 0; i--) {
      if (streakDays[i].filled) n++;
      else break;
    }
    return n;
  })();

  return (
    <div className="space-y-6">
      <header className="animate-slide-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          <span className="text-aurora">Dashboard</span>
        </h1>
        <p className="text-foreground/70">Your weekly biology + momentum view.</p>
      </header>

      <section className="animate-slide-up rounded-3xl glass p-5 shadow-soft sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            📈 Sleep Trend (Last 7 Days)
          </h2>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sleepData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" />
              <XAxis
                dataKey="name"
                stroke="var(--foreground)"
                fontSize={12}
                tick={{ fill: "var(--foreground)" }}
              />
              <YAxis
                domain={[0, 12]}
                stroke="var(--foreground)"
                fontSize={12}
                tick={{ fill: "var(--foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="var(--chart-2)"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={{ r: 4, fill: "var(--chart-1)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="animate-slide-up rounded-3xl glass p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">🔥 Focus Streak</h2>
          <span className="rounded-full gradient-sunset px-3 py-1 text-xs font-bold text-white shadow-soft">
            {currentStreak} day{currentStreak === 1 ? "" : "s"}
          </span>
        </div>
        <div className="grid grid-cols-15 gap-2" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {streakDays.map((d, i) => (
            <div
              key={i}
              title={d.date.toDateString()}
              className={`aspect-square rounded-xl transition-all ${
                d.filled
                  ? "gradient-aurora shadow-soft"
                  : "bg-lavender/40 border border-border/60"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-foreground/70">
          Each square = one day. Glowing = a fulfilled Focus Vault session.
        </p>
      </section>
    </div>
  );
}
