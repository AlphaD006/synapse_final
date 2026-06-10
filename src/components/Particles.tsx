import { useMemo } from "react";

export function Particles({ count = 30 }: { count?: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => {
      const size = 2 + Math.random() * 5;
      const left = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = 15 + Math.random() * 20;
      const isPink = Math.random() > 0.5;
      return { i, size, left, delay, duration, isPink };
    }), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.i}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.isPink ? "rgba(255,45,126,0.6)" : "rgba(108,99,255,0.6)",
            boxShadow: p.isPink ? "0 0 12px rgba(255,45,126,0.8)" : "0 0 12px rgba(108,99,255,0.8)",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
