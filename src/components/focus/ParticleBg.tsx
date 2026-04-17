export function ParticleBg() {
  const orbs = [
    { className: "gradient-sunset", size: 380, top: "-10%", left: "-8%", delay: "0s" },
    { className: "gradient-dream", size: 460, top: "20%", right: "-12%", delay: "-4s" },
    { className: "gradient-forest", size: 320, bottom: "-10%", left: "30%", delay: "-8s" },
  ];
  const sparkles = Array.from({ length: 18 });

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {orbs.map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-50 blur-3xl animate-float-orb ${o.className}`}
          style={{
            width: o.size,
            height: o.size,
            top: o.top,
            left: o.left,
            right: o.right,
            bottom: o.bottom,
            animationDelay: o.delay,
          }}
        />
      ))}
      {sparkles.map((_, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white animate-sparkle"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 5) * 0.4}s`,
            boxShadow: "0 0 8px white, 0 0 16px var(--pink)",
          }}
        />
      ))}
    </div>
  );
}
