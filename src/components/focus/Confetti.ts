import confetti from "canvas-confetti";

export function celebrate() {
  const colors = ["#FFB6C1", "#98FB98", "#E6E6FA", "#B0E0E6", "#FFDAB9"];
  const end = Date.now() + 1200;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors,
  });
}
