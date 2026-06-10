// Lightweight localStorage-backed store for the Synapse demo.
import { useSyncExternalStore } from "react";

export type Task = {
  id: string;
  start: string;
  end: string;
  title: string;
  subject: string;
  subjectColor: string;
  examTag: string;
  status: "pending" | "completed" | "overdue";
};

export type ExamInfo = {
  id: string;
  name: string;
  date: string; // ISO
  color: string;
  priority: string;
  priorityIcon: string;
};

export type SynapseState = {
  name: string;
  grade: string;
  goals: string[];
  examDates: Record<string, string>;
  confidence: Record<string, number>;
  syllabus: Record<string, boolean>;
  schedule: boolean[][]; // [hour][day], 17 hours x 7 days (6am-11pm)
  readiness: Record<string, number>;
  tasks: Task[];
  chatMessages: { role: "user" | "assistant"; text: string }[];
  banner: string | null;
  onboardingStep: number;
  onboardingComplete: boolean;
};

const DEFAULT_TASKS: Task[] = [
  { id: "t1", start: "07:00", end: "08:30", title: "Thermodynamics", subject: "Physics", subjectColor: "#ff2d7e", examTag: "JEE + Boards", status: "pending" },
  { id: "t2", start: "09:00", end: "10:00", title: "Organic Chemistry", subject: "Chemistry", subjectColor: "#6c63ff", examTag: "JEE + Boards", status: "pending" },
  { id: "t3", start: "10:30", end: "11:30", title: "Integration PYQs", subject: "Maths", subjectColor: "#22d3ee", examTag: "JEE", status: "pending" },
  { id: "t4", start: "14:00", end: "15:00", title: "English Essay", subject: "English", subjectColor: "#34d399", examTag: "Boards", status: "completed" },
  { id: "t5", start: "16:00", end: "17:00", title: "Coding — Arrays", subject: "DSA", subjectColor: "#f59e0b", examTag: "Side Skill", status: "pending" },
  { id: "t6", start: "18:00", end: "19:00", title: "Modern Physics Revision", subject: "Physics", subjectColor: "#ff2d7e", examTag: "JEE Advanced", status: "overdue" },
];

// 17 hours (6am-10pm slots) x 7 days. Default: free 6-10am, 2-5pm, 6-9pm
function defaultSchedule(): boolean[][] {
  const grid: boolean[][] = [];
  for (let h = 0; h < 17; h++) {
    const row: boolean[] = [];
    const hour = 6 + h;
    const free = (hour >= 6 && hour <= 11) || (hour >= 14 && hour <= 17) || (hour >= 18 && hour <= 21);
    for (let d = 0; d < 7; d++) row.push(free);
    grid.push(row);
  }
  return grid;
}

const DEMO_STATE: SynapseState = {
  name: "Aryan",
  grade: "Grade 12",
  goals: ["CBSE Boards", "JEE Mains", "JEE Advanced", "CUET", "Coding+DSA"],
  examDates: {
    "CBSE Boards": "2025-02-15",
    "JEE Mains": "2025-04-02",
    "JEE Advanced": "2025-05-18",
    "CUET": "2025-05-10",
  },
  confidence: { Physics: 6, Chemistry: 5, Maths: 7, English: 8 },
  syllabus: {},
  schedule: defaultSchedule(),
  readiness: { "CBSE Boards": 62, "JEE Mains": 48, "JEE Advanced": 34, "CUET": 71 },
  tasks: DEFAULT_TASKS,
  chatMessages: [
    { role: "assistant", text: "Hey Aryan 👋 I'm Synapse. Tell me about anything that changes — a holiday, a sick day, a new exam date — and I'll restructure your plan instantly." },
  ],
  banner: null,
  onboardingStep: 0,
  onboardingComplete: false,
};

const KEY = "synapse-state-v1";

function load(): SynapseState {
  if (typeof window === "undefined") return DEMO_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEMO_STATE;
    return { ...DEMO_STATE, ...JSON.parse(raw) };
  } catch {
    return DEMO_STATE;
  }
}

let state: SynapseState = load();
const listeners = new Set<() => void>();

function save() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
}

export function getState() { return state; }
export function setState(patch: Partial<SynapseState> | ((s: SynapseState) => Partial<SynapseState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  save();
  listeners.forEach((l) => l());
}
export function resetToDemo() {
  state = { ...DEMO_STATE, onboardingComplete: true };
  save();
  listeners.forEach((l) => l());
}

export function useSynapse(): SynapseState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
    () => DEMO_STATE,
  );
}

export const EXAMS: ExamInfo[] = [
  { id: "jeeadv", name: "JEE Advanced", date: "2025-05-18", color: "#22d3ee", priority: "Highest", priorityIcon: "🔴" },
  { id: "jeemains", name: "JEE Mains", date: "2025-04-02", color: "#3b82f6", priority: "High", priorityIcon: "🟠" },
  { id: "cbse", name: "CBSE Boards", date: "2025-02-15", color: "#a78bfa", priority: "Medium", priorityIcon: "🟡" },
  { id: "cuet", name: "CUET", date: "2025-05-10", color: "#34d399", priority: "Background", priorityIcon: "🟢" },
  { id: "dsa", name: "Coding + DSA", date: "", color: "#f59e0b", priority: "Side Skill", priorityIcon: "⚪" },
];

export const SUBJECTS_BY_EXAM: Record<string, string[]> = {
  "JEE Mains": ["Physics", "Chemistry", "Maths"],
  "JEE Advanced": ["Physics", "Chemistry", "Maths"],
  "CBSE Boards": ["Physics", "Chemistry", "Maths", "English"],
  "CUET": ["Physics", "Chemistry", "Maths", "English"],
  "NEET": ["Physics", "Chemistry", "Biology"],
};

export const CHAPTERS: Record<string, string[]> = {
  Physics: ["Mechanics", "Thermodynamics", "Electrostatics", "Current Electricity", "Optics", "Modern Physics", "Waves"],
  Chemistry: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"],
  Maths: ["Algebra", "Calculus", "Coordinate Geometry", "Trigonometry", "Vectors", "Probability"],
  English: ["Reading Comprehension", "Writing Skills", "Literature"],
};

// Which exams each chapter appears in (for "Smart Overlap" tags)
export const CHAPTER_OVERLAPS: Record<string, string[]> = {
  Thermodynamics: ["JEE Mains", "JEE Advanced", "CBSE Boards"],
  Mechanics: ["JEE Mains", "JEE Advanced", "CBSE Boards"],
  Electrostatics: ["JEE Mains", "JEE Advanced", "CBSE Boards", "CUET"],
  "Modern Physics": ["JEE Mains", "JEE Advanced", "CBSE Boards"],
  "Organic Chemistry": ["JEE Mains", "JEE Advanced", "CBSE Boards"],
  "Physical Chemistry": ["JEE Mains", "JEE Advanced", "CBSE Boards"],
  Calculus: ["JEE Mains", "JEE Advanced", "CBSE Boards", "CUET"],
  Algebra: ["JEE Mains", "JEE Advanced", "CBSE Boards", "CUET"],
};
