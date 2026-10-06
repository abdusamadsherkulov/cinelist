"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/actions";
import { getSocket } from "@/lib/socket";
import type { ChatMsg } from "@/lib/social";
import Avatar from "./Avatar";

export default function Chat({
    otherId,
    otherName,
    initial,
    canSend,
}: {
    otherId: string;
    otherName: string;
    initial: ChatMsg[];
    canSend: boolean;
}) {
    const [msgs, setMsgs] = useState(initial);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [typing, setTyping] = useState(false);
    const [, start] = useTransition();
    const box = useRef<HTMLDivElement>(null);
    const typingOff = useRef<ReturnType<typeof setTimeout> | null>(null);
    const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastEmit = useRef(0);

    const add = (m: ChatMsg) => setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));

    async function refresh() {
        try {
            const r = await fetch(`/api/messages/${otherId}`, { cache: "no-store" });
            if (r.ok) setMsgs(await r.json());
        } catch {
            /* offline */
        }
    }

    useEffect(() => {
        const s = getSocket();

        const onMessage = (p: { fromId: string; msg: ChatMsg }) => {
            if (p.fromId !== otherId) return;
            add(p.msg);
            setTyping(false);
            fetch(`/api/messages/${otherId}/read`, { method: "POST" });
        };
        const onTyping = (p: { from: string; typing: boolean }) => {
            if (p.from !== otherId) return;
            setTyping(p.typing);
            if (typingOff.current) clearTimeout(typingOff.current);
            if (p.typing) typingOff.current = setTimeout(() => setTyping(false), 3500);
        };

        s?.on("message", onMessage);
        s?.on("typing", onTyping);
        s?.on("connect", refresh); // catch up after a reconnect

        // safety net: slow poll with the socket, faster without it
        const t = setInterval(() => {
            if (document.visibilityState === "visible") refresh();
        }, s ? 15000 : 3000);

        return () => {
            s?.off("message", onMessage);
            s?.off("typing", onTyping);
            s?.off("connect", refresh);
            clearInterval(t);
        };
    }, [otherId]);

    useEffect(() => {
        const el = box.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [msgs.length, typing]);

    function onInput(v: string) {
        setText(v);
        const s = getSocket();
        if (!s) return;
        const now = Date.now();
        if (now - lastEmit.current > 1500) {
            s.emit("typing", { to: otherId, typing: true });
            lastEmit.current = now;
        }
        if (idle.current) clearTimeout(idle.current);
        idle.current = setTimeout(() => {
            s.emit("typing", { to: otherId, typing: false });
            lastEmit.current = 0;
        }, 2000);
    }

    function send(e: React.FormEvent) {
        e.preventDefault();
        const body = text.trim();
        if (!body) return;
        const tmpId = `tmp-${Date.now()}`;
        setMsgs((p) => [...p, { id: tmpId, mine: true, body, createdAt: new Date().toISOString(), movie: null }]);
        setText("");
        setError("");
        if (idle.current) clearTimeout(idle.current);
        getSocket()?.emit("typing", { to: otherId, typing: false });
        lastEmit.current = 0;
        start(async () => {
            try {
                const m = await sendMessage(otherId, body);
                setMsgs((p) => {
                    const rest = p.filter((x) => x.id !== tmpId);
                    return m && !rest.some((x) => x.id === m.id) ? [...rest, m] : rest;
                });
            } catch {
                setMsgs((p) => p.filter((x) => x.id !== tmpId));
                setError("Couldn't send that message.");
                setText(body);
            }
        });
    }

    const dayLabel = (iso: string) => {
        const d = new Date(iso);
        const days = Math.round((+new Date(new Date().toDateString()) - +new Date(d.toDateString())) / 864e5);
        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div
            className="flex min-h-0 flex-1 flex-col bg-ink"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 15% 0%, rgba(255,183,3,0.08), transparent 45%), radial-gradient(circle at 90% 100%, rgba(120,119,198,0.09), transparent 45%), radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
                backgroundSize: "auto, auto, 22px 22px",
            }}
        >
            <div ref={box} className="thin-scroll flex-1 overflow-y-auto px-3 py-4 md:px-6">
                <div>
                    {msgs.length === 0 && (
                        <div className="flex flex-col items-center pt-16 text-center">
                            <Avatar name={otherName} size={64} />
                            <p className="mt-3 font-semibold">{otherName}</p>
                            <p className="mt-1 text-sm text-zinc-500">No messages yet. Say hi or share a movie 🎬</p>
                        </div>
                    )}

                    {msgs.map((m, i) => {
                        const prev = msgs[i - 1];
                        const next = msgs[i + 1];
                        const day = (x: ChatMsg) => new Date(x.createdAt).toDateString();
                        const near = (a?: ChatMsg) =>
                            !!a && a.mine === m.mine && day(a) === day(m) && Math.abs(+new Date(a.createdAt) - +new Date(m.createdAt)) < 5 * 60 * 1000;
                        const newDay = !prev || day(prev) !== day(m);
                        const first = !near(prev);
                        const last = !near(next);
                        const time = last && (
                            <span suppressHydrationWarning className="shrink-0 pb-1 text-[10px] text-zinc-500">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        );

                        return (
                            <div key={m.id}>
                                {newDay && (
                                    <div className="my-4 flex justify-center">
                                        <span
                                            suppressHydrationWarning
                                            className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-zinc-400 ring-1 ring-white/5"
                                        >
                                            {dayLabel(m.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex items-end gap-2 ${m.mine ? "justify-end" : "justify-start"} ${first ? "mt-3" : "mt-0.5"}`}>
                                    {!m.mine && <div className="w-7 shrink-0">{last && <Avatar name={otherName} size={28} />}</div>}
                                    {m.mine && time}
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug sm:max-w-[65%] xl:max-w-[55%] ${m.mine
                                                ? `bg-gradient-to-br from-accent to-amber-500 text-black shadow-lg shadow-accent/10 ${last ? "rounded-br-md" : ""}`
                                                : `bg-white/[0.07] text-zinc-100 ring-1 ring-white/10 ${last ? "rounded-bl-md" : ""}`
                                            }`}
                                    >
                                        {m.movie && (
                                            <Link
                                                href={`/movie/${m.movie.id}`}
                                                className={`mb-1.5 flex items-center gap-3 rounded-xl p-2 transition hover:brightness-110 ${m.mine ? "bg-black/15" : "bg-black/30"}`}
                                            >
                                                {m.movie.poster ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w154${m.movie.poster}`}
                                                        alt=""
                                                        className="h-20 w-14 shrink-0 rounded-lg object-cover shadow-md"
                                                    />
                                                ) : (
                                                    <div className="h-20 w-14 shrink-0 rounded-lg bg-line" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="line-clamp-2 font-semibold leading-tight">{m.movie.title}</p>
                                                    <p className="mt-0.5 text-xs opacity-70">{m.movie.year ?? "—"}</p>
                                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">Open movie →</p>
                                                </div>
                                            </Link>
                                        )}
                                        {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                                    </div>
                                    {!m.mine && time}
                                </div>
                            </div>
                        );
                    })}

                    {typing && (
                        <div className="mt-3 flex items-end gap-2">
                            <div className="w-7 shrink-0">
                                <Avatar name={otherName} size={28} />
                            </div>
                            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                                        style={{ animationDelay: `${i * 150}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {canSend ? (
                <form onSubmit={send} className="border-t border-line/70 bg-panel/80 p-3 backdrop-blur md:px-5">
                    <div className="mx-auto flex max-w-3xl items-center gap-2">
                        <input
                            value={text}
                            onChange={(e) => onInput(e.target.value)}
                            maxLength={2000}
                            placeholder="Write a message…"
                            className="min-w-0 flex-1 rounded-full border border-line bg-ink px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                        />
                        <button
                            disabled={!text.trim()}
                            aria-label="Send"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-black transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                        >
                            <Send size={17} />
                        </button>
                    </div>
                    {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                </form>
            ) : (
                <p className="border-t border-line/70 bg-panel/80 p-3 text-center text-sm text-zinc-500">
                    You&apos;re not friends anymore, so you can&apos;t send new messages.
                </p>
            )}
        </div>
    );
}