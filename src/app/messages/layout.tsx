import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getFriends } from "@/lib/social";
import LiveRefresh from "@/components/LiveRefresh";
import MessagesShell from "@/components/MessagesShell";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const me = await getUser();
  if (!me) redirect("/login");

  type Last = { id: string; senderId: string; receiverId: string; body: string; movieTitle: string | null; createdAt: Date };
  const [lastRows, unreadRows, friends] = await Promise.all([
    prisma.$queryRaw<Last[]>`
      SELECT DISTINCT ON (LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"))
        "id", "senderId", "receiverId", "body", "movieTitle", "createdAt"
      FROM "Message"
      WHERE "senderId" = ${me.id} OR "receiverId" = ${me.id}
      ORDER BY LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"), "createdAt" DESC`,
    prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: me.id, readAt: null },
      _count: { _all: true },
    }),
    getFriends(me.id),
  ]);

  const otherOf = (m: Last) => (m.senderId === me.id ? m.receiverId : m.senderId);
  const people = await prisma.user.findMany({
    where: { id: { in: lastRows.map(otherOf) } },
    select: { id: true, name: true },
  });
  const nameOf = new Map(people.map((p) => [p.id, p.name]));
  const unreadOf = new Map(unreadRows.map((r) => [r.senderId, r._count._all]));

  const convs = [...lastRows]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map((m) => ({
      id: otherOf(m),
      name: nameOf.get(otherOf(m)) ?? "Unknown",
      unread: unreadOf.get(otherOf(m)) ?? 0,
      mine: m.senderId === me.id,
      preview: m.body || (m.movieTitle ? `🎬 ${m.movieTitle}` : ""),
      at: new Date(m.createdAt).toISOString(),
    }));
  const chatted = new Set(convs.map((c) => c.id));
  const fresh = friends.filter((f) => !chatted.has(f.id)).map((f) => ({ id: f.id, name: f.name }));

  return (
    <>
      <LiveRefresh events={["message"]} />
      <MessagesShell convs={convs} friends={fresh} hasFriends={friends.length > 0}>
        {children}
      </MessagesShell>
    </>
  );
}