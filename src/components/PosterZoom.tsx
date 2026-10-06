"use client";
import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";

const MAX = 5;

export default function PosterZoom({ small, large, title }: { small: string; large: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 }); // scale + pan offset
  const [dragging, setDragging] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0, moved: 0 });

  const close = () => {
    setOpen(false);
    setView({ s: 1, x: 0, y: 0 });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // keep the image from being dragged out of view
  const clampPan = (x: number, y: number, s: number, r: DOMRect) => {
    const mx = (r.width * (s - 1)) / 2;
    const my = (r.height * (s - 1)) / 2;
    return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  };

  // change scale while keeping the point under the cursor in place
  function zoomBy(next: (s: number) => number, cx: number, cy: number) {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    setView((v) => {
      const s2 = Math.min(MAX, Math.max(1, next(v.s)));
      if (s2 === 1) return { s: 1, x: 0, y: 0 };
      const px = cx - (r.left + r.width / 2);
      const py = cy - (r.top + r.height / 2);
      const k = s2 / v.s;
      return { s: s2, ...clampPan(px - (px - v.x) * k, py - (py - v.y) * k, s2, r) };
    });
  }

  function onWheel(e: React.WheelEvent) {
    zoomBy((s) => s * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, moved: 0 };
    if (view.s > 1) setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy));
    const r = frame.current?.getBoundingClientRect();
    if (!r || view.s <= 1) return;
    setView((v) => ({ ...v, ...clampPan(d.ox + dx, d.oy + dy, v.s, r) }));
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    d.active = false;
    setDragging(false);
    if (d.moved < 5) zoomBy((s) => (s > 1 ? 1 : 2.5), e.clientX, e.clientY); // a plain click toggles zoom
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`View ${title} poster full screen`}
        className="group/zoom relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-line shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={small} alt={title} className="w-full transition duration-500 group-hover/zoom:scale-105" />
        <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition group-hover/zoom:opacity-100">
          <Maximize2 size={16} />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={close}>
          <button
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-accent hover:text-accent"
          >
            <X size={22} />
          </button>

          <div
            ref={frame}
            onClick={(e) => e.stopPropagation()}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: "none" }}
            className={`select-none overflow-hidden rounded-xl shadow-2xl ${
              view.s > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={large}
              alt={title}
              draggable={false}
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
              className={`block max-h-[90vh] max-w-full object-contain ${dragging ? "" : "transition-transform duration-150 ease-out"}`}
            />
          </div>

          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur">
            Scroll to zoom · drag to move · Esc to close
          </p>
        </div>
      )}
    </>
  );
}