import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { img, movieDetail, yearOf, type MovieDetail } from "@/lib/tmdb";
import RatingStars from "@/components/RatingStars";
import MovieActions from "@/components/MovieActions";
import Comments from "@/components/Comments";
import NoteBox from "@/components/NoteBox";
import TrailerButton from "@/components/TrailerButton";
import PosterZoom from "@/components/PosterZoom";
import CastList from "@/components/CastList";
import { getFriends } from "@/lib/social";
import Link from "next/link";

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const movieId = Number((await params).id);
  if (!Number.isInteger(movieId)) notFound();
  let m: MovieDetail;
  try {
    m = await movieDetail(movieId);
  } catch {
    notFound();
  }

  const user = await getUser();
  const uid = user?.id;
  const friends = uid ? await getFriends(uid) : [];
  const [agg, comments, rating, fav, watch, saved, note, folders] = await Promise.all([
    prisma.rating.aggregate({ where: { movieId }, _avg: { value: true }, _count: true }),
    prisma.comment.findMany({ where: { movieId }, orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { name: true, username: true } } } }),
    uid ? prisma.rating.findUnique({ where: { userId_movieId: { userId: uid, movieId } } }) : null,
    uid ? prisma.favorite.findUnique({ where: { userId_movieId: { userId: uid, movieId } } }) : null,
    uid ? prisma.watchlist.findUnique({ where: { userId_movieId: { userId: uid, movieId } } }) : null,
    uid ? prisma.savedMovie.findUnique({ where: { userId_movieId: { userId: uid, movieId } } }) : null,
    uid ? prisma.note.findUnique({ where: { userId_movieId: { userId: uid, movieId } } }) : null,
    uid ? prisma.folder.findMany({ where: { userId: uid }, orderBy: { name: "asc" }, select: { id: true, name: true } }) : [],
  ]);

  const snap = { movieId, title: m.title, posterPath: m.poster_path, year: yearOf(m.release_date) };
  const trailer = m.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer");
  const poster = img(m.poster_path, "w500");
  const backdrop = img(m.backdrop_path, "w1280");
  const community = agg._avg.value;

  return (
    <div className="-mt-6">
      <div className="relative -mx-4 h-64 overflow-hidden sm:-mx-6 sm:h-80">
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" className="h-full w-full object-cover object-[50%_20%] opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative z-10 -mt-32 grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="relative mx-auto w-52 md:w-full">
          {poster ? (
            <PosterZoom small={poster} large={img(m.poster_path, "w780")!} title={m.title} />
          ) : (
            <div className="aspect-[2/3] rounded-2xl border border-line bg-panel" />
          )}
        </div>

        <div className="pt-4 md:pt-1">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            {m.title} <span className="font-normal text-zinc-500">{yearOf(m.release_date) && `(${yearOf(m.release_date)})`}</span>
          </h1>
          {m.tagline && <p className="mt-1 italic text-zinc-400">{m.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {m.genres.map((g) => (
              <Link
                key={g.id}
                href={`/discover?genre=${g.id}`}
                className="rounded-full border border-line px-3 py-0.5 text-zinc-300 transition hover:border-accent hover:text-accent"
              >
                {g.name}
              </Link>
            ))}
            {m.runtime ? <span className="text-zinc-500">{Math.floor(m.runtime / 60)}h {m.runtime % 60}m</span> : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-6 text-sm">
            <div><p className="text-zinc-500">TMDB</p><p className="text-2xl font-bold text-accent">★ {m.vote_average.toFixed(1)}</p></div>
            <div>
              <p className="text-zinc-500">CineList users</p>
              <p className="text-2xl font-bold">{community ? `★ ${community.toFixed(1)}` : "—"} <span className="text-sm font-normal text-zinc-500">({agg._count})</span></p>
            </div>
          </div>

          <p className="mt-5 max-w-3xl leading-relaxed text-zinc-300">{m.overview}</p>

          <div className="mt-6">
            <MovieActions snap={snap} signedIn={!!user} isFav={!!fav} inWatchlist={!!watch} saved={!!saved} folderId={saved?.folderId ?? null} folders={folders} friends={friends} />
          </div>

          {user && (
            <div className="mt-6">
              <p className="mb-1 text-sm font-semibold">Your rating</p>
              <RatingStars snap={snap} value={rating?.value ?? 0} />
            </div>
          )}

          {trailer && (
            <div className="mt-6">
              <TrailerButton videoKey={trailer.key} title={m.title} />
            </div>
          )}

          {m.credits.cast.length > 0 && (
            <CastList
              cast={m.credits.cast.slice(0, 10).map((c) => ({ id: c.id, name: c.name, character: c.character }))}
            />
          )}
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_380px]">
        <Comments
          movieId={movieId}
          signedIn={!!user}
          comments={comments.map((c) => ({
            id: c.id,
            body: c.body,
            author: c.user.name,
            authorHref: `/u/${c.user.username ?? c.userId}`,
            mine: c.userId === uid,
            date: c.createdAt.toISOString().slice(0, 10),
          }))}
        />
        {user && <NoteBox movieId={movieId} initial={note?.body ?? ""} />}
      </div>
    </div>
  );
}
