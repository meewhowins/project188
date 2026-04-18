import type { Noise, StressLevel, Subject, TaskComplexity } from "./storage";

export function calcSessionMinutes(sleep: number, stress: StressLevel): number {
  // Sleep factor 0.5 (0h) to 1.5 (10+h)
  const sleepFactor = Math.max(0.5, Math.min(1.5, 0.5 + sleep / 10));
  const stressMod = stress === "low" ? 1.2 : stress === "med" ? 1.0 : 0.8;
  const base = 90;
  return Math.max(15, Math.round((base * sleepFactor * stressMod) / 5) * 5);
}

export function frictionTip(sleep: number, stress: StressLevel): string {
  const tips: string[] = [];
  if (sleep < 6) tips.push("hydrate");
  if (sleep < 5) tips.push("nap 20m if possible");
  if (stress === "high") tips.push("4-7-8 breathing");
  if (sleep >= 7 && stress === "low") tips.push("ride the wave — go deep");
  tips.push("dim lights", "phone in another room");
  return tips.slice(0, 3).join(" + ");
}

export interface Prescription {
  durationMin: number;
  type: string;
  location: string;
  tip: string;
}

export function prescribe(opts: {
  energy: number;
  complexity: TaskComplexity;
  noise: Noise;
  subject: Subject;
}): Prescription {
  const { energy, complexity, noise, subject } = opts;

  // Duration logic
  let duration = 50;
  if (energy <= 3) duration = 25;
  else if (energy <= 6) duration = complexity === "hard" ? 45 : 50;
  else duration = complexity === "hard" ? 90 : 60;

  // Type
  let type = "Focus Sprint";
  if (complexity === "hard" && energy >= 7) type = "Deep Flow";
  else if (complexity === "simple") type = "Quick Pass";
  else if (energy <= 3) type = "Gentle Sprint";

  // Location
  let location = "Desk";
  if (subject === "Reading" && noise === "quiet") location = "Park / Window seat";
  else if (subject === "Reading") location = "Quiet room";
  else if (subject === "CS" && energy >= 6) location = "Desk (dual screen)";
  else if (energy <= 3 && complexity === "simple") location = "Couch / Bed";
  else if (noise === "noisy") location = "Headphones + Desk";

  // Tip — keyed by subject; falls back to a generic outcome prompt.
  const tipMap: Record<string, string> = {
    Math: "Whiteboard one example before starting.",
    "Computer Science": "Write the function signature first.",
    Reading: "Skim headings, then deep read.",
    Writing: "Outline 3 bullets before paragraph #1.",
    Physics: "Draw the free-body / system diagram first.",
    Chemistry: "List knowns and unknowns before solving.",
    Biology: "Sketch the pathway from memory, then check.",
    History: "Build a timeline of 5 anchor dates.",
    Geography: "Pull up the map before you read.",
    Economics: "Restate the model in one sentence.",
    Philosophy: "Steel-man the opposing view first.",
    Psychology: "Name the bias / mechanism in play.",
    Languages: "Read aloud — 5 minutes warm-up.",
    "Art & Design": "Set a 60-second thumbnail timer.",
    Music: "Loop the hardest 4 bars at 70% tempo.",
    Engineering: "Define the constraint before the solution.",
    Statistics: "State the null hypothesis first.",
    Business: "Write the customer + outcome in one line.",
    Law: "Identify the rule before applying facts.",
  };
  const tip = tipMap[subject] ?? "Define the 1-line outcome.";

  return { durationMin: duration, type, location, tip };
}

export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
