import { prisma } from "./prisma";

export type Rel = { status: "none" | "sent" | "received" | "friends"; id?: string };

export async function relationsFor(me: string): Promise<Map<string, Rel>> {
    const rows = await prisma.friendship.findMany({
        where: { OR: [{ requesterId: me }, { addresseeId: me }] },
    });
    const map = new Map<string, Rel>();
    for (const r of rows) {
        const other = r.requesterId === me ? r.addresseeId : r.requesterId;
        map.set(other, {
            id: r.id,
            status: r.status === "ACCEPTED" ? "friends" : r.requesterId === me ? "sent" : "received",
        });
    }
    return map;
}

export async function getFriends(me: string) {
    const rows = await prisma.friendship.findMany({
        where: { status: "ACCEPTED", OR: [{ requesterId: me }, { addresseeId: me }] },
        include: {
            requester: { select: { id: true, name: true } },
            addressee: { select: { id: true, name: true } },
        },
    });
    return rows
        .map((r) => (r.requesterId === me ? r.addressee : r.requester))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export type ChatMsg = {
    id: string;
    mine: boolean;
    body: string;
    createdAt: string;
    movie: { id: number; title: string; poster: string | null; year: string | null } | null;
};

type MsgRow = {
    id: string;
    senderId: string;
    body: string;
    createdAt: Date;
    movieId: number | null;
    movieTitle: string | null;
    moviePoster: string | null;
    movieYear: string | null;
};

// `me` is whoever will be looking at the message (decides the "mine" flag)
export function toChatMsg(m: MsgRow, me: string): ChatMsg {
    return {
        id: m.id,
        mine: m.senderId === me,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        movie:
            m.movieId && m.movieTitle
                ? { id: m.movieId, title: m.movieTitle, poster: m.moviePoster, year: m.movieYear }
                : null,
    };
}

export async function loadThread(me: string, other: string): Promise<ChatMsg[]> {
    await prisma.message.updateMany({
        where: { senderId: other, receiverId: me, readAt: null },
        data: { readAt: new Date() },
    });
    const rows = await prisma.message.findMany({
        where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
        orderBy: { createdAt: "desc" },
        take: 200,
    });
    return rows.reverse().map((m) => toChatMsg(m, me));
}

export type FriendPick = {
    movieId: number;
    title: string;
    posterPath: string | null;
    year: string | null;
    friends: string[];
};

// movies your friends favorited that you haven't favorited, saved or put on your watchlist
export async function friendPicks(me: string): Promise<FriendPick[]> {
    const friends = await getFriends(me);
    if (friends.length === 0) return [];
    const ids = friends.map((f) => f.id);
    // movies friends favorited that I haven't favorited, saved or put on my watchlist; most-loved first
    return prisma.$queryRaw<FriendPick[]>`
    SELECT f."movieId" AS "movieId",
           MAX(f."title") AS "title",
           MAX(f."posterPath") AS "posterPath",
           MAX(f."year") AS "year",
           ARRAY_AGG(DISTINCT u."name") AS "friends"
    FROM "Favorite" f
    JOIN "User" u ON u."id" = f."userId"
    WHERE f."userId" = ANY(${ids}::text[])
      AND NOT EXISTS (SELECT 1 FROM "Favorite" x WHERE x."userId" = ${me} AND x."movieId" = f."movieId")
      AND NOT EXISTS (SELECT 1 FROM "SavedMovie" x WHERE x."userId" = ${me} AND x."movieId" = f."movieId")
      AND NOT EXISTS (SELECT 1 FROM "Watchlist" x WHERE x."userId" = ${me} AND x."movieId" = f."movieId")
    GROUP BY f."movieId"
    ORDER BY COUNT(*) DESC, MAX(f."createdAt") DESC
    LIMIT 20`;
}