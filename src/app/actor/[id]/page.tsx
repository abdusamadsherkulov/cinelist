import { notFound } from "next/navigation";
import { Cake, Clapperboard, MapPin } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { img, personDetail, yearOf, type Person } from "@/lib/tmdb";
import { ageOf, fmtDate } from "@/lib/format";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FavoriteActorButton from "@/components/FavoriteActorButton";

export default async function ActorPage({ params }: { params: Promise<{ id: string }> }) {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) notFound();
    let p: Person;
    try {
        p = await personDetail(id);
    } catch {
        notFound();
    }

    const user = await getUser();
    const fav = user
        ? await prisma.favoriteActor.findUnique({ where: { userId_personId: { userId: user.id, personId: id } } })
        : null;

    // unique movies with a poster, most popular first
    const seen = new Set<number>();
    const movies = p.movie_credits.cast
        .filter((m) => m.poster_path && !seen.has(m.id) && seen.add(m.id))
        .sort((a, b) => b.popularity - a.popularity);

    const photo = img(p.profile_path, "w500");

    return (
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
            <aside className="thin-scroll text-justify md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:self-start md:overflow-y-auto md:overscroll-contain md:pr-2">
                <div className="mx-auto w-56 md:w-full">
                    {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt={p.name} className="w-full rounded-2xl border border-line shadow-2xl" />
                    ) : (
                        <div className="aspect-[2/3] rounded-2xl border border-line bg-panel" />
                    )}
                </div>

                <h1 className="mt-5 text-3xl font-extrabold">{p.name}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                    <Clapperboard size={14} className="text-accent" /> {p.known_for_department}
                </p>

                <div className="mt-4">
                    <FavoriteActorButton
                        snap={{ personId: id, name: p.name, profilePath: p.profile_path, department: p.known_for_department }}
                        signedIn={!!user}
                        isFav={!!fav}
                    />
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-400">
                    {p.birthday && (
                        <p className="flex items-start gap-2">
                            <Cake size={15} className="mt-0.5 shrink-0 text-accent" />
                            <span>
                                {fmtDate(p.birthday)}
                                {!p.deathday && ` (age ${ageOf(p.birthday)})`}
                                {p.deathday && (
                                    <span className="block text-zinc-500">
                                        Died {fmtDate(p.deathday)} (age {ageOf(p.birthday, p.deathday)})
                                    </span>
                                )}
                            </span>
                        </p>
                    )}
                    {p.place_of_birth && (
                        <p className="flex items-start gap-2">
                            <MapPin size={15} className="mt-0.5 shrink-0 text-accent" /> {p.place_of_birth}
                        </p>
                    )}
                </div>

                {p.biography && (
                    <details className="mt-5 text-sm text-zinc-400">
                        <summary className="cursor-pointer font-semibold text-zinc-200">Biography</summary>
                        <p className="mt-2 whitespace-pre-line leading-relaxed">{p.biography}</p>
                    </details>
                )}
            </aside>

            <section>
                <h2 className="text-2xl font-bold">
                    Movies <span className="text-zinc-500">({movies.length})</span>
                </h2>
                {movies.length === 0 ? (
                    <p className="mt-6 text-zinc-500">No movies found for this person.</p>
                ) : (
                    <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {movies.map((m) => (
                            <MovieCard
                                key={m.id}
                                m={{
                                    id: m.id,
                                    title: m.title,
                                    poster_path: m.poster_path,
                                    year: yearOf(m.release_date),
                                    vote: m.vote_average,
                                    overview: m.overview,
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}