import { useEffect, useState, useCallback } from "react";

const CHANNEL_NAME = "aperion-sync";

export type StressLevel = "low" | "med" | "high";
export type Mood = "great" | "ok" | "meh" | "tired";
export type TaskComplexity = "simple" | "med" | "hard";
export type Noise = "quiet" | "noisy";
export type Subject = string;

export interface FrictionLog {
  id: string;
  ts: number;
  sleep: number;
  stress: StressLevel;
  mood: Mood;
  recommendedMinutes: number;
}

export interface ContractItem {
  id: string;
  text: string;
  done: boolean;
}

export interface SessionLog {
  id: string;
  ts: number;
  durationMin: number;
  contract: string;
  itemsTotal: number;
  itemsDone: number;
  completed: boolean;
  energy?: number;
  subject?: Subject;
}

export interface Distraction {
  id: string;
  ts: number;
  text: string;
  cleared: boolean;
}

export interface TriageLog {
  id: string;
  ts: number;
  energy: number;
  complexity: TaskComplexity;
  noise: Noise;
  subject: Subject;
  prescription: string;
  location: string;
  durationMin: number;
}

export interface FocusOSState {
  friction: FrictionLog[];
  sessions: SessionLog[];
  distractions: Distraction[];
  triage: TriageLog[];
  theme: "light" | "dark";
}

const DEFAULT_STATE: FocusOSState = {
  friction: [],
  sessions: [],
  distractions: [],
  triage: [],
  theme: "light",
};

const KEY = "aperion-state-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function load(): FocusOSState {
  if (!isBrowser()) return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state: FocusOSState) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

let listeners = new Set<(s: FocusOSState) => void>();
let memoryState: FocusOSState = DEFAULT_STATE;
let initialized = false;
let channel: BroadcastChannel | null = null;

function ensureInit() {
  if (initialized || !isBrowser()) return;
  initialized = true;
  memoryState = load();
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e) => {
      if (e.data?.type === "state") {
        memoryState = e.data.state;
        listeners.forEach((l) => l(memoryState));
      }
    };
  } catch {
    // ignore
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        memoryState = JSON.parse(e.newValue);
        listeners.forEach((l) => l(memoryState));
      } catch {
        /* noop */
      }
    }
  });
}

export function useFocusState(): [FocusOSState, (updater: (s: FocusOSState) => FocusOSState) => void] {
  // Always start with DEFAULT_STATE on first render (matches SSR) to avoid hydration mismatches.
  const [state, setState] = useState<FocusOSState>(DEFAULT_STATE);

  useEffect(() => {
    ensureInit();
    const listener = (s: FocusOSState) => setState(s);
    listeners.add(listener);
    setState(memoryState);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((updater: (s: FocusOSState) => FocusOSState) => {
    ensureInit();
    const next = updater(memoryState);
    memoryState = next;
    save(next);
    setState(next);
    listeners.forEach((l) => l(next));
    try {
      channel?.postMessage({ type: "state", state: next });
    } catch {
      /* noop */
    }
  }, []);

  return [state, update];
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Calibration / Gatekeeper state — session-scoped (resets on tab close)
const CALIB_KEY = "aperion-calibrated";
const calibListeners = new Set<(c: boolean) => void>();
let calibState = false;

export function useCalibrated(): [boolean, (v: boolean) => void] {
  const [c, setC] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      calibState = sessionStorage.getItem(CALIB_KEY) === "1";
      setC(calibState);
    }
    const l = (v: boolean) => setC(v);
    calibListeners.add(l);
    return () => {
      calibListeners.delete(l);
    };
  }, []);
  const set = useCallback((v: boolean) => {
    calibState = v;
    if (typeof window !== "undefined") {
      if (v) sessionStorage.setItem(CALIB_KEY, "1");
      else sessionStorage.removeItem(CALIB_KEY);
    }
    calibListeners.forEach((cb) => cb(v));
  }, []);
  return [c, set];
}

export const SUBJECTS: string[] = [
  "Math",
  "Computer Science",
  "Reading",
  "Writing",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
  "Philosophy",
  "Psychology",
  "Languages",
  "Art & Design",
  "Music",
  "Engineering",
  "Statistics",
  "Business",
  "Law",
  "Other",
];
