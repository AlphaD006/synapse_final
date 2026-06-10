export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === current ? "w-8 bg-[#ff2d7e]" : i < current ? "w-4 bg-[#6c63ff]" : "w-4 bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}
