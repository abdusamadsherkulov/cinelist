import Link from "next/link";
import { User } from "lucide-react";
import { img } from "@/lib/tmdb";

export type CardActor = { id: number; name: string; profile_path: string | null; sub?: string | null };

export default function ActorCard({ a }: { a: CardActor }) {
  const src = img(a.profile_path, "w342");
  return (
    <Link href={`/actor/${a.id}`} className="group/card block">
      <div className="aspect-[2/3] overflow-hidden rounded-xl border border-line bg-panel transition-all duration-300 group-hover/card:border-accent group-hover/card:shadow-[0_12px_32px_-8px_rgba(255,183,3,0.45)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={a.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover/card:scale-110" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <User size={40} />
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium transition group-hover/card:text-accent">{a.name}</p>
      {a.sub && <p className="truncate text-xs text-zinc-500">{a.sub}</p>}
    </Link>
  );
}