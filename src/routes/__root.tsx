import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Nav } from "@/components/focus/Nav";
import { ParticleBg } from "@/components/focus/ParticleBg";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-8 text-center shadow-soft">
        <h1 className="text-7xl font-bold text-aurora">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost in the flow</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page drifted off. Let's get back to deep work.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl gradient-aurora animate-gradient-shift px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover-lift"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#FFB6C1" },
      { title: "Focus OS — Biology-First Deep Work" },
      {
        name: "description",
        content:
          "Treat focus as a resource, not willpower. Friction-aware sprints, ghost-protocol vaults, and pre-flight cognitive triage.",
      },
      { name: "author", content: "Focus OS" },
      { property: "og:title", content: "Focus OS — Biology-First Deep Work" },
      {
        property: "og:description",
        content: "Plan deep work around your sleep, stress, energy, and noise. Pastel, playful, dynamic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="min-h-screen">
      <ParticleBg />
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-3 pb-24 pt-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
