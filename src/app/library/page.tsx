import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Folder, Heart, Lock, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import MovieCard from "@/components/MovieCard";
import FolderCreate from "@/components/FolderCreate";
import { DeleteFolder, SavedControls } from "@/components/SavedControls";
import { FolderToggle, SavedMasterToggle } from "@/components/VisibilityControls";
import ActorCard from "@/components/ActorCard";

export default async function Library({ searchParams }: { searchParams: Promise<{ tab?: string; folder?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const { tab = "saved", folder } = await searchParams;

  const [favs, watch, saved, folders] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.watchlist.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.savedMovie.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.folder.findMany({ where: { userId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true, isPublic: true } }),
  ]);

  const actors = await prisma.favoriteActor.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const owner = await prisma.user.findUnique({ where: { id: user.id }, select: { savedVisible: true } });
  const savedVisible = owner?.savedVisible ?? true;
  const shown = saved.filter((s) => (!folder ? true : folder === "none" ? s.folderId === null : s.folderId === folder));
  const current = folders.find((f) => f.id === folder);
  const card = (x: { movieId: number; title: string; posterPath: string | null; year: string | null }) => ({
    id: x.movieId, title: x.title, poster_path: x.posterPath, year: x.year,
  });
  const grid = "grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5";
  const side = (active: boolean) =>
    `flex justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 ${active ? "bg-white/10 text-accent" : ""}`;
  const tabCls = (on: boolean) => `btn ${on ? "!border-accent !text-accent" : ""}`;

  return (
    <div>
      <h1 className="text-3xl font-extrabold">My Library</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/library?tab=watchlist" className={tabCls(tab === "watchlist")}>
          <Bookmark size={16} /> Watchlist ({watch.length})
        </Link>
        <Link href="/library?tab=favorites" className={tabCls(tab === "favorites")}>
          <Heart size={16} /> Favorites ({favs.length})
        </Link>
        <Link href="/library?tab=saved" className={tabCls(tab === "saved")}>
          <Folder size={16} /> Saved ({saved.length})
        </Link>
        <Link href="/library?tab=actors" className={tabCls(tab === "actors")}>
          <Star size={16} /> Actors ({actors.length})
        </Link>
      </div>

      {tab === "actors" ? (
        actors.length === 0 ? (
          <p className="mt-10 text-zinc-500">No favorite actors yet — tap the heart on any actor page.</p>
        ) : (
          <div className={`mt-8 ${grid}`}>
            {actors.map((a) => (
              <ActorCard key={a.id} a={{ id: a.personId, name: a.name, profile_path: a.profilePath, sub: a.department }} />
            ))}
          </div>
        )
      ) : tab === "watchlist" ? (
        watch.length === 0 ? (
          <p className="mt-10 text-zinc-500">Your watchlist is empty — tap the bookmark on any movie page.</p>
        ) : (
          <div className={`mt-8 ${grid}`}>{watch.map((w) => <MovieCard key={w.id} m={card(w)} />)}</div>
        )
      ) : tab === "favorites" ? (
        favs.length === 0 ? (
          <p className="mt-10 text-zinc-500">No favorites yet — tap the heart on any movie page.</p>
        ) : (
          <div className={`mt-8 ${grid}`}>{favs.map((f) => <MovieCard key={f.id} m={card(f)} />)}</div>
        )
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[230px_1fr]">
          <aside>
            <SavedMasterToggle visible={savedVisible} />
            <Link href="/library?tab=saved" className={side(!folder)}><span>All saved</span><span className="text-zinc-500">{saved.length}</span></Link>
            <Link href="/library?tab=saved&folder=none" className={side(folder === "none")}>
              <span>Unsorted</span><span className="text-zinc-500">{saved.filter((s) => !s.folderId).length}</span>
            </Link>
            {folders.map((f) => (
              <Link key={f.id} href={`/library?tab=saved&folder=${f.id}`} className={side(folder === f.id)}>
                <span className="flex min-w-0 items-center gap-1.5 truncate">
                  📁 {f.name} {!f.isPublic && <Lock size={12} className="shrink-0 text-zinc-500" />}
                </span>
                <span className="text-zinc-500">{saved.filter((s) => s.folderId === f.id).length}</span>
              </Link>
            ))}
            <FolderCreate />
            {current && (
              <div className="mt-4 space-y-3">
                <FolderToggle id={current.id} isPublic={current.isPublic} masterVisible={savedVisible} />
                <DeleteFolder id={current.id} />
              </div>
            )}
          </aside>
          <div>
            {shown.length === 0 ? (
              <p className="text-zinc-500">Nothing here yet. Open a movie and use the folder button to save it.</p>
            ) : (
              <div className={grid}>
                {shown.map((s) => (
                  <div key={s.id}>
                    <MovieCard m={card(s)} />
                    <SavedControls snap={{ movieId: s.movieId, title: s.title, posterPath: s.posterPath, year: s.year }} folderId={s.folderId} folders={folders} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}