import MovieCard from "./MovieCard";
import Scroller from "./Scroller";
import { yearOf, type Movie } from "@/lib/tmdb";

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <Scroller>
        {movies.map((m) => (
          <div key={m.id} className="w-36 shrink-0 sm:w-44">
            <MovieCard
              m={{
                id: m.id,
                title: m.title,
                poster_path: m.poster_path,
                year: yearOf(m.release_date),
                vote: m.vote_average,
                overview: m.overview,
              }}
            />
          </div>
        ))}
      </Scroller>
    </section>
  );
}