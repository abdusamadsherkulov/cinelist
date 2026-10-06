"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Cake, MapPin, User } from "lucide-react";
import { ageOf, fmtDate } from "@/lib/format";

type Cast = { id: number; name: string; character: string };
type Info = {
  name: string;
  photo: string | null;
  department: string;
  birthday: string | null;
  deathday: string | null;
  place: string | null;
  bio: string;
};

const cache = new Map<number, Info | null>(); // so each actor is fetched only once

function ActorName({ a }: { a: Cast }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Info | null | undefined>(cache.get(a.id)); // undefined = loading
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter() {
    timer.current = setTimeout(async () => {
      setOpen(true);
      if (cache.has(a.id)) return setInfo(cache.get(a.id));
      try {
        const r = await fetch(`/api/person/${a.id}`);
        const d: Info | null = r.ok ? await r.json() : null;
        cache.set(a.id, d);
        setInfo(d);
      } catch {
        setInfo(null);
      }
    }, 250);
  }

  function leave() {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  }

  return (
    <span className="relative inline-block" onMouseEnter={enter} onMouseLeave={leave}>
      <Link
        href={`/actor/${a.id}`}
        onFocus={enter}
        onBlur={leave}
        className="text-zinc-300 underline-offset-4 transition hover:text-accent hover:underline"
      >
        {a.name}
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-30 pt-2">
          <div className="w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-panel p-3 text-left shadow-2xl">
            <div className="flex gap-3">
              {info?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://image.tmdb.org/t/p/w185${info.photo}`}
                  alt={a.name}
                  className="h-24 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-line text-zinc-500">
                  <User size={24} />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-white">{a.name}</p>
                {info?.department && <p className="text-xs text-zinc-500">{info.department}</p>}
                {a.character && <p className="mt-1 text-xs text-accent">as {a.character}</p>}
              </div>
            </div>

            {info === undefined ? (
              <div className="mt-3 space-y-2 animate-pulse">
                <div className="h-3 w-2/3 rounded bg-line" />
                <div className="h-3 w-full rounded bg-line" />
                <div className="h-3 w-5/6 rounded bg-line" />
              </div>
            ) : info ? (
              <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
                {info.birthday && (
                  <p className="flex items-center gap-1.5">
                    <Cake size={13} className="shrink-0 text-accent" />
                    {fmtDate(info.birthday)}
                    {!info.deathday && ` (age ${ageOf(info.birthday)})`}
                  </p>
                )}
                {info.deathday && (
                  <p className="pl-5 text-zinc-500">
                    Died {fmtDate(info.deathday)}
                    {info.birthday && ` (age ${ageOf(info.birthday, info.deathday)})`}
                  </p>
                )}
                {info.place && (
                  <p className="flex items-start gap-1.5">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-accent" />
                    {info.place}
                  </p>
                )}
                {info.bio && <p className="line-clamp-4 pt-1 leading-relaxed">{info.bio}</p>}
              </div>
            ) : null}

            <p className="mt-3 border-t border-line pt-2 text-xs text-accent">Click to see all movies →</p>
          </div>
        </div>
      )}
    </span>
  );
}

export default function CastList({ cast }: { cast: Cast[] }) {
  return (
    <div className="mt-6 text-sm leading-7 text-zinc-400">
      <span className="font-semibold text-zinc-200">Cast: </span>
      {cast.map((a, i) => (
        <span key={a.id}>
          <ActorName a={a} />
          {i < cast.length - 1 && <span className="text-zinc-600"> · </span>}
        </span>
      ))}
    </div>
  );
}