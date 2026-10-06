import Link from "next/link";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { discoverMovies, yearOf } from "@/lib/tmdb";
import { GENRES } from "@/lib/genres";
import FilterToggle from "@/components/FilterToggle";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import DiscoverToggle from "@/components/DiscoverToggle";
import FriendSearch from "@/components/FriendSearch";
import SearchBox from "@/components/SearchBox";

const SORTS = [
    { v: "popularity.desc", l: "Most popular" },
    { v: "vote_average.desc", l: "Top rated" },
    { v: "primary_release_date.desc", l: "Newest first" },
    { v: "primary_release_date.asc", l: "Oldest first" },
    { v: "original_title.asc", l: "Title A–Z" },
];
const LANGS: [string, string][] = [
    ["", "Any language"], ["en", "English"], ["ru", "Russian"], ["uz", "Uzbek"], ["tr", "Turkish"],
    ["ko", "Korean"], ["ja", "Japanese"], ["hi", "Hindi"], ["fr", "French"], ["es", "Spanish"],
    ["de", "German"], ["it", "Italian"], ["zh", "Chinese"],
];
const RATINGS = [0, 5, 6, 7, 8, 9];

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function num(v: string, min: number, max: number) {
    const n = Number(v);
    return v && Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : undefined;
}

export default async function Discover({ searchParams }: { searchParams: Promise<SP> }) {
    const sp = await searchParams;

    if (one(sp.mode) === "people") {
        if (!(await getUser())) redirect("/login");
        return (
            <div>
                <h1 className="text-3xl font-extrabold">Discover</h1>
                <p className="mt-1 text-sm text-zinc-500">Find people by name or @username and add them as friends.</p>
                <DiscoverToggle people />
                <div className="mt-6 max-w-2xl">
                    <FriendSearch />
                </div>
            </div>
        );
    }
    const thisYear = new Date().getFullYear();

    const genreIds = (Array.isArray(sp.genre) ? sp.genre : sp.genre ? [sp.genre] : [])
        .map(Number)
        .filter((n) => GENRES.some((g) => g.id === n));
    const from = num(one(sp.from), 1888, thisYear + 2);
    const to = num(one(sp.to), 1888, thisYear + 2);
    const rating = num(one(sp.rating), 0, 10) ?? 0;
    const sort = SORTS.some((s) => s.v === one(sp.sort)) ? one(sp.sort) : "popularity.desc";
    const lang = LANGS.some(([c]) => c && c === one(sp.lang)) ? one(sp.lang) : "";
    const page = Math.min(500, Math.max(1, Number(one(sp.page)) || 1));
    const activeCount =
        genreIds.length + (from ? 1 : 0) + (to ? 1 : 0) + (rating ? 1 : 0) + (lang ? 1 : 0) + (sort !== "popularity.desc" ? 1 : 0);

    const data = await discoverMovies({
        genres: genreIds,
        yearFrom: from,
        yearTo: to,
        minRating: rating || undefined,
        sort,
        lang: lang || undefined,
        page,
    });

    // pagination links keep every filter
    const link = (p: number) => {
        const q = new URLSearchParams();
        genreIds.forEach((g) => q.append("genre", String(g)));
        if (from) q.set("from", String(from));
        if (to) q.set("to", String(to));
        if (rating) q.set("rating", String(rating));
        q.set("sort", sort);
        if (lang) q.set("lang", lang);
        q.set("page", String(p));
        return `/discover?${q}`;
    };

    const label = "mb-1 block text-xs text-zinc-500";

    return (
        <div>
            <h1 className="text-3xl font-extrabold">Discover</h1>
            <p className="mt-1 text-sm text-zinc-500">Filter movies by genre, year, rating and more.</p>
            <DiscoverToggle people={false} />
            <div className="relative z-30 mt-5 max-w-2xl">
                <SearchBox large />
            </div>

            <FilterToggle activeCount={activeCount}>
                <form action="/discover" className="mt-6 rounded-2xl border border-line bg-panel p-5">
                    <p className="mb-3 text-sm font-semibold text-zinc-300">Genres</p>
                    <div className="flex flex-wrap gap-2">
                        {GENRES.map((g) => (
                            <label key={g.id} className="cursor-pointer">
                                <input type="checkbox" name="genre" value={g.id} defaultChecked={genreIds.includes(g.id)} className="peer sr-only" />
                                <span className="inline-block rounded-full border border-line px-3 py-1 text-sm text-zinc-300 transition hover:border-accent peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent">
                                    {g.name}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <label>
                            <span className={label}>Year from</span>
                            <input name="from" type="number" min={1888} max={thisYear + 2} defaultValue={from ?? ""} placeholder="e.g. 1990" className="input" />
                        </label>
                        <label>
                            <span className={label}>Year to</span>
                            <input name="to" type="number" min={1888} max={thisYear + 2} defaultValue={to ?? ""} placeholder={String(thisYear)} className="input" />
                        </label>
                        <label>
                            <span className={label}>Minimum rating</span>
                            <select name="rating" defaultValue={String(rating)} className="input">
                                {RATINGS.map((r) => (
                                    <option key={r} value={r}>{r === 0 ? "Any rating" : `${r}+ ★`}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={label}>Sort by</span>
                            <select name="sort" defaultValue={sort} className="input">
                                {SORTS.map((s) => (
                                    <option key={s.v} value={s.v}>{s.l}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={label}>Original language</span>
                            <select name="lang" defaultValue={lang} className="input">
                                {LANGS.map(([c, n]) => (
                                    <option key={c} value={c}>{n}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button className="btn-primary">
                            <SlidersHorizontal size={16} /> Apply filters
                        </button>
                        <Link href="/discover" className="btn">
                            <RotateCcw size={16} /> Reset
                        </Link>
                    </div>
                </form>
            </FilterToggle>


            <h2 className="mb-5 mt-10 text-lg font-bold">
                {data.total_results.toLocaleString("en-US")} <span className="font-normal text-zinc-500">movies</span>
            </h2>

            {data.results.length === 0 ? (
                <p className="text-zinc-500">No movies match these filters. Try removing a genre or widening the years.</p>
            ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {data.results.map((m) => (
                        <MovieCard
                            key={m.id}
                            m={{ id: m.id, title: m.title, poster_path: m.poster_path, year: yearOf(m.release_date), vote: m.vote_average, overview: m.overview }}
                        />
                    ))}
                </div>
            )}

            <div className="mt-10 flex items-center justify-center gap-4 text-sm">
                {page > 1 && <Link className="btn" href={link(page - 1)}>← Previous</Link>}
                <span className="text-zinc-500">Page {page} of {Math.max(1, Math.min(data.total_pages, 500))}</span>
                {page < data.total_pages && <Link className="btn" href={link(page + 1)}>Next →</Link>}
            </div>
        </div>
    );
}