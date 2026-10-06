import Link from "next/link";
import { Star, Info } from "lucide-react";
import { img } from "@/lib/tmdb";

export type CardMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  year: string | null;
  vote?: number;
  overview?: string;
};

export default function MovieCard({ m }: { m: CardMovie }) {
  const src = img(m.poster_path);
  return (
    <Link href={`/movie/${m.id}`} className="group/card block w-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-line bg-panel transition-all duration-300 group-hover/card:border-accent group-hover/card:shadow-[0_12px_32px_-8px_rgba(255,183,3,0.45)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={m.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover/card:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-zinc-500">{m.title}</div>
        )}

        {/* rating badge, fades out when the overlay appears */}
        {m.vote ? (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-accent backdrop-blur transition group-hover/card:opacity-0">
            <Star size={12} fill="currentColor" /> {m.vote.toFixed(1)}
          </span>
        ) : null}

        {/* hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/70 to-transparent p-3 opacity-0 transition duration-300 group-hover/card:opacity-100">
          <div className="translate-y-3 transition duration-300 group-hover/card:translate-y-0">
            {m.vote ? (
              <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                <Star size={14} fill="currentColor" /> {m.vote.toFixed(1)}
              </div>
            ) : null}
            {m.overview && <p className="mt-1 line-clamp-3 text-xs leading-snug text-zinc-300">{m.overview}</p>}
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">
              <Info size={12} /> Details
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 truncate text-sm font-medium transition group-hover/card:text-accent">{m.title}</p>
      {m.year && <p className="text-xs text-zinc-500">{m.year}</p>}
    </Link>
  );
}