"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { getSocket } from "@/lib/socket";
import Avatar from "./Avatar";
import FriendButton, { type FriendStatus } from "./FriendButton";

type Result = { id: string; name: string; username: string | null; status: FriendStatus; friendshipId?: string };

export default function FriendSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const term = q.trim().replace(/^@/, "");
  const termRef = useRef(term);
  termRef.current = term;

  const run = useCallback(async (t: string) => {
    ctrl.current?.abort();
    if (!t) {
      setResults(null);
      setLoading(false);
      return;
    }
    const c = new AbortController();
    ctrl.current = c;
    setLoading(true);
    try {
      const r = await fetch(`/api/users/search?q=${encodeURIComponent(t)}`, { signal: c.signal, cache: "no-store" });
      setResults(r.ok ? await r.json() : []);
      setLoading(false);
    } catch {
      /* superseded by a newer keystroke */
    }
  }, []);

  // search as you type
  useEffect(() => {
    const t = setTimeout(() => run(term), 200);
    return () => clearTimeout(t);
  }, [term, run]);

  // statuses change live (e.g. someone accepts your request)
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onFriends = () => run(termRef.current);
    s.on("friends", onFriends);
    return () => {
      s.off("friends", onFriends);
    };
  }, [run]);

  return (
    <div>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find people by name or @username…"
          autoComplete="off"
          className="input !pl-11 !pr-10"
        />
        {loading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" />}
      </div>

      {term && results && (
        <ul className="mt-4 space-y-2">
          {results.length === 0 ? (
            <li className="text-sm text-zinc-500">Nobody found.</li>
          ) : (
            results.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel p-3">
                <Link href={`/u/${u.username ?? u.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:text-accent">
                  <Avatar name={u.name} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{u.name}</span>
                    {u.username && <span className="block truncate text-xs text-zinc-500">@{u.username}</span>}
                  </span>
                </Link>
                <FriendButton
                  otherId={u.id}
                  status={u.status}
                  friendshipId={u.friendshipId}
                  showMessage
                  onChange={() => run(termRef.current)}
                />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}