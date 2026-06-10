import { createFileRoute, Link } from "@tanstack/react-router";
import { EXAMS, useSynapse } from "@/lib/synapse-store";
import { Particles } from "@/components/Particles";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/annual-plan")({
  component: AnnualPlan,
});

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}

function AnnualPlan() {
  const s = useSynapse();
  const today = new Date();
  const end = new Date("2025-06-01");
  const total = daysBetween(today, end);
  const examsWithDates = EXAMS.filter((e) => e.date);
  const readiness: Record<string, number> = { "JEE Advanced": 34, "JEE Mains": 48, "CBSE Boards": 62, "CUET": 71 };

  return (
    <div className="relative min-h-screen bg-app">
      <Particles count={18} />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff2d7e]">Your annual plan</div>
        <h1 className="text-4xl font-bold md:text-6xl">{s.name.toUpperCase()}'S <span className="text-gradient">ANNUAL PLAN.</span></h1>
        <p className="mt-3 text-lg text-muted-foreground">4 exams. 1 side skill. <span className="text-emerald-400">0 conflicts.</span></p>

        {/* Timeline */}
        <div className="card-glass mt-10 rounded-3xl p-8">
          <div className="mb-6 flex items-baseline justify-between">
            <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Timeline</div>
            <div className="text-xs text-muted-foreground">Today → June 2025</div>
          </div>
          <div className="relative h-20">
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-[#ff2d7e]/40 via-[#6c63ff]/40 to-[#22d3ee]/40" />
            {examsWithDates.map((e) => {
              const d = new Date(e.date);
              const pct = Math.max(2, Math.min(98, (daysBetween(today, d) / total) * 100));
              return (
                <div key={e.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
                  <div className="h-5 w-5 rounded-full ring-4 ring-[#0a0c10]" style={{ background: e.color, boxShadow: `0 0 20px ${e.color}` }} />
                  <div className="absolute left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap text-center text-[10px] font-semibold" style={{ color: e.color }}>
                    {e.name}
                    <div className="text-muted-foreground">{new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {examsWithDates.map((e) => {
            const days = daysBetween(today, new Date(e.date));
            const r = readiness[e.name] ?? 50;
            return (
              <div key={e.id} className="card-glass rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{e.name}</div>
                    <div className="mt-1 text-3xl font-bold">{days}<span className="ml-1 text-sm font-normal text-muted-foreground">days</span></div>
                  </div>
                  <div className="h-3 w-3 rounded-full" style={{ background: e.color, boxShadow: `0 0 12px ${e.color}` }} />
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Readiness</span><span className="font-semibold">{r}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${r}%`, background: r < 50 ? "#ef4444" : r < 75 ? "#f59e0b" : "#34d399" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Smart Overlap */}
        <div className="card-glass mt-8 rounded-3xl p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c63ff]">Smart Overlap</div>
          <h2 className="mt-2 text-2xl font-bold">Study once. Crush multiple exams.</h2>
          <div className="mt-6 space-y-3">
            {[
              { topic: "Thermodynamics", subject: "Physics", exams: ["JEE Mains", "JEE Advanced", "CBSE Boards"] },
              { topic: "Organic Chemistry", subject: "Chemistry", exams: ["JEE Mains", "JEE Advanced", "CBSE Boards"] },
              { topic: "Calculus", subject: "Maths", exams: ["JEE Mains", "JEE Advanced", "CBSE Boards", "CUET"] },
              { topic: "Electrostatics", subject: "Physics", exams: ["JEE Mains", "JEE Advanced", "CBSE Boards", "CUET"] },
            ].map((o) => (
              <div key={o.topic} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <div className="text-sm text-muted-foreground">{o.subject}</div>
                  <div className="text-base font-semibold">{o.topic}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {o.exams.map((x) => (
                    <span key={x} className="rounded-full bg-[#6c63ff]/15 px-3 py-1 text-xs font-medium text-[#a3a0ff]">{x}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority order */}
        <div className="card-glass mt-8 rounded-3xl p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff2d7e]">Priority Order</div>
          <div className="mt-6 space-y-2">
            {EXAMS.map((e, i) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm font-bold text-muted-foreground">{i + 1}</div>
                  <div className="font-semibold">{e.name}</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{e.priorityIcon}</span>
                  <span className="text-muted-foreground">{e.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link to="/dashboard" className="mt-10 block">
          <Button className="btn-primary-grad h-16 w-full rounded-2xl text-lg font-semibold text-white shadow-[0_20px_60px_-10px_rgba(255,45,126,0.6)] hover:scale-[1.005]">
            Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
