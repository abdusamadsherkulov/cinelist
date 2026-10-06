"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Scroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const btn =
    "absolute top-[108px] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full " +
    "border border-white/15 bg-black/60 text-white shadow-xl backdrop-blur-md transition " +
    "hover:scale-110 hover:border-accent hover:bg-accent hover:text-black " +
    "sm:top-[132px] sm:flex opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100";

  return (
    <div className="group/row relative">
      {/* edge fades: only on the side that has more to scroll */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-ink to-transparent transition-opacity duration-300 ${
          canLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-ink to-transparent transition-opacity duration-300 ${
          canRight ? "opacity-100" : "opacity-0"
        }`}
      />

      {canLeft && (
        <button aria-label="Scroll left" onClick={() => scroll(-1)} className={`${btn} left-2`}>
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
      )}

      <div ref={ref} onScroll={update} className="no-scrollbar -mt-3 flex gap-4 overflow-x-auto pb-4 pt-3">
        {children}
      </div>

      {canRight && (
        <button aria-label="Scroll right" onClick={() => scroll(1)} className={`${btn} right-2`}>
          <ChevronRight size={26} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}