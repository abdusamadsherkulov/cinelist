import Link from "next/link";
import MovieRow from "@/components/MovieRow";
import { img, popular, topRated, trending, yearOf } from "@/lib/tmdb";
import { getUser } from "@/lib/auth";
import { friendPicks } from "@/lib/social";
import FriendPicks from "@/components/FriendPicks";
import SearchBox from "@/components/SearchBox";
import { SlidersHorizontal } from "lucide-react";
import { GENRES } from "@/lib/genres";

export default async function Home() {
  const [hot, top, pop] = await Promise.all([trending(), topRated(), popular()]);
  const user = await getUser();
  const picks = user ? await friendPicks(user.id) : [];
  const hero = hot.find((m) => m.backdrop_path) ?? hot[0];
  const bg = img(hero?.backdrop_path, "w1280");
  return (
    <>
      <div className="relative z-30 mx-auto mb-4 hidden max-w-2xl items-center gap-3 md:flex">
        <div className="flex-1">
          <SearchBox large />
        </div>
        <Link href="/discover" className="btn !py-3.5">
          <SlidersHorizontal size={18} /> Filters
        </Link>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        <Link href="/discover" className="btn shrink-0 !py-1.5 md:hidden">
          <SlidersHorizontal size={14} /> Filters
        </Link>
        {GENRES.map((g) => (
          <Link
            key={g.id}
            href={`/discover?genre=${g.id}`}
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm text-zinc-300 transition hover:border-accent hover:text-accent"
          >
            {g.name}
          </Link>
        ))}
      </div>
      {hero && (
        <section className="relative overflow-hidden rounded-3xl">
          {bg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/30 to-transparent" />
          <div className="relative flex min-h-[420px] flex-col justify-end p-6 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Trending this week</p>
            <h1 className="mt-2 max-w-2xl text-4xl font-extrabold sm:text-6xl">{hero.title}</h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300 line-clamp-3">{hero.overview}</p>
            <div className="mt-5 flex items-center gap-3">
              <Link href={`/movie/${hero.id}`} className="btn-primary">View details</Link>
              <span className="text-sm text-zinc-300">★ {hero.vote_average.toFixed(1)} · {yearOf(hero.release_date)}</span>
            </div>
          </div>
        </section>
      )}
      {picks.length > 0 && <FriendPicks picks={picks} />}
      <MovieRow title="Trending" movies={hot} />
      <MovieRow title="Top rated of all time" movies={top} />
      <MovieRow title="Popular right now" movies={pop} />
    </>
  );
}
