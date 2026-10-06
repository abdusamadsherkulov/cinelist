"use client";
import { useState, useTransition } from "react";
import { saveNote } from "@/app/actions";

export default function NoteBox({ movieId, initial }: { movieId: number; initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();
  return (
    <section className="rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-5">
      <h2 className="text-lg font-bold">🔒 My private notes</h2>
      <p className="text-xs text-zinc-500">Only you can see this.</p>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        rows={5}
        maxLength={5000}
        placeholder="Favorite scenes, who to watch it with, things to remember…"
        className="input mt-3"
      />
      <div className="mt-2 flex items-center gap-3">
        <button disabled={pending || saved} onClick={() => start(async () => { await saveNote(movieId, text); setSaved(true); })} className="btn-primary">
          {pending ? "Saving…" : "Save note"}
        </button>
        {saved && text && <span className="text-xs text-zinc-500">Saved</span>}
      </div>
    </section>
  );
}
