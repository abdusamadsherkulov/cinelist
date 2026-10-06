import { Users } from "lucide-react";
import MovieCard from "./MovieCard";
import Scroller from "./Scroller";
import type { FriendPick } from "@/lib/social";

export default function FriendPicks({ picks }: { picks: FriendPick[] }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <Users size={20} className="text-accent" /> Recommended by friends
      </h2>
      <Scroller>
        {picks.map((p) => (
          <div key={p.movieId} className="w-36 shrink-0 sm:w-44">
            <MovieCard m={{ id: p.movieId, title: p.title, poster_path: p.posterPath, year: p.year }} />
            <p className="mt-0.5 truncate text-xs text-accent">
              ♥ {p.friends[0]}
              {p.friends.length > 1 && ` +${p.friends.length - 1}`}
            </p>
          </div>
        ))}
      </Scroller>
    </section>
  );
}