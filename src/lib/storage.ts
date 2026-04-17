import { useEffect, useState, useCallback } from "react";

const CHANNEL_NAME = "focus-os-sync";

export type StressLevel = "low" | "med" | "high";
export type Mood = "great" | "ok" | "meh" | "tired";
export type TaskComplexity = "simple" | "med" | "hard";
export type Noise = "quiet" | "noisy";
export type Subject = "Math" | "CS" | "Reading" | "Writing" | "Other";

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

const KEY = "focus-os-state-v1";

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
  ensureInit();
  const [state, setState] = useState<FocusOSState>(memoryState);

  useEffect(() => {
    const listener = (s: FocusOSState) => setState(s);
    listeners.add(listener);
    setState(memoryState);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((updater: (s: FocusOSState) => FocusOSState) => {
    const next = updater(memoryState);
    memoryState = next;
    save(next);
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
