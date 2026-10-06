"use client";
import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export default function FilterToggle({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      {/* phone only: the show/hide bar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-2xl border border-line bg-panel px-5 py-3.5 text-sm font-semibold transition hover:border-accent md:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-black">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown size={18} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* hidden on phones until opened, always visible on desktop */}
      <div className={`${open ? "block" : "hidden"} mt-3 md:mt-0 md:block`}>{children}</div>
    </div>
  );
}