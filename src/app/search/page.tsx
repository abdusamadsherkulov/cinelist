import Link from "next/link";
import { User } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import SearchBox from "@/components/SearchBox";
import { img, searchMovies, searchPeople, yearOf, type PersonResult } from "@/lib/tmdb";

function PersonCard({ p }: { p: PersonResult }) {
  const src = img(p.profile_path, "w342");
  const known = (p.known_for ?? [])
    .map((k) => k.title ?? k.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
  return (
    <Link href={`/actor/${p.id}`} className="group/card block">
      <div className="aspect-[2/3] overflow-hidden rounded-xl border border-line bg-panel transition-all duration-300 group-hover/card:border-accent group-hover/card:shadow-[0_12px_32px_-8px_rgba(255,183,3,0.45)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover/card:scale-110" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <User size={40} />
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium transition group-hover/card:text-accent">{p.name}</p>
      <p className="truncate text-xs text-zinc-500">{known || p.known_for_department}</p>
    </Link>
  );
}

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}) {
  const { q = "", page = "1", type } = await searchParams;
  const term = q.trim();
  const p = Math.max(1, Number(page) || 1);
  const wantPeople = type === "person";

  const [movies, actors] = term
    ? await Promise.all([searchMovies(term, wantPeople ? 1 : p), searchPeople(term, wantPeople ? p : 1)])
    : [null, null];

  // no explicit tab: open Actors if there are no movies but there are actors
  const showPeople = type ? wantPeople : !!movies && !!actors && movies.total_results === 0 && actors.total_results > 0;
  const active = showPeople ? actors : movies;
  const url = (t: string, pg = 1) => `/search?q=${encodeURIComponent(term)}&type=${t}&page=${pg}`;
  const tab = (on: boolean) => `btn ${on ? "!border-accent !text-accent" : ""}`;

  return (
    <div>
      <div className="relative z-30 mx-auto mb-8 max-w-2xl">
        <SearchBox large />
      </div>

      {!term || !movies || !actors || !active ? (
        <p className="text-center text-zinc-500">
          Search for a movie or an actor above, or{" "}
          <Link href="/discover" className="text-accent hover:underline">browse with filters</Link>.
        </p>
      ) : (
        <>
          <h1 className="mb-5 text-2xl font-bold">Results for “{term}”</h1>
          <div className="mb-8 flex gap-3">
            <Link href={url("movie")} className={tab(!showPeople)}>Movies ({movies.total_results})</Link>
            <Link href={url("person")} className={tab(showPeople)}>Actors ({actors.total_results})</Link>
          </div>

          {active.results.length === 0 ? (
            <p className="text-zinc-500">Nothing found in this tab.</p>
          ) : showPeople ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {actors.results.map((a) => <PersonCard key={a.id} p={a} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {movies.results.map((m) => (
                <MovieCard
                  key={m.id}
                  m={{ id: m.id, title: m.title, poster_path: m.poster_path, year: yearOf(m.release_date), vote: m.vote_average, overview: m.overview }}
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-4 text-sm">
            {p > 1 && <Link className="btn" href={url(showPeople ? "person" : "movie", p - 1)}>← Previous</Link>}
            <span className="text-zinc-500">Page {p} of {Math.max(1, Math.min(active.total_pages, 500))}</span>
            {p < active.total_pages && <Link className="btn" href={url(showPeople ? "person" : "movie", p + 1)}>Next →</Link>}
          </div>
        </>
      )}
    </div>
  );
}