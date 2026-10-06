import { NextResponse } from "next/server";
import { searchMulti, yearOf } from "@/lib/tmdb";

type MovieHit = { kind: "movie"; id: number; title: string; year: string | null; poster: string | null; vote: number };
type PersonHit = { kind: "person"; id: number; name: string; photo: string | null; dept: string };

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const { results } = await searchMulti(q);
    const movies: MovieHit[] = [];
    const people: PersonHit[] = [];
    for (const r of results) {
      if (r.media_type === "movie" && movies.length < 5) {
        movies.push({ kind: "movie", id: r.id, title: r.title, year: yearOf(r.release_date), poster: r.poster_path, vote: r.vote_average });
      } else if (r.media_type === "person" && people.length < 3) {
        people.push({ kind: "person", id: r.id, name: r.name, photo: r.profile_path, dept: r.known_for_department });
      }
    }
    // whichever kind TMDB ranks first goes on top
    const first = results.find((r) => r.media_type === "movie" || r.media_type === "person")?.media_type;
    return NextResponse.json(first === "person" ? [...people, ...movies] : [...movies, ...people]);
  } catch {
    return NextResponse.json([]);
  }
}