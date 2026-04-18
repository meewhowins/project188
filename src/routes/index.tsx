import { createFileRoute, Link } from "@tanstack/react-router";
import { useFocusState, useCalibrated } from "@/lib/storage";
import { Brain, Ghost, Stethoscope, Activity, Moon, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aperion — Biology-First Deep Work" },
      {
        name: "description",
        content: "Treat focus as a resource. Plan sprints around your sleep, stress, energy, and noise.",
      },
      { property: "og:title", content: "Aperion — Biology-First Deep Work" },
      {
        property: "og:description",
        content: "The Vibe Check, The Focus Vault, The Echo — all gated by a focus calibration sequence.",
      },
    ],
  }),
  component: Index,
});

const modules = [
  {
    to: "/friction" as const,
    icon: Brain,
    title: "The Vibe Check",
    desc: "Sleep + stress → personalized session length.",
    grad: "gradient-sunset",
  },
  {
    to: "/ghost" as const,
    icon: Ghost,
    title: "The Focus Vault",
    desc: "Self-contract vault. No exits without conditions met.",
    grad: "gradient-dream",
  },
  {
    to: "/triage" as const,
    icon: Stethoscope,
    title: "The Echo",
    desc: "Pre-flight checks → prescribed sprint type & spot.",
    grad: "gradient-aurora",
  },
  {
    to: "/dashboard" as const,
    icon: BarChart3,
    title: "Dashboard",
    desc: "Sleep trends + focus streak at a glance.",
    grad: "gradient-forest",
  },
];

function Index() {
  const [state] = useFocusState();
  const [calibrated] = useCalibrated();

  const sleepData = state.friction.slice(-10).map((f, i) => ({
    name: `#${i + 1}`,
    sleep: f.sleep,
    plan: f.recommendedMinutes,
  }));

  const totalSessions = state.sessions.length;
  const completedSessions = state.sessions.filter((s) => s.completed).length;
  const avgSession = totalSessions
    ? Math.round(state.sessions.reduce((a, b) => a + b.durationMin, 0) / totalSessions)
    : 0;
  const frictionLogged = state.friction.length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="animate-slide-up relative overflow-hidden rounded-[2rem] glass p-6 shadow-soft sm:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full gradient-sunset opacity-40 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full gradient-forest opacity-40 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-foreground">
            <Zap className="h-3 w-3 text-primary" />
            Biology-first deep work
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            <span className="text-aurora animate-gradient-shift">Aperion</span>
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-lg font-medium text-foreground sm:text-xl">
            <span className="animate-pulse-glow inline-block">Treat focus as a resource, not willpower.</span>
          </p>
          <p className="mt-2 max-w-2xl text-sm text-foreground/80 sm:text-base">
            Sprints sized to your sleep. Vaults that hold the line. Calibrate to enter session mode.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!calibrated && (
              <Link
                to="/gatekeeper"
                className="liquid-press shine inline-flex items-center gap-2 rounded-2xl gradient-sunset animate-gradient-shift px-5 py-3 text-sm font-bold text-white shadow-soft hover-lift"
              >
                <ShieldCheck className="h-4 w-4" /> Run Calibration
              </Link>
            )}
            <Link
              to="/friction"
              className="liquid-press inline-flex items-center gap-2 rounded-2xl gradient-aurora animate-gradient-shift px-5 py-3 text-sm font-semibold text-white shadow-soft hover-lift"
            >
              <Brain className="h-4 w-4" /> Vibe Check
            </Link>
            <Link
              to="/triage"
              className="liquid-press inline-flex items-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground hover-lift"
            >
              <Stethoscope className="h-4 w-4" /> The Echo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Activity} label="Sessions" value={totalSessions} grad="gradient-sunset" />
        <StatCard icon={Zap} label="Completed" value={completedSessions} grad="gradient-forest" />
        <StatCard icon={Moon} label="Avg min" value={avgSession} grad="gradient-dream" />
        <StatCard icon={Brain} label="Vibes logged" value={frictionLogged} grad="gradient-aurora" />
      </section>

      {/* Modules */}
      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight text-foreground">Modules</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                className="hover-lift liquid-press group relative overflow-hidden rounded-3xl glass p-5 shadow-soft animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${m.grad} opacity-50 blur-2xl transition-all group-hover:opacity-80`} />
                <div className="relative flex items-start gap-3">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${m.grad} text-white shadow-soft`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{m.title}</h3>
                    <p className="text-sm text-foreground/70">{m.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trends */}
      <section className="rounded-3xl glass p-5 shadow-soft animate-slide-up">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Sleep × Plan trend</h2>
          <span className="text-xs text-foreground/70">Last 10 vibe checks</span>
        </div>
        {sleepData.length === 0 ? (
          <Link
            to="/friction"
            className="liquid-press hover-lift grid place-items-center rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-8 text-center text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
          >
            Start your first vibe check ✨
          </Link>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData}>
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
                <Line type="monotone" dataKey="sleep" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="plan" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  grad,
}: {
  icon: typeof Brain;
  label: string;
  value: number;
  grad: string;
}) {
  return (
    <div className="hover-lift relative overflow-hidden rounded-3xl glass p-4 shadow-soft">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${grad} opacity-50 blur-xl`} />
      <div className="relative flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-2xl ${grad} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
          <div className="text-xs uppercase tracking-wider text-foreground/70">{label}</div>
        </div>
      </div>
    </div>
  );
}
