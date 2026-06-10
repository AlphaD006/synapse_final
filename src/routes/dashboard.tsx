import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EXAMS, useSynapse, setState } from "@/lib/synapse-store";
import { ChatBox } from "@/components/ChatBox";
import { LogOut, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}

function Dashboard() {
  const s = useSynapse();
  const navigate = useNavigate();
  const today = new Date();
  const readiness: Record<string, number> = s.readiness;

  const statusStyle = (st: string) =>
    st === "completed" ? "border-emerald-500/30 bg-emerald-500/10"
    : st === "overdue" ? "border-red-500/30 bg-red-500/10"
    : "border-amber-500/30 bg-amber-500/10";
  const badgeStyle = (st: string) =>
    st === "completed" ? "bg-emerald-500/20 text-emerald-300"
    : st === "overdue" ? "bg-red-500/20 text-red-300"
    : "bg-amber-500/20 text-amber-300";

  return (
    <div className="relative min-h-screen bg-app pb-32">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0c10]/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Good morning,</div>
            <div className="text-xl font-bold">{s.name} <span className="text-[#ff2d7e]">👋</span></div>
          </div>
          <div className="hidden text-center md:block">
            <div className="text-xs text-muted-foreground">{today.toLocaleDateString(undefined, { weekday: "long" })}</div>
            <div className="text-base font-semibold">{today.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
          <button onClick={() => { localStorage.removeItem("synapse-state-v1"); navigate({ to: "/login" }); }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {s.banner && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#6c63ff]/30 bg-[#6c63ff]/10 px-5 py-3 text-sm">
            <Sparkles className="h-4 w-4 text-[#6c63ff]" />
            <span>{s.banner}</span>
            <button onClick={() => setState({ banner: null })} className="ml-auto text-xs text-muted-foreground hover:text-foreground">dismiss</button>
          </div>
        )}

        {/* Exam countdown */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {EXAMS.filter((e) => e.date).map((e) => {
            const days = daysBetween(today, new Date(e.date));
            const r = readiness[e.name] ?? 50;
            return (
              <div key={e.id} className="card-glass rounded-2xl p-5 transition hover:scale-[1.01]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: e.color, boxShadow: `0 0 10px ${e.color}` }} />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{e.name}</div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className="text-5xl font-bold tracking-tight">{days}</div>
                  <div className="text-sm text-muted-foreground">days left</div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Readiness</span><span className="font-semibold">{r}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full transition-all duration-700" style={{ width: `${r}%`, background: r < 50 ? "#ef4444" : r < 75 ? "#f59e0b" : "#34d399" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's tasks */}
        <div className="mt-10 mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">TODAY'S <span className="text-gradient">TASKS</span></h2>
          <div className="text-sm text-muted-foreground">{s.tasks.filter(t=>t.status==="completed").length} / {s.tasks.length} done</div>
        </div>
        <div className="space-y-2">
          {s.tasks.map((t) => (
            <Link key={t.id} to="/session/$id" params={{ id: t.id }} className={`group flex items-center gap-4 rounded-2xl border p-4 backdrop-blur transition hover:scale-[1.005] ${statusStyle(t.status)}`}>
              <div className="w-24 text-sm font-mono text-muted-foreground">{t.start} – {t.end}</div>
              <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: t.subjectColor, boxShadow: `0 0 8px ${t.subjectColor}` }} />
              <div className="flex-1">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.subject} • {t.examTag}</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeStyle(t.status)}`}>{t.status}</div>
            </Link>
          ))}
        </div>
      </div>

      <ChatBox />
    </div>
  );
}
