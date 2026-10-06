"use client";
import { useTransition } from "react";
import { deleteFolder, saveMovie, unsaveMovie, type Snap } from "@/app/actions";

export function SavedControls({ snap, folderId, folders }: { snap: Snap; folderId: string | null; folders: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <div className={`mt-2 flex items-center gap-2 ${pending ? "opacity-50" : ""}`}>
      <select
        value={folderId ?? ""}
        onChange={(e) => start(() => saveMovie(snap, e.target.value || null))}
        className="min-w-0 flex-1 rounded-md border border-line bg-panel px-2 py-1 text-xs"
      >
        <option value="">Unsorted</option>
        {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <button onClick={() => start(() => unsaveMovie(snap.movieId))} title="Remove" className="text-xs text-red-400 hover:underline">✕</button>
    </div>
  );
}

export function DeleteFolder({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => confirm("Delete this folder? Movies inside move to Unsorted.") && start(() => deleteFolder(id))}
      className="text-xs text-red-400 hover:underline"
    >
      Delete folder
    </button>
  );
}
