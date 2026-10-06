"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import Avatar from "./Avatar";
import FriendButton, { type FriendStatus } from "./FriendButton";

type P = { id: string; name: string; username: string | null; friendshipId?: string };
type Tab = "friends" | "requests" | "sent";

export default function FriendsModal({
  friends,
  received,
  sent,
  defaultOpen,
  defaultTab,
}: {
  friends: P[];
  received: P[];
  sent: P[];
  defaultOpen: boolean;
  defaultTab: Tab;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>(defaultTab);

  // opened from a link like /u/me?friends=requests (e.g. from a notification)
  useEffect(() => {
    if (defaultOpen) {
      setTab(defaultTab);
      setOpen(true);
    }
  }, [defaultOpen, defaultTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const tabs: { id: Tab; label: string; list: P[] }[] = [
    { id: "friends", label: "Friends", list: friends },
    { id: "requests", label: "Requests", list: received },
    { id: "sent", label: "Sent", list: sent },
  ];
  const current = tabs.find((t) => t.id === tab)!;
  const status: FriendStatus = tab === "friends" ? "friends" : tab === "requests" ? "received" : "sent";
  const empty = { friends: "No friends yet.", requests: "No friend requests.", sent: "No pending requests." }[tab];

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 transition hover:text-accent">
        <span>
          <b className="text-zinc-200">{friends.length}</b> {friends.length === 1 ? "friend" : "friends"}
        </span>
        {received.length > 0 && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-black">{received.length} new</span>
        )}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-line bg-panel text-zinc-100 sm:rounded-2xl"
          >
            <div className="flex items-center justify-between px-5 pt-4">
              <h2 className="text-xl font-bold">Friends</h2>
              <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 px-5 pb-3 pt-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    tab === t.id ? "border-accent bg-accent/10 text-accent" : "border-line text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.label} ({t.list.length})
                </button>
              ))}
            </div>

            <div className="thin-scroll flex-1 overflow-y-auto px-5 pb-4">
              {current.list.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">{empty}</p>
              ) : (
                <ul className="space-y-2">
                  {current.list.map((u) => (
                    <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ink/40 p-3">
                      <Link
                        href={`/u/${u.username ?? u.id}`}
                        onClick={() => setOpen(false)}
                        className="flex min-w-0 flex-1 items-center gap-3 hover:text-accent"
                      >
                        <Avatar name={u.name} size={40} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{u.name}</span>
                          {u.username && <span className="block truncate text-xs text-zinc-500">@{u.username}</span>}
                        </span>
                      </Link>
                      <FriendButton
                        otherId={u.id}
                        status={status}
                        friendshipId={u.friendshipId}
                        showMessage
                        iconOnly
                        onChange={() => router.refresh()}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-line p-3">
              <Link href="/discover?mode=people" onClick={() => setOpen(false)} className="btn-primary w-full justify-center">
                <UserPlus size={16} /> Find people
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}