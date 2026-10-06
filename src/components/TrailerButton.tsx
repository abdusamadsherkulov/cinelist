"use client";
import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

export default function TrailerButton({ videoKey, title }: { videoKey: string; title: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Play size={16} fill="currentColor" /> Watch trailer
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close trailer"
              onClick={() => setOpen(false)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent"
            >
              <X size={20} />
            </button>
            <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
                title={`${title} trailer`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}