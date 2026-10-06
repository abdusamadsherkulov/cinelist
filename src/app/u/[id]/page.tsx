import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Bookmark, Folder, Heart, Lock, Star, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { relationsFor } from "@/lib/social";
import Avatar from "@/components/Avatar";
import FriendButton from "@/components/FriendButton";
import MovieCard from "@/components/MovieCard";
import ActorCard from "@/components/ActorCard";
import { movieDetail, yearOf } from "@/lib/tmdb";
import LogoutButton from "@/components/LogoutButton";
import FriendsModal from "@/components/FriendsModal";
import LiveRefresh from "@/components/LiveRefresh";

type Row = { id: string; movieId: number; title: string; posterPath: string | null; year: string | null };

export default async function Profile({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string; friends?: string }>;
}) {
    const me = await getUser();
    if (!me) redirect("/login");
    const slug = (await params).id;
    const { tab = "saved", friends: friendsParam } = await searchParams;

    const user = await prisma.user.findFirst({
        where: { OR: [{ username: slug.toLowerCase() }, { id: slug }] },
        select: { id: true, name: true, username: true, createdAt: true, savedVisible: true },
    });
    if (!user) notFound();

    const isMe = user.id === me.id;
    const rel = isMe ? null : ((await relationsFor(me.id)).get(user.id) ?? { status: "none" as const });
    const canSee = isMe || rel?.status === "friends";
    const savedHidden = !isMe && !user.savedVisible;
    const friendCount = await prisma.friendship.count({
        where: { status: "ACCEPTED", OR: [{ requesterId: user.id }, { addresseeId: user.id }] },
    });

    const myRels = isMe ? await relationsFor(me.id) : null;
    const relUsers =
        myRels && myRels.size
            ? await prisma.user.findMany({
                where: { id: { in: [...myRels.keys()] } },
                select: { id: true, name: true, username: true },
            })
            : [];
    const pick = (s: "friends" | "received" | "sent") =>
        relUsers
            .filter((u) => myRels!.get(u.id)?.status === s)
            .map((u) => ({ ...u, friendshipId: myRels!.get(u.id)?.id }))
            .sort((a, b) => a.name.localeCompare(b.name));

    const [watch, favs, saved]: [Row[], Row[], Row[]] = canSee
        ? await Promise.all([
            prisma.watchlist.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
            prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
            savedHidden
                ? []
                : prisma.savedMovie.findMany({
                    where: {
                        userId: user.id,
                        // friends only see unsorted movies and movies in public folders
                        ...(isMe ? {} : { OR: [{ folderId: null }, { folder: { isPublic: true } }] }),
                    },
                    orderBy: { createdAt: "desc" },
                }),
        ])
        : [[], [], []];

    const actors = canSee
        ? await prisma.favoriteActor.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
        : [];

    const active = tab === "watchlist" || tab === "favorites" || tab === "actors" || tab === "ratings" ? tab : "saved";
    const ratingCount = canSee ? await prisma.rating.count({ where: { userId: user.id } }) : 0;
    const ratings =
        canSee && active === "ratings"
            ? (
                await Promise.all(
                    (
                        await prisma.rating.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60 })
                    ).map(async (r) => {
                        if (r.title) return { ...r, title: r.title };
                        try {
                            const d = await movieDetail(r.movieId);
                            const snap = { title: d.title, posterPath: d.poster_path, year: yearOf(d.release_date) };
                            await prisma.rating.update({ where: { id: r.id }, data: snap }); // saved: no TMDB call next time
                            return { ...r, ...snap };
                        } catch {
                            return null;
                        }
                    })
                )
            ).filter((x): x is NonNullable<typeof x> => !!x)
            : [];
    const list = active === "watchlist" ? watch : active === "favorites" ? favs : saved;
    const base = `/u/${user.username ?? user.id}`;
    const card = (x: Row) => ({ id: x.movieId, title: x.title, poster_path: x.posterPath, year: x.year });
    const tabCls = (on: boolean) => `btn ${on ? "!border-accent !text-accent" : ""}`;

    return (
        <div>
            {isMe && <LiveRefresh events={["friends"]} />}
            <div className="relative flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-panel p-6">
                {isMe && <LogoutButton />}
                <Avatar name={user.name} size={84} />
                <div className={`min-w-0 flex-1 ${isMe ? "pr-8 md:pr-0" : ""}`}>
                    <h1 className="break-words text-xl font-extrabold sm:text-3xl">{user.name}</h1>
                    {user.username && <p className="text-sm text-accent">@{user.username}</p>}
                    <p className="mt-1 text-sm text-zinc-500">
                        Member since {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
                        <Users size={15} className="text-accent" />
                        {isMe ? (
                            <FriendsModal
                                friends={pick("friends")}
                                received={pick("received")}
                                sent={pick("sent")}
                                defaultOpen={!!friendsParam}
                                defaultTab={friendsParam === "requests" ? "requests" : "friends"}
                            />
                        ) : (
                            <span>
                                <b className="text-zinc-200">{friendCount}</b> {friendCount === 1 ? "friend" : "friends"}
                            </span>
                        )}
                    </div>
                    {canSee && (
                        <p className="mt-2 text-sm text-zinc-400">
                            {savedHidden ? "Saved movies are private" : `${saved.length} saved`} · {watch.length} on watchlist · {favs.length} favorites
                        </p>
                    )}
                </div>
                {isMe ? (
                    <Link href="/library" className="btn !hidden md:!inline-flex">Open my library</Link>
                ) : (
                    <FriendButton otherId={user.id} status={rel!.status} friendshipId={"id" in rel! ? rel!.id : undefined} showMessage />
                )}
            </div>

            {!canSee ? (
                <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center text-zinc-500">
                    <Lock size={28} />
                    <p>Become friends with {user.name} to see their watchlist, favorites and saved movies.</p>
                </div>
            ) : (
                <>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={`${base}?tab=saved`} className={tabCls(active === "saved")}>
                            <Folder size={16} /> Saved{savedHidden ? "" : ` (${saved.length})`}
                        </Link>
                        <Link href={`${base}?tab=watchlist`} className={tabCls(active === "watchlist")}>
                            <Bookmark size={16} /> Watchlist ({watch.length})
                        </Link>
                        <Link href={`${base}?tab=favorites`} className={tabCls(active === "favorites")}>
                            <Heart size={16} /> Favorites ({favs.length})
                        </Link>
                        <Link href={`${base}?tab=ratings`} className={tabCls(active === "ratings")}>
                            <Star size={16} /> Ratings ({ratingCount})
                        </Link>
                        <Link href={`${base}?tab=actors`} className={tabCls(active === "actors")}>
                            <Star size={16} /> Actors ({actors.length})
                        </Link>
                    </div>

                    {active === "ratings" ? (
                        ratings.length === 0 ? (
                            <p className="mt-10 text-zinc-500">No ratings yet.</p>
                        ) : (
                            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                                {ratings.map((r) => (
                                    <MovieCard key={r.id} m={{ id: r.movieId, title: r.title, poster_path: r.posterPath, year: r.year, vote: r.value }} />
                                ))}
                            </div>
                        )
                    ) : active === "actors" ? (
                        actors.length === 0 ? (
                            <p className="mt-10 text-zinc-500">No favorite actors yet.</p>
                        ) : (
                            <div className="mt-8 grid grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                                {actors.map((a) => (
                                    <ActorCard key={a.id} a={{ id: a.personId, name: a.name, profile_path: a.profilePath, sub: a.department }} />
                                ))}
                            </div>
                        )
                    ) : active === "saved" && savedHidden ? (
                        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center text-zinc-500">
                            <Lock size={28} />
                            <p>{user.name} keeps their saved movies private.</p>
                        </div>
                    ) : list.length === 0 ? (
                        <p className="mt-10 text-zinc-500">Nothing to show here.</p>
                    ) : (
                        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                            {list.map((x) => (
                                <MovieCard key={x.id} m={card(x)} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}