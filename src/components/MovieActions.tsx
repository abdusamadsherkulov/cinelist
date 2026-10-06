"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Check, FolderCheck, FolderPlus, Heart, Send } from "lucide-react";
import { saveMovie, sendMessage, toggleFavorite, toggleWatchlist, unsaveMovie, type Snap } from "@/app/actions";

type Props = {
  snap: Snap;
  signedIn: boolean;
  isFav: boolean;
  inWatchlist: boolean;
  saved: boolean;
  folderId: string | null;
  folders: { id: string; name: string }[];
  friends: { id: string; name: string }[];
};

function IconBtn({
  label,
  active,
  activeClass,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`group/tip relative flex h-11 w-11 items-center justify-center rounded-full border bg-panel transition hover:scale-105 ${active ? activeClass : "border-line hover:border-accent hover:text-accent"
        }`}
    >
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover/tip:opacity-100">
        {label}
      </span>
    </button>
  );
}

export default function MovieActions({ snap, signedIn, isFav, inWatchlist, saved, folderId, folders, friends }: Props) {
  const [panel, setPanel] = useState<null | "save" | "share">(null);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!signedIn) return <Link href="/login" className="btn-primary">Log in to rate &amp; save</Link>;

  const pick = (id: string | null) => {
    setPanel(null);
    start(() => saveMovie(snap, id));
  };

  const share = (friendId: string) =>
    start(async () => {
      await sendMessage(friendId, "", snap);
      setSentTo((s) => [...s, friendId]);
      // close the panel a second after the last share
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setPanel((p) => (p === "share" ? null : p));
        setSentTo([]);
      }, 1000);
    });

  const popover = "absolute left-0 top-14 z-30 w-60 rounded-xl border border-line bg-panel p-2 shadow-2xl";

  return (
    <div className={`relative flex flex-wrap gap-3 ${pending ? "opacity-70" : ""}`}>
      <IconBtn
        label={isFav ? "Remove from favorites" : "Add to favorites"}
        active={isFav}
        activeClass="border-rose-500 text-rose-400"
        onClick={() => start(() => toggleFavorite(snap))}
      >
        <Heart size={20} fill={isFav ? "currentColor" : "none"} />
      </IconBtn>

      <IconBtn
        label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        active={inWatchlist}
        activeClass="border-sky-400 text-sky-400"
        onClick={() => start(() => toggleWatchlist(snap))}
      >
        <Bookmark size={20} fill={inWatchlist ? "currentColor" : "none"} />
      </IconBtn>

      <IconBtn
        label={saved ? "Saved — change folder" : "Save to a folder"}
        active={saved}
        activeClass="border-accent text-accent"
        onClick={() => setPanel((p) => (p === "save" ? null : "save"))}
      >
        {saved ? <FolderCheck size={20} /> : <FolderPlus size={20} />}
      </IconBtn>

      <IconBtn
        label="Share with a friend"
        active={panel === "share"}
        activeClass="border-emerald-400 text-emerald-400"
        onClick={() => setPanel((p) => (p === "share" ? null : "share"))}
      >
        <Send size={20} />
      </IconBtn>

      {panel === "save" && (
        <div className={popover}>
          <button
            onClick={() => pick(null)}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 ${saved && !folderId ? "text-accent" : ""}`}
          >
            Unsorted
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => pick(f.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 ${folderId === f.id ? "text-accent" : ""}`}
            >
              📁 {f.name}
            </button>
          ))}
          {folders.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-500">
              Create folders in <Link href="/library" className="text-accent">My Library</Link>.
            </p>
          )}
          {saved && (
            <button
              onClick={() => {
                setPanel(null);
                start(() => unsaveMovie(snap.movieId));
              }}
              className="mt-1 block w-full rounded-lg border-t border-line px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
            >
              Remove from saved
            </button>
          )}
        </div>
      )}

      {panel === "share" && (
        <div className={`${popover} left-auto sm:left-24`}>
          <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Send to</p>
          {friends.map((f) => (
            <button
              key={f.id}
              disabled={sentTo.includes(f.id)}
              onClick={() => share(f.id)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-70"
            >
              <span className="truncate">{f.name}</span>
              {sentTo.includes(f.id) ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check size={14} /> Sent
                </span>
              ) : (
                <Send size={14} className="text-zinc-500" />
              )}
            </button>
          ))}
          {friends.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-500">
              No friends yet. <Link href="/discover?mode=people" className="text-accent">Find people</Link> first.
            </p>
          )}
        </div>
      )}
    </div>
  );
}