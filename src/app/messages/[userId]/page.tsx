import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { loadThread, relationsFor } from "@/lib/social";
import Avatar from "@/components/Avatar";
import Chat from "@/components/Chat";

export default async function Thread({ params }: { params: Promise<{ userId: string }> }) {
  const me = await getUser();
  if (!me) redirect("/login");
  const { userId } = await params;

  const other = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
  if (!other || other.id === me.id) notFound();

  const [initial, rels] = await Promise.all([loadThread(me.id, userId), relationsFor(me.id)]);
  const canSend = rels.get(userId)?.status === "friends";

  return (
    <>
      <header className="flex items-center gap-3 border-b border-line bg-panel/80 px-3 py-3 backdrop-blur md:px-5">
        <Link href="/messages" aria-label="Back to messages" className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-accent md:hidden">
          <ArrowLeft size={20} />
        </Link>
        <Link href={`/u/${other.id}`} className="flex min-w-0 items-center gap-3 hover:text-accent">
          <Avatar name={other.name} size={40} />
          <span className="truncate text-lg font-bold">{other.name}</span>
        </Link>
      </header>
      <Chat key={other.id} otherId={other.id} otherName={other.name} initial={initial} canSend={canSend} />
    </>
  );
}