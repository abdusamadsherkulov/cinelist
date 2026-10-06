"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, Compass, House, Library, LogIn, LogOut, MessageCircle, User, UserPlus } from "lucide-react";
import { getSocket } from "@/lib/socket";
import SearchBox from "./SearchBox";
import Avatar from "./Avatar";
import LogoMark from "./LogoMark";

type NavUser = { id: string; name: string; username: string | null };

export default function AppNav({ user, unread, requests, notifications }: { user: NavUser | null; unread: number; requests: number; notifications: number }) {
    const pathname = usePathname();
    const path = useRef(pathname);
    path.current = pathname;
    const [counts, setCounts] = useState({ unread, requests, notifications });
    const uid = user?.id;

    const reload = useCallback(async () => {
        try {
            const r = await fetch("/api/unread", { cache: "no-store" });
            if (r.ok) setCounts(await r.json());
        } catch {
            /* ignore */
        }
    }, []);

    // after every navigation (e.g. having read a chat)
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        if (uid) reload();
    }, [pathname, reload, uid]);

    // instantly when something arrives
    useEffect(() => {
        if (!uid) return;
        const s = getSocket();
        if (!s) return;
        const onMessage = (p: { fromId: string }) => {
            if (!path.current.startsWith(`/messages/${p.fromId}`)) reload(); // already reading it? no badge
        };
        s.on("message", onMessage);
        s.on("friends", reload);
        s.on("notification", reload);
        return () => {
            s.off("message", onMessage);
            s.off("friends", reload);
            s.off("notification", reload);
        };
    }, [reload, uid]);

    const profileHref = user ? `/u/${user.username ?? user.id}` : "/";
    const items = [
        { href: "/", label: "Home", Icon: House, badge: 0, avatar: false, active: pathname === "/" },
        { href: "/discover", label: "Discover", Icon: Compass, badge: 0, avatar: false, active: pathname.startsWith("/discover") },
        ...(user
            ? [
                { href: "/messages", label: "Messages", Icon: MessageCircle, badge: counts.unread, avatar: false, active: pathname.startsWith("/messages") },
                { href: "/notifications", label: "Alerts", Icon: Bell, badge: counts.notifications, avatar: false, active: pathname.startsWith("/notifications") },
                { href: "/library", label: "Library", Icon: Library, badge: 0, avatar: false, active: pathname.startsWith("/library") },
                { href: profileHref, label: "Profile", Icon: User, badge: 0, avatar: true, active: pathname.startsWith(profileHref) },
            ]
            : []),
    ];

    const logout = () => signOut({ callbackUrl: "/" });

    // shared sidebar styles
    const row = "flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition";
    const box = "relative flex h-7 w-7 shrink-0 items-center justify-center";
    const lbl =
        "whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/side:opacity-100 group-focus-within/side:opacity-100";

    return (
        <>
            {/* ───────── desktop: icon rail that widens on hover ───────── */}
            <div className="hidden w-[76px] shrink-0 md:block">
                <aside className="group/side fixed inset-y-0 left-0 z-40 flex w-[76px] flex-col overflow-hidden border-r border-line bg-ink px-3 py-4 transition-[width,box-shadow] duration-300 focus-within:w-64 hover:w-64 hover:shadow-[10px_0_40px_-12px_rgba(0,0,0,0.9)]">
                    <Link href="/" className="flex items-center gap-3 px-1.5">
                        <LogoMark size={40} className="shrink-0" />
                        <span className={`${lbl} text-2xl font-extrabold tracking-tight`}>
                            Cine<span className="text-accent">List</span>
                        </span>
                    </Link>

                    <nav className="mt-8 flex flex-col gap-1">
                        {items.map(({ href, label, Icon, badge, avatar, active }) => (
                            <Link
                                key={label}
                                href={href}
                                className={`${row} ${active ? "bg-accent/10 text-accent" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                            >
                                <span className={box}>
                                    {avatar && user ? (
                                        <span className={`rounded-full ${active ? "ring-2 ring-accent" : ""}`}>
                                            <Avatar name={user.name} size={26} />
                                        </span>
                                    ) : (
                                        <Icon size={25} />
                                    )}
                                    {badge > 0 && (
                                        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
                                            {badge > 9 ? "9+" : badge}
                                        </span>
                                    )}
                                </span>
                                <span className={lbl}>{label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto flex flex-col gap-1">
                        {user ? (
                            <button onClick={logout} className={`${row} w-full text-zinc-400 hover:bg-white/5 hover:text-red-400`}>
                                <span className={box}>
                                    <LogOut size={25} />
                                </span>
                                <span className={lbl}>Log out</span>
                            </button>
                        ) : (
                            <>
                                <Link href="/login" className={`${row} text-zinc-300 hover:bg-white/5 hover:text-white`}>
                                    <span className={box}>
                                        <LogIn size={25} />
                                    </span>
                                    <span className={lbl}>Log in</span>
                                </Link>
                                <Link href="/register" className={`${row} text-accent hover:bg-accent/10`}>
                                    <span className={box}>
                                        <UserPlus size={25} />
                                    </span>
                                    <span className={lbl}>Sign up</span>
                                </Link>
                            </>
                        )}
                    </div>
                </aside>
            </div>

            {/* ───────── phone: top bar (home page only) ───────── */}
            {(pathname === "/" || !user) && (
                <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur md:hidden">
                    <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                        <LogoMark size={28} />
                        <span>
                            Cine<span className="text-accent">List</span>
                        </span>
                    </Link>
                    {pathname === "/" ? (
                        <div className="min-w-0 flex-1">
                            <SearchBox bar />
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}
                    {!user && pathname !== "/login" && pathname !== "/register" && (
                        <Link href="/login" className="btn-primary !px-4 !py-1.5">Log in</Link>
                    )}
                </header>
            )}

            {/* ───────── phone: bottom tabs ───────── */}
            {user && !/^\/messages\/[^/]+/.test(pathname) && (
                <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
                    {items.map(({ href, label, Icon, badge, avatar, active }) => (
                        <Link
                            key={label}
                            href={href}
                            aria-label={label}
                            className={`relative flex flex-1 items-center justify-center py-3.5 ${active ? "text-accent" : "text-zinc-400"}`}
                        >
                            {avatar ? (
                                <span className={`rounded-full ${active ? "ring-2 ring-accent" : ""}`}>
                                    <Avatar name={user.name} size={22} />
                                </span>
                            ) : (
                                <Icon size={25} />
                            )}
                            {badge > 0 && (
                                <span className="absolute right-[26%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
                                    {badge > 9 ? "9+" : badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            )}
        </>
    );
}