"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star, User } from "lucide-react";

type MovieHit = { kind: "movie"; id: number; title: string; year: string | null; poster: string | null; vote: number };
type PersonHit = { kind: "person"; id: number; name: string; photo: string | null; dept: string };
type Hit = MovieHit | PersonHit;

const hrefOf = (h: Hit) => (h.kind === "movie" ? `/movie/${h.id}` : `/actor/${h.id}`);

export default function SearchBox({ large = false, bar = false }: { large?: boolean; bar?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1); // highlighted row, -1 = none
  const box = useRef<HTMLDivElement>(null);

  // debounced live search
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setHits(await r.json());
        setActive(-1);
        setOpen(true);
        setLoading(false);
      } catch {
        /* aborted by a newer keystroke */
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // close when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const showPanel = open && q.trim().length >= 2;
  // "see all" opens the Actors tab when an actor was the top match
  const allUrl = `/search?q=${encodeURIComponent(q.trim())}${hits[0]?.kind === "person" ? "&type=person" : ""}`;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    if (hits.length === 0) return;
    e.preventDefault();
    setOpen(true);
    const total = hits.length + 1; // one extra stop for "See all results"
    setActive((i) => (e.key === "ArrowDown" ? (i + 1) % total : (i - 1 + total) % total));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    if (showPanel && active >= 0 && active < hits.length) router.push(hrefOf(hits[active]));
    else router.push(allUrl);
    setActive(-1);
  }

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} className="relative">
        {large && (
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        )}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={large ? "Search movies or actors…" : "Search movies or actors…"}
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          className={`input rounded-full ${large ? "!py-3.5 !pl-12 !text-base" : ""}`}
        />
      </form>

      {showPanel && (
        <div
          role="listbox"
          className={`z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-panel shadow-2xl ${
            bar ? "fixed inset-x-3 top-16" : "absolute left-0 right-0 top-full mt-2"
          }`}
        >
          {loading && hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">Nothing found.</p>
          ) : (
            <>
              {hits.map((h, i) => (
                <div key={`${h.kind}-${h.id}`}>
                  {(i === 0 || hits[i - 1].kind !== h.kind) && (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      {h.kind === "movie" ? "Movies" : "Actors"}
                    </p>
                  )}
                  <Link
                    href={hrefOf(h)}
                    role="option"
                    aria-selected={i === active}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-3 py-2 ${i === active ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    {h.kind === "movie" ? (
                      <>
                        {h.poster ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https://image.tmdb.org/t/p/w92${h.poster}`} alt="" className="h-14 w-10 rounded object-cover" />
                        ) : (
                          <div className="h-14 w-10 rounded bg-line" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{h.title}</p>
                          <p className="text-xs text-zinc-500">{h.year ?? "—"}</p>
                        </div>
                        {h.vote > 0 && (
                          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
                            <Star size={14} fill="currentColor" /> {h.vote.toFixed(1)}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {h.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https://image.tmdb.org/t/p/w92${h.photo}`} alt="" className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-line text-zinc-500">
                            <User size={20} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{h.name}</p>
                          <p className="text-xs text-zinc-500">{h.dept}</p>
                        </div>
                      </>
                    )}
                  </Link>
                </div>
              ))}
              <Link
                href={allUrl}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActive(hits.length)}
                className={`block border-t border-line px-4 py-2.5 text-center text-sm text-accent ${
                  active === hits.length ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                See all results for “{q.trim()}”
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}