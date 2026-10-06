import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { relationsFor } from "@/lib/social";

export async function GET(req: Request) {
  const me = await getUser();
  if (!me) return NextResponse.json([], { status: 401 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().replace(/^@/, "").toLowerCase();
  if (!q) return NextResponse.json([]);

  const [users, rels] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: me.id },
        OR: [{ name: { contains: q, mode: "insensitive" } }, { username: { contains: q } }],
      },
      select: { id: true, name: true, username: true },
      take: 20,
    }),
    relationsFor(me.id),
  ]);

  // best matches first: names or usernames that start with the query
  const rank = (u: { name: string; username: string | null }) =>
    u.username?.startsWith(q) ? 0 : u.name.toLowerCase().startsWith(q) ? 1 : 2;
  users.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

  return NextResponse.json(
    users.map((u) => {
      const r = rels.get(u.id);
      return { ...u, status: r?.status ?? "none", friendshipId: r?.id };
    }),
    { headers: { "Cache-Control": "no-store" } }
  );
}