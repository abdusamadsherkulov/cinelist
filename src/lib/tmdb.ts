const BASE = "https://api.themoviedb.org/3";

export const img = (p: string | null | undefined, size = "w500") =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : null;
export const yearOf = (d?: string | null) => (d ? d.slice(0, 4) : null);

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY ?? "");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  overview: string;
};
type Page = { results: Movie[]; total_pages: number; total_results: number };

export const trending = () => get<Page>("/trending/movie/week").then((d) => d.results);
export const topRated = () => get<Page>("/movie/top_rated").then((d) => d.results);
export const popular = () => get<Page>("/movie/popular").then((d) => d.results);
export const searchMovies = (query: string, page = 1) => get<Page>("/search/movie", { query, page });

export type MovieDetail = Movie & {
  runtime: number | null;
  tagline: string;
  genres: { id: number; name: string }[];
  credits: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  videos: { results: { key: string; site: string; type: string }[] };
};
export const movieDetail = (id: number) =>
  get<MovieDetail>(`/movie/${id}`, { append_to_response: "credits,videos" });

export type PersonBasic = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
};
export type Person = PersonBasic & {
  movie_credits: { cast: (Movie & { character: string; popularity: number })[] };
};

export const personBasic = (id: number) => get<PersonBasic>(`/person/${id}`);
export const personDetail = (id: number) => get<Person>(`/person/${id}`, { append_to_response: "movie_credits" });

export type PersonResult = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for?: { title?: string; name?: string }[];
};

type MultiItem =
  | ({ media_type: "movie" } & Movie)
  | ({ media_type: "person" } & PersonResult)
  | { media_type: "tv" };

export const searchMulti = (query: string) =>
  get<{ results: MultiItem[] }>("/search/multi", { query, include_adult: "false" });

export const searchPeople = (query: string, page = 1) =>
  get<{ results: PersonResult[]; total_pages: number; total_results: number }>("/search/person", {
    query,
    page,
    include_adult: "false",
  });

export type DiscoverParams = {
  genres?: number[];
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  sort?: string;
  lang?: string;
  page?: number;
};

export const discoverMovies = (p: DiscoverParams) => {
  const sort = p.sort ?? "popularity.desc";
  const params: Record<string, string | number> = {
    sort_by: sort,
    page: p.page ?? 1,
    include_adult: "false",
    // when sorting by rating, ignore movies with only a handful of votes
    "vote_count.gte": sort.startsWith("vote_average") ? 300 : 20,
  };
  if (p.genres?.length) params.with_genres = p.genres.join(","); // comma = must match all picked genres
  if (p.yearFrom) params["primary_release_date.gte"] = `${p.yearFrom}-01-01`;
  if (p.yearTo) params["primary_release_date.lte"] = `${p.yearTo}-12-31`;
  else if (sort.startsWith("primary_release_date")) params["primary_release_date.lte"] = new Date().toISOString().slice(0, 10); // no unreleased movies on top
  if (p.minRating) params["vote_average.gte"] = p.minRating;
  if (p.lang) params.with_original_language = p.lang;
  return get<Page>("/discover/movie", params);
};