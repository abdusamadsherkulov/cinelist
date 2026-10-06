import Link from "next/link";
import { Film, Heart, Star, Bookmark } from "lucide-react";
import { getUser } from "@/lib/auth";

export default async function Footer() {
    const user = await getUser();
    const link = "text-zinc-400 transition hover:text-accent";

    return (
        <footer className="relative mt-10 border-t border-line bg-panel/40">
            {/* soft gold glow along the top edge */}
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-black">
                            <Film size={20} />
                        </span>
                        <span>
                            Cine<span className="text-accent">List</span>
                        </span>
                    </Link>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
                        Your personal movie diary. Rate what you watch, save what&apos;s next and keep your thoughts on every film.
                    </p>
                    <div className="mt-5 flex gap-4 text-zinc-500">
                        <span className="flex items-center gap-1.5 text-xs"><Star size={14} className="text-accent" /> Rate</span>
                        <span className="flex items-center gap-1.5 text-xs"><Bookmark size={14} className="text-accent" /> Save</span>
                        <span className="flex items-center gap-1.5 text-xs"><Heart size={14} className="text-accent" /> Favorite</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Explore</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><Link href="/" className={link}>Home</Link></li>
                        <li><Link href="/search" className={link}>Search movies</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                        {user ? "Your space" : "Join"}
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        {user ? (
                            <>
                                <li><Link href="/library?tab=saved" className={link}>Saved &amp; folders</Link></li>
                                <li><Link href="/library?tab=favorites" className={link}>Favorites</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link href="/login" className={link}>Log in</Link></li>
                                <li><Link href="/register" className={link}>Create an account</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            <div className="border-t border-line">
                <div className="mx-auto grid max-w-7xl gap-2 px-4 py-5 text-xs text-zinc-500 sm:grid-cols-[1fr_auto_1.6fr] sm:items-center sm:gap-6 sm:px-6">
                    <p>© {new Date().getFullYear()} CineList. Made for movie lovers.</p>
                    <p className="sm:text-center">
                        Built by{" "}
                        <a href="https://sam-sherkulov-portfolio.vercel.app/" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-accent">
                            Sam Sherkulov
                        </a>
                    </p>
                    <p className="sm:text-right">
                        Movie data from{" "}
                        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-accent">
                            TMDB
                        </a>
                        . This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>
                </div>
            </div>
        </footer>
    );
}