import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSynapse, setState } from "@/lib/synapse-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, SkipForward, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/session/$id")({
  component: Session,
});

// ─── Video map ───────────────────────────────────────────────────────────────
const TOPIC_VIDEOS: Record<string, { videoId: string; title: string; views: string; channel: string }> = {
  "Thermodynamics": {
    videoId: "MvnyFuq3yLY",
    title: "Thermodynamics Complete Chapter in 55 Min — JEE",
    views: "2.4M views",
    channel: "Physics Wallah",     //https://youtu.be/MvnyFuq3yLY?si=nppllXYrTKY0qB2a
  },
  "Organic Chemistry": {
    videoId: "kEUlG3_Ouxs",
    title: "Organic Chemistry Full Revision — JEE",
    views: "1.9M views",
    channel: "Physics Wallah",   //https://www.youtube.com/live/kEUlG3_Ouxs?si=R9L9mNKE1PorfDuX
  },
  "Integration PYQs": {
    videoId: "HFcSGCXmsaw",
    title: "Integration PYQs — JEE Maths",
    views: "1.1M views",
    channel: "Physics Wallah",   //https://youtu.be/HFcSGCXmsaw?si=W6UFVtZH3uWgdoe_
  },
  "Modern Physics Revision": {
    videoId: "vP9LzR8zupE",
    title: "Modern Physics Complete Chapter — JEE",
    views: "2.1M views",
    channel: "Physics Wallah",   //https://www.youtube.com/live/vP9LzR8zupE?si=bpuUwoU6BOwq5NHv
  },
  "English Essay": {
    videoId: "o9aVjBHEEbU",
    title: "Essay Writing — CBSE Class 12",
    views: "540K views",
    channel: "Magnet Brains",         //https://youtu.be/o9aVjBHEEbU?si=8308EJaVLsO3iaGI
  },
  "Coding — Arrays": {
    videoId: "8wmn7k1TTcI",
    title: "Arrays Full Chapter — DSA",
    views: "1.5M views",
    channel: "Apna College",            // https://youtu.be/8wmn7k1TTcI?si=soH1mQY8TjuDlLlG
  }, 
};

const DEFAULT_VIDEO = TOPIC_VIDEOS["Thermodynamics"];

// ─── Question bank ────────────────────────────────────────────────────────────
type Question = { q: string; opts: string[]; correct: number; tag: string; level: string };

const QUESTIONS_BY_TOPIC: Record<string, Question[]> = {
  "Thermodynamics": [
    { q: "A Carnot engine has efficiency 40%. If the sink temp is 300 K, source temp is?", opts: ["500 K", "600 K", "750 K", "900 K"], correct: 0, tag: "JEE 2022", level: "Easy" },
    { q: "Internal energy change for an ideal gas in isothermal process is:", opts: ["Positive", "Negative", "Zero", "Cannot determine"], correct: 2, tag: "JEE 2021", level: "Easy" },
    { q: "For a reversible adiabatic process, dS equals:", opts: ["nR ln(V₂/V₁)", "Zero", "Cv dT/T", "Cp dT/T"], correct: 1, tag: "JEE 2023", level: "Medium" },
    { q: "Two moles of ideal gas expand isothermally at 300 K from 2 L to 8 L. Work done is approx:", opts: ["3.46 kJ", "6.92 kJ", "1.73 kJ", "13.8 kJ"], correct: 0, tag: "JEE Adv 2020", level: "Medium" },
    { q: "Coefficient of performance of a Carnot refrigerator working between 250 K and 300 K is:", opts: ["5", "6", "0.83", "0.17"], correct: 0, tag: "JEE Adv 2021", level: "Hard" },
  ],
  "Organic Chemistry": [
    { q: "Which reagent converts a primary alcohol to an aldehyde without over-oxidation?", opts: ["KMnO₄", "PCC", "K₂Cr₂O₇/H₂SO₄", "CrO₃"], correct: 1, tag: "JEE 2022", level: "Easy" },
    { q: "The IUPAC name of CH₃–CH(OH)–COOH is:", opts: ["2-hydroxypropanoic acid", "3-hydroxypropanoic acid", "Lactic acid", "Propan-2-ol acid"], correct: 0, tag: "JEE 2021", level: "Easy" },
    { q: "Which of the following undergoes SN1 reaction most readily?", opts: ["CH₃Cl", "(CH₃)₃CCl", "CH₃CH₂Cl", "CH₂=CHCl"], correct: 1, tag: "JEE 2023", level: "Medium" },
    { q: "In Friedel–Crafts alkylation, the electrophile is:", opts: ["R⁻", "R⁺", "RX", "AlCl₃"], correct: 1, tag: "JEE Adv 2020", level: "Medium" },
    { q: "Identify the product when aniline reacts with excess CH₃I followed by Ag₂O/H₂O (Hofmann exhaustive methylation):", opts: ["N,N-dimethylaniline", "Trimethylamine", "N-methylaniline", "Trimethylammonium salt"], correct: 3, tag: "JEE Adv 2021", level: "Hard" },
  ],
  "Integration PYQs": [
    { q: "∫(1/x)dx equals:", opts: ["x + C", "ln|x| + C", "1/x² + C", "x ln x + C"], correct: 1, tag: "JEE 2022", level: "Easy" },
    { q: "∫sin²x dx equals:", opts: ["x/2 − sin2x/4 + C", "−cos2x/2 + C", "sin2x/2 + C", "x/2 + sin2x/4 + C"], correct: 0, tag: "JEE 2021", level: "Easy" },
    { q: "Value of ∫₀^(π/2) sin x/(sin x + cos x) dx is:", opts: ["0", "π/4", "π/2", "1"], correct: 1, tag: "JEE 2023", level: "Medium" },
    { q: "∫x·eˣ dx equals:", opts: ["eˣ(x−1) + C", "xeˣ + C", "eˣ + C", "x²eˣ/2 + C"], correct: 0, tag: "JEE Adv 2020", level: "Medium" },
    { q: "∫₀¹ x(1−x)⁴ dx equals:", opts: ["1/30", "1/20", "1/5", "1/42"], correct: 0, tag: "JEE Adv 2021", level: "Hard" },
  ],
  "Modern Physics Revision": [
    { q: "The de Broglie wavelength of a particle is inversely proportional to its:", opts: ["Mass", "Velocity", "Momentum", "Energy"], correct: 2, tag: "JEE 2022", level: "Easy" },
    { q: "In photoelectric effect, stopping potential depends on:", opts: ["Intensity of light", "Frequency of light", "Both", "Neither"], correct: 1, tag: "JEE 2021", level: "Easy" },
    { q: "Half-life of a radioactive element is 10 days. After 30 days, fraction remaining is:", opts: ["1/2", "1/4", "1/8", "1/16"], correct: 2, tag: "JEE 2023", level: "Medium" },
    { q: "Energy of a photon of wavelength 4000 Å (h=6.6×10⁻³⁴, c=3×10⁸) is approximately:", opts: ["3.1 eV", "2.5 eV", "4.9 eV", "1.2 eV"], correct: 0, tag: "JEE Adv 2020", level: "Medium" },
    { q: "In a hydrogen atom, transition from n=4 to n=2 emits a photon of the:", opts: ["Lyman series", "Balmer series", "Paschen series", "Brackett series"], correct: 1, tag: "JEE Adv 2021", level: "Hard" },
  ],
  "English Essay": [
    { q: "Which of the following best describes the purpose of a thesis statement?", opts: ["To summarize the essay", "To introduce the topic and state the main argument", "To provide evidence", "To conclude the essay"], correct: 1, tag: "CBSE 2023", level: "Easy" },
    { q: "A coherent essay paragraph should begin with a:", opts: ["Conclusion", "Topic sentence", "Supporting detail", "Transition word"], correct: 1, tag: "CBSE 2022", level: "Easy" },
    { q: "Which tone is most appropriate for a formal argumentative essay?", opts: ["Casual and conversational", "Emotional and personal", "Objective and analytical", "Humorous and light"], correct: 2, tag: "CBSE 2023", level: "Medium" },
    { q: "The word 'however' in an essay primarily serves to:", opts: ["Add information", "Show contrast", "Give examples", "Conclude"], correct: 1, tag: "CBSE 2021", level: "Medium" },
    { q: "In a 'discuss both views' essay, the writer should:", opts: ["Only argue one side", "Present both sides and give their opinion", "Avoid giving an opinion", "Only use statistics"], correct: 1, tag: "CBSE 2022", level: "Hard" },
  ],
  "Coding — Arrays": [
    { q: "What is the time complexity of accessing an element in an array by index?", opts: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 2, tag: "DSA Basics", level: "Easy" },
    { q: "Which algorithm finds the maximum subarray sum in O(n)?", opts: ["Binary Search", "Bubble Sort", "Kadane's Algorithm", "Merge Sort"], correct: 2, tag: "DSA Interview", level: "Easy" },
    { q: "To rotate an array of n elements by k positions, the optimal time complexity is:", opts: ["O(n²)", "O(n log n)", "O(n)", "O(k)"], correct: 2, tag: "DSA Interview", level: "Medium" },
    { q: "Two Sum problem: given an array and target, find two indices. Best approach is:", opts: ["Brute force O(n²)", "Sorting O(n log n)", "HashMap O(n)", "Binary search O(n log n)"], correct: 2, tag: "LeetCode Easy", level: "Medium" },
    { q: "Trapping Rain Water problem has an optimal space complexity of:", opts: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correct: 1, tag: "LeetCode Hard", level: "Hard" },
  ],
};

const DEFAULT_QUESTIONS = QUESTIONS_BY_TOPIC["Thermodynamics"];

function getQuestions(title: string): Question[] {
  return QUESTIONS_BY_TOPIC[title] || DEFAULT_QUESTIONS;
}

function getVideo(title: string) {
  return TOPIC_VIDEOS[title] || DEFAULT_VIDEO;
}

// ─── Component ────────────────────────────────────────────────────────────────
function Session() {
  const { id } = useParams({ from: "/session/$id" });
  const s = useSynapse();
  const task = s.tasks.find((t) => t.id === id) || s.tasks[0];

  const video = getVideo(task.title);
  const questions = getQuestions(task.title);

  const [phase, setPhase] = useState<"video" | "quiz" | "result">("video");
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Pomodoro countdown
  useEffect(() => {
    if (phase !== "video") return;
    const interval = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (seconds === 0 && phase === "video") setPhase("quiz");
  }, [seconds, phase]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = ((25 * 60 - seconds) / (25 * 60)) * 100;

  const score = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
    0
  );

  const submit = () => {
    setPhase("result");
    if (score < 3) {
      setState((cur) => ({
        readiness: {
          ...cur.readiness,
          [task.examTag.split(" + ")[0]]: Math.max(
            0,
            (cur.readiness[task.examTag.split(" + ")[0]] || 50) - 4
          ),
        },
        banner: "Synapse updated your plan",
        tasks: cur.tasks.map((t) =>
          t.id === task.id ? { ...t, status: "pending" as const } : t
        ),
      }));
    } else {
      setState((cur) => ({
        tasks: cur.tasks.map((t) =>
          t.id === task.id ? { ...t, status: "completed" as const } : t
        ),
      }));
    }
  };

  return (
    <div className="relative min-h-screen bg-app">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="card-glass rounded-3xl p-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff2d7e]">
                {task.subject}
              </div>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{task.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {task.examTag.split(" + ").map((e) => (
                  <span
                    key={e}
                    className="rounded-full bg-[#6c63ff]/15 px-3 py-1 text-xs font-medium text-[#a3a0ff]"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {task.start} – {task.end}
            </div>
          </div>

          {/* ── VIDEO PHASE ─────────────────────────────────────────────── */}
          {phase === "video" && (
            <>
              {/* Video player */}
              <div className="mt-6 relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
                {!playing ? (
                  <>
                    {/* Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        // fallback to hqdefault if maxres not available
                        (e.target as HTMLImageElement).src =
                          `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setPlaying(true)}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff0000] shadow-[0_0_50px_rgba(255,0,0,0.6)] transition hover:scale-110 active:scale-95"
                        aria-label="Play video"
                      >
                        <Play className="ml-1 h-9 w-9 text-white" fill="white" />
                      </button>
                    </div>
                    {/* Video info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                      <div className="text-sm font-semibold">{video.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {video.views} • {video.channel}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Embedded YouTube player */
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Pomodoro timer */}
              <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Pomodoro focus session
                </div>
                <div className="relative">
                  <svg className="h-44 w-44 -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                      cx="50" cy="50" r="44"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="50" cy="50" r="44"
                      stroke="url(#pomGrad)"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                    <defs>
                      <linearGradient id="pomGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ff2d7e" />
                        <stop offset="100%" stopColor="#6c63ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-4xl font-bold">{mm}:{ss}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      focus
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setPhase("quiz")}
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5"
                >
                  <SkipForward className="mr-2 h-4 w-4" /> Skip to problem set
                </Button>
              </div>
            </>
          )}

          {/* ── QUIZ PHASE ──────────────────────────────────────────────── */}
          {phase === "quiz" && (
            <div className="mt-6 space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c63ff]">
                Problem Set — 5 questions
              </div>
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-[#6c63ff]/20 px-2 py-0.5 font-semibold text-[#a3a0ff]">
                      {q.tag}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                      {q.level}
                    </span>
                  </div>
                  <div className="mb-3 font-medium">
                    {i + 1}. {q.q}
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {q.opts.map((opt, oi) => {
                      const selected = answers[i] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers({ ...answers, [i]: oi })}
                          className={`rounded-xl border p-3 text-left text-sm transition ${
                            selected
                              ? "border-[#ff2d7e] bg-[#ff2d7e]/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          }`}
                        >
                          <span className="mr-2 text-muted-foreground">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Button
                onClick={submit}
                disabled={Object.keys(answers).length < 5}
                className="btn-primary-grad h-14 w-full rounded-2xl font-semibold text-white disabled:opacity-40"
              >
                Submit answers
              </Button>
            </div>
          )}

          {/* ── RESULT PHASE ────────────────────────────────────────────── */}
          {phase === "result" && (
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2d7e] to-[#6c63ff] shadow-[0_0_60px_rgba(255,45,126,0.5)]">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <div className="mt-6 text-6xl font-bold">
                {score}
                <span className="text-3xl text-muted-foreground">/5</span>
              </div>
              <div className="mt-2 text-muted-foreground">
                {score >= 4
                  ? "Crushed it. Onto the next."
                  : score >= 3
                  ? "Solid. Keep momentum."
                  : "Synapse will tune your plan."}
              </div>
              {score < 3 && (
                <div className="mt-4 rounded-xl border border-[#ff2d7e]/30 bg-[#ff2d7e]/10 px-6 py-3 text-sm text-[#ff2d7e]">
                  Revision rescheduled · Easier problems queued · Readiness adjusted
                </div>
              )}
              <Link to="/dashboard" className="mt-8 w-full">
                <Button className="btn-primary-grad h-14 w-full rounded-2xl font-semibold text-white">
                  Back to dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
