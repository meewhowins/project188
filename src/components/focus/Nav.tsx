import { Link, useLocation } from "@tanstack/react-router";
import { Brain, Ghost, Sparkles, Stethoscope, Home, Moon, Sun } from "lucide-react";
import { useFocusState } from "@/lib/storage";
import { useEffect } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home, gradient: "gradient-aurora" },
  { to: "/friction", label: "Friction", icon: Brain, gradient: "gradient-sunset" },
  { to: "/ghost", label: "Ghost", icon: Ghost, gradient: "gradient-dream" },
  { to: "/distractions", label: "Rewards", icon: Sparkles, gradient: "gradient-forest" },
  { to: "/triage", label: "Triage", icon: Stethoscope, gradient: "gradient-aurora" },
] as const;

export function Nav() {
  const location = useLocation();
  const [state, update] = useFocusState();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-3xl px-3 py-2 shadow-soft sm:px-5 sm:py-3">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-2xl gradient-aurora animate-gradient-shift text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-aurora text-base sm:text-lg">Focus OS</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active =
              t.to === "/" ? location.pathname === "/" : location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`liquid-press group relative flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-xs font-medium transition-all sm:px-3 sm:py-2 sm:text-sm ${
                  active
                    ? `text-white shadow-soft ${t.gradient}`
                    : "text-foreground/70 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:inline">{t.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl shine"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() =>
            update((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))
          }
          aria-label="Toggle theme"
          className="liquid-press grid h-9 w-9 place-items-center rounded-2xl glass hover-lift"
        >
          {state.theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
