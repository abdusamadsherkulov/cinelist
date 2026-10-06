import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";

const TEXT: Record<string, string> = {
    friend_request: "sent you a friend request",
    friend_accepted: "accepted your friend request",
};

export default async function Notifications() {
    const me = await getUser();
    if (!me) redirect("/login");

    const items = await prisma.notification.findMany({
        where: { userId: me.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { actor: { select: { id: true, name: true, username: true } } },
    });
    // opening the page marks everything read (items above still hold the old state for highlighting)
    await prisma.notification.updateMany({ where: { userId: me.id, readAt: null }, data: { readAt: new Date() } });

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-extrabold">Notifications</h1>
            {items.length === 0 ? (
                <p className="mt-6 text-zinc-500">Nothing yet.</p>
            ) : (
                <ul className="mt-6 space-y-2">
                    {items.map((n) => (
                        <li key={n.id}>
                            <Link
                                href={n.type === "friend_request" ? `/u/${me.username ?? me.id}?friends=requests` : `/u/${n.actor.username ?? n.actor.id}`}
                                className={`flex items-center gap-3 rounded-xl border bg-panel p-3 transition hover:border-accent ${n.readAt ? "border-line" : "border-accent/60"
                                    }`}
                            >
                                <Avatar name={n.actor.name} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm">
                                        <b>{n.actor.name}</b> {TEXT[n.type] ?? "did something"}
                                    </p>
                                    <p className="text-xs text-zinc-500">{n.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                </div>
                                {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}