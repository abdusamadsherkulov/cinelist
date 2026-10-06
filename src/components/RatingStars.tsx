"use client";
import { useState, useTransition } from "react";
import { rate, type Snap } from "@/app/actions";

export default function RatingStars({ snap, value }: { snap: Snap; value: number }) {
  const [hover, setHover] = useState(0);
  const [pending, start] = useTransition();
  const shown = hover || value;
  return (
    <div className={pending ? "opacity-60" : ""}>
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            aria-label={`Rate ${n}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => start(() => rate(snap, n === value ? 0 : n))}
            className={`text-2xl leading-none transition hover:scale-125 ${n <= shown ? "text-accent" : "text-zinc-700"}`}
          >
            ★
          </button>
        ))}
        <span className="ml-3 text-sm text-zinc-400">{shown ? `${shown}/10` : "Not rated"}</span>
      </div>
      {value > 0 && <p className="mt-1 text-xs text-zinc-600">Click your rating again to remove it.</p>}
    </div>
  );
}
