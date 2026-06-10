import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Particles } from "@/components/Particles";
import { ProgressDots } from "@/components/ProgressDots";
import { setState, useSynapse, EXAMS, SUBJECTS_BY_EXAM, CHAPTERS, CHAPTER_OVERLAPS } from "@/lib/synapse-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Check, GraduationCap, BookOpen, Briefcase, Trophy, Code, Calendar, Sparkles, ChevronDown, X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Onboarding,
});

const TOTAL_STEPS = 8;

function Onboarding() {
  const s = useSynapse();
  const step = s.onboardingStep;
  const navigate = useNavigate();

  useEffect(() => {
    if (s.onboardingComplete) navigate({ to: "/annual-plan" });
  }, [s.onboardingComplete, navigate]);

  return (
    <div className="relative min-h-screen bg-app overflow-hidden">
      <Particles />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-6 pt-16 pb-28">
        {step === 0 && <Step1Name />}
        {step === 1 && <Step2Grade />}
        {step === 2 && <Step3Goals />}
        {step === 3 && <Step4Dates />}
        {step === 4 && <Step5Confidence />}
        {step === 5 && <Step6Syllabus />}
        {step === 6 && <Step7Schedule />}
        {step === 7 && <Step8Account />}
      </div>
      <ProgressDots current={step} total={TOTAL_STEPS} />
    </div>
  );
}

function Heading({ kicker, children, sub }: { kicker?: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-10">
      {kicker && <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff2d7e]">{kicker}</div>}
      <h1 className="text-4xl font-bold leading-tight md:text-6xl">{children}</h1>
      {sub && <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">{sub}</p>}
    </div>
  );
}

function ContinueBar({ onClick, disabled, label = "Continue" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <div className="mt-auto pt-10">
      <Button
        disabled={disabled}
        onClick={onClick}
        className="btn-primary-grad h-14 w-full rounded-2xl text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(255,45,126,0.6)] transition-all hover:scale-[1.01] hover:shadow-[0_20px_60px_-10px_rgba(255,45,126,0.8)] disabled:opacity-40 disabled:hover:scale-100"
      >
        {label}
      </Button>
    </div>
  );
}

// Step 1
function Step1Name() {
  const s = useSynapse();
  const [name, setName] = useState(s.name);
  return (
    <>
      <Heading kicker="Step 1 of 8" sub="Synapse builds your plan around you — not a template.">
        WHAT'S YOUR <span className="text-gradient">NAME?</span>
      </Heading>
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Aryan"
        className="h-16 rounded-2xl border-white/10 bg-white/5 px-6 text-2xl font-medium text-foreground placeholder:text-muted-foreground focus-visible:border-[#ff2d7e] focus-visible:ring-[#ff2d7e]/40"
      />
      <ContinueBar
        disabled={!name.trim()}
        onClick={() => setState({ name: name.trim(), onboardingStep: 1 })}
      />
    </>
  );
}

// Step 2
const GRADES = [
  { label: "Grade 10", icon: BookOpen },
  { label: "Grade 11", icon: BookOpen },
  { label: "Grade 12", icon: GraduationCap },
  { label: "1st Year College", icon: Trophy },
  { label: "2nd Year College", icon: Trophy },
  { label: "Working Professional", icon: Briefcase },
];
function Step2Grade() {
  const s = useSynapse();
  const [grade, setGrade] = useState(s.grade || "Grade 12");
  return (
    <>
      <Heading kicker="Step 2 of 8">WHAT ARE YOU<br />STUDYING FOR?</Heading>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {GRADES.map(({ label, icon: Icon }) => {
          const selected = grade === label;
          return (
            <button
              key={label}
              onClick={() => setGrade(label)}
              className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                selected ? "border-[#ff2d7e] glow-pink bg-[#ff2d7e]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <Icon className={`h-7 w-7 ${selected ? "text-[#ff2d7e]" : "text-muted-foreground"}`} />
              <div className="mt-4 text-base font-semibold">{label}</div>
            </button>
          );
        })}
      </div>
      <ContinueBar onClick={() => setState({ grade, onboardingStep: 2 })} />
    </>
  );
}

// Step 3
const GOAL_GROUPS = [
  { title: "Academic", items: ["CBSE Boards", "ICSE Boards", "State Boards"] },
  { title: "Competitive Exams", items: ["JEE Mains", "JEE Advanced", "NEET", "CUET", "GATE", "CAT"] },
  { title: "Side Skills", items: ["Coding+DSA", "Data Science", "Web Development", "Design"] },
];
function Step3Goals() {
  const s = useSynapse();
  const [goals, setGoals] = useState<string[]>(s.goals);
  const [customByGroup, setCustomByGroup] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<Record<string, string[]>>({});

  const toggle = (g: string) => setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  const addCustom = (group: string) => {
    const v = customByGroup[group]?.trim();
    if (!v) return;
    setExtras((e) => ({ ...e, [group]: [...(e[group] || []), v] }));
    setGoals((p) => [...p, v]);
    setCustomByGroup((c) => ({ ...c, [group]: "" }));
  };

  return (
    <>
      <Heading kicker="Step 3 of 8">WHAT ARE YOUR <span className="text-gradient">GOALS?</span></Heading>
      <div className="space-y-8">
        {GOAL_GROUPS.map((grp) => (
          <div key={grp.title}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{grp.title}</h3>
            <div className="flex flex-wrap gap-2">
              {[...grp.items, ...(extras[grp.title] || [])].map((g) => {
                const on = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggle(g)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      on ? "border-[#ff2d7e] bg-[#ff2d7e]/15 text-white glow-pink" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <Input
              value={customByGroup[grp.title] || ""}
              onChange={(e) => setCustomByGroup((c) => ({ ...c, [grp.title]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(grp.title); } }}
              placeholder="Type what you don't see…"
              className="mt-3 h-11 rounded-xl border-white/10 bg-white/5 text-sm placeholder:text-muted-foreground/70 focus-visible:border-[#6c63ff]"
            />
          </div>
        ))}
      </div>
      <ContinueBar disabled={goals.length === 0} onClick={() => setState({ goals, onboardingStep: 3 })} />
    </>
  );
}

// Step 4
const DEFAULT_DATES: Record<string, string> = {
  "CBSE Boards": "2025-02-15",
  "JEE Mains": "2025-04-02",
  "JEE Advanced": "2025-05-18",
  "CUET": "2025-05-10",
  "NEET": "2025-05-04",
  "GATE": "2025-02-10",
  "CAT": "2025-11-30",
};
function Step4Dates() {
  const s = useSynapse();
  const examGoals = s.goals.filter((g) => DEFAULT_DATES[g]);
  const [dates, setDates] = useState<Record<string, string>>(() => {
    const d = { ...s.examDates };
    examGoals.forEach((g) => { if (!d[g]) d[g] = DEFAULT_DATES[g] || ""; });
    return d;
  });

  return (
    <>
      <Heading kicker="Step 4 of 8" sub="We'll count down from today and build backwards.">WHEN ARE YOUR <span className="text-gradient">EXAMS?</span></Heading>
      <div className="space-y-3">
        {examGoals.map((g) => (
          <div key={g} className="card-glass flex items-center gap-4 rounded-2xl p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff2d7e]/15 text-[#ff2d7e]">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold">{g}</div>
              <div className="text-xs text-muted-foreground">Tap to change date</div>
            </div>
            <Input
              type="date"
              value={dates[g] || ""}
              onChange={(e) => setDates({ ...dates, [g]: e.target.value })}
              className="w-44 border-white/10 bg-white/5 text-sm"
            />
          </div>
        ))}
        {examGoals.length === 0 && <div className="text-sm text-muted-foreground">No competitive exams selected — skip ahead.</div>}
      </div>
      <ContinueBar onClick={() => setState({ examDates: dates, onboardingStep: 4 })} />
    </>
  );
}

// Step 5
function Step5Confidence() {
  const s = useSynapse();
  const subjectSet = new Set<string>();
  s.goals.forEach((g) => SUBJECTS_BY_EXAM[g]?.forEach((sub) => subjectSet.add(sub)));
  if (subjectSet.size === 0) ["Physics", "Chemistry", "Maths", "English"].forEach((x) => subjectSet.add(x));
  const subjects = Array.from(subjectSet);
  const init: Record<string, number> = {};
  subjects.forEach((x) => { init[x] = s.confidence[x] ?? 5; });
  const [conf, setConf] = useState<Record<string, number>>(init);

  const colorFor = (v: number) => (v < 5 ? "#ef4444" : v <= 7 ? "#f59e0b" : "#34d399");

  return (
    <>
      <Heading kicker="Step 5 of 8" sub="Be honest. Synapse adjusts the plan accordingly.">HOW <span className="text-gradient">CONFIDENT</span> ARE YOU?</Heading>
      <div className="space-y-5">
        {subjects.map((sub) => {
          const v = conf[sub];
          const c = colorFor(v);
          return (
            <div key={sub} className="card-glass rounded-2xl p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <div className="text-base font-semibold">{sub}</div>
                <div className="text-2xl font-bold" style={{ color: c }}>{v}<span className="text-base text-muted-foreground">/10</span></div>
              </div>
              <Slider
                min={1} max={10} step={1}
                value={[v]}
                onValueChange={([nv]) => setConf({ ...conf, [sub]: nv })}
                style={{ ["--primary" as string]: c }}
              />
            </div>
          );
        })}
      </div>
      <ContinueBar onClick={() => setState({ confidence: conf, onboardingStep: 5 })} />
    </>
  );
}

// Step 6
function Step6Syllabus() {
  const s = useSynapse();
  const examGoals = s.goals.filter((g) => SUBJECTS_BY_EXAM[g]);
  const [open, setOpen] = useState<string | null>(examGoals[0] || null);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const c: Record<string, boolean> = {};
    examGoals.forEach((g) => SUBJECTS_BY_EXAM[g]?.forEach((sub) => CHAPTERS[sub]?.forEach((ch) => { c[`${g}|${sub}|${ch}`] = true; })));
    return c;
  });
  const toggle = (k: string) => setChecked((c) => ({ ...c, [k]: !c[k] }));

  return (
    <>
      <Heading kicker="Step 6 of 8">LET'S SET UP YOUR <span className="text-gradient">SYLLABUS.</span></Heading>
      <div className="space-y-3">
        {examGoals.map((g) => {
          const isOpen = open === g;
          return (
            <div key={g} className="card-glass overflow-hidden rounded-2xl">
              <button onClick={() => setOpen(isOpen ? null : g)} className="flex w-full items-center justify-between p-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{g}</div>
                    <div className="text-xs text-emerald-400/80">syllabus pre-loaded</div>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="space-y-4 border-t border-white/5 p-5">
                  {SUBJECTS_BY_EXAM[g]?.map((sub) => (
                    <div key={sub}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{sub}</div>
                      <div className="space-y-2">
                        {CHAPTERS[sub]?.map((ch) => {
                          const key = `${g}|${sub}|${ch}`;
                          const on = checked[key];
                          const overlaps = CHAPTER_OVERLAPS[ch] || [];
                          return (
                            <label key={ch} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${on ? "border-[#ff2d7e] bg-[#ff2d7e]" : "border-white/20"}`}>
                                  {on && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <input type="checkbox" checked={!!on} onChange={() => toggle(key)} className="sr-only" />
                                <span className="text-sm font-medium">{ch}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {overlaps.map((o) => (
                                  <span key={o} className="rounded-full bg-[#6c63ff]/15 px-2 py-0.5 text-[10px] font-medium text-[#a3a0ff]">{o}</span>
                                ))}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ContinueBar onClick={() => setState({ syllabus: checked, onboardingStep: 6 })} />
    </>
  );
}

// Step 7
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function Step7Schedule() {
  const s = useSynapse();
  const [grid, setGrid] = useState<boolean[][]>(s.schedule);

  const toggle = (h: number, d: number) => {
    setGrid((g) => g.map((row, ri) => ri === h ? row.map((c, ci) => ci === d ? !c : c) : row));
  };
  const totalHrs = grid.flat().filter(Boolean).length;
  // Sleep = unmarked night slots (10pm-6am next day across 7 days): 8 hrs/day * 7
  // Roughly compute average sleep based on how many night-hour slots remain unused. We approximate based on schedule density.
  // Simpler: assume 8 base sleep hrs, subtract 0.5 per study hour above 10/day on avg.
  const avgStudyPerDay = totalHrs / 7;
  const avgSleep = Math.max(0, 11 - avgStudyPerDay * 0.5);
  const sleepOk = avgSleep >= 6;

  return (
    <>
      <Heading kicker="Step 7 of 8">BUILD YOUR <span className="text-gradient">SCHEDULE.</span></Heading>
      <div className="card-glass overflow-x-auto rounded-2xl p-4">
        <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="w-12"></th>
              {DAYS.map((d) => <th key={d} className="pb-2 text-center font-semibold text-muted-foreground">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, h) => {
              const hour = 6 + h;
              const label = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "p" : "a"}`;
              return (
                <tr key={h}>
                  <td className="pr-2 text-right text-[10px] text-muted-foreground">{label}</td>
                  {row.map((c, d) => (
                    <td key={d}>
                      <button
                        onClick={() => toggle(h, d)}
                        className={`h-6 w-full rounded transition-all ${c ? "bg-[#ff2d7e]/80 shadow-[0_0_8px_rgba(255,45,126,0.5)]" : "bg-white/[0.04] hover:bg-white/10"}`}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm">Total free hours this week: <span className="text-lg font-bold text-[#ff2d7e]">{totalHrs} hrs</span></div>
        <div className="text-sm">Avg sleep: <span className={`font-bold ${sleepOk ? "text-emerald-400" : "text-red-400"}`}>{avgSleep.toFixed(1)} hrs</span></div>
      </div>
      {!sleepOk && <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">You need at least 6 hours of sleep. Please adjust your schedule.</div>}
      <ContinueBar disabled={!sleepOk} onClick={() => setState({ schedule: grid, onboardingStep: 7 })} />
    </>
  );
}

// Step 8
function Step8Account() {
  const [email, setEmail] = useState("aryan@synapse.app");
  const [password, setPassword] = useState("synapse2025");
  const valid = email.includes("@") && password.length >= 6;

  return (
    <>
      <Heading kicker="Step 8 of 8" sub="Create an account to keep your goals, schedule, and confidence levels synced across devices.">
        SAVE YOUR <span className="text-gradient">PLAN.</span>
      </Heading>
      <div className="space-y-4">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-14 rounded-2xl border-white/10 bg-white/5 px-5 text-base" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (min 6 chars)" className="h-14 rounded-2xl border-white/10 bg-white/5 px-5 text-base" />
        <a href="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Already have an account? <span className="text-[#ff2d7e]">Log in</span></a>
      </div>
      <ContinueBar disabled={!valid} label="Create account & continue" onClick={() => setState({ onboardingComplete: true })} />
    </>
  );
}
