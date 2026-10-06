"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { addComment, deleteComment } from "@/app/actions";

export type CommentView = { id: string; body: string; author: string; authorHref: string; mine: boolean; date: string };

export default function Comments({ movieId, comments, signedIn }: { movieId: number; comments: CommentView[]; signedIn: boolean }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <section>
      <h2 className="text-xl font-bold">Comments <span className="text-zinc-500">({comments.length})</span></h2>
      {signedIn ? (
        <div className="mt-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={3} placeholder="Share your thoughts (no spoilers!)…" className="input" />
          <button
            disabled={pending || !text.trim()}
            onClick={() => start(async () => {
              try { await addComment(movieId, text); setText(""); setError(""); }
              catch (e) { setError((e as Error).message); }
            })}
            className="btn-primary mt-2"
          >
            Post comment
          </button>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500"><Link href="/login" className="text-accent">Log in</Link> to join the discussion.</p>
      )}
      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl border border-line bg-panel p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <Link href={c.authorHref} className="font-semibold text-zinc-300 hover:text-accent">{c.author}</Link>
              <span>{c.date}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
            {c.mine && (
              <button onClick={() => start(() => deleteComment(c.id, movieId))} className="mt-2 text-xs text-red-400 hover:underline">Delete</button>
            )}
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-zinc-600">No comments yet. Be the first!</li>}
      </ul>
    </section>
  );
}
