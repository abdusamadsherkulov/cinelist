"use client";
import { useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Search } from "lucide-react";
import Avatar from "./Avatar";

type Conv = { id: string; name: string; unread: number; mine: boolean; preview: string; at: string };
type Friend = { id: string; name: string };

function when(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if ((+now - +d) / 864e5 < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesShell({
    convs,
    friends,
    hasFriends,
    children,
}: {
    convs: Conv[];
    friends: Friend[];
    hasFriends: boolean;
    children: React.ReactNode;
}) {
    const active = useSelectedLayoutSegment(); // the open chat's userId, or null
    const [q, setQ] = useState("");
    const match = (n: string) => n.toLowerCase().includes(q.trim().toLowerCase());
    const list = convs.filter((c) => match(c.name));
    const fresh = friends.filter((f) => match(f.name));

    return (
        <div className="flex min-h-0 flex-1 overflow-hidden bg-panel">
            {/* left: conversations */}
            <aside
                className={`${active ? "hidden" : "flex"} w-full shrink-0 flex-col border-r border-line md:flex md:w-80 lg:w-[22rem]`}
            >
                <div className="p-4 pb-2">
                    <h1 className="text-2xl font-extrabold">Messages</h1>
                    <div className="relative mt-3">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search friends"
                            className="w-full rounded-full border border-line bg-ink py-2 pl-9 pr-3 text-sm outline-none transition focus:border-accent"
                        />
                    </div>
                </div>

                <div className="thin-scroll flex-1 overflow-y-auto px-2 pb-2">
                    {list.map((c) => {
                        const on = active === c.id;
                        const unread = on ? 0 : c.unread;
                        return (
                            <Link
                                key={c.id}
                                href={`/messages/${c.id}`}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${on ? "bg-accent/10" : "hover:bg-white/5"}`}
                            >
                                <Avatar name={c.name} size={44} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className={`truncate font-medium ${on ? "text-accent" : ""}`}>{c.name}</p>
                                        <span suppressHydrationWarning className="shrink-0 text-[11px] text-zinc-500">
                                            {when(c.at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`truncate text-sm ${unread ? "font-medium text-zinc-200" : "text-zinc-500"}`}>
                                            {c.mine && "You: "}
                                            {c.preview}
                                        </p>
                                        {unread > 0 && (
                                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-black">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {fresh.length > 0 && (
                        <>
                            <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Start a chat</p>
                            {fresh.map((f) => (
                                <Link
                                    key={f.id}
                                    href={`/messages/${f.id}`}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${active === f.id ? "bg-accent/10 text-accent" : "hover:bg-white/5"}`}
                                >
                                    <Avatar name={f.name} size={36} />
                                    <span className="truncate font-medium">{f.name}</span>
                                </Link>
                            ))}
                        </>
                    )}

                    {list.length === 0 && fresh.length === 0 && (
                        <p className="px-3 pt-6 text-sm text-zinc-500">
                            {hasFriends ? "No matches." : (
                                <>
                                    No friends yet. Find some on <Link href="/discover?mode=people" className="text-accent">Discover</Link>.
                                </>
                            )}
                        </p>
                    )}
                </div>
            </aside>

            {/* right: the open chat */}
            <section className={`${active ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>{children}</section>
        </div>
    );
}