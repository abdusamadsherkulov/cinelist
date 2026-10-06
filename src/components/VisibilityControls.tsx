"use client";
import { useTransition } from "react";
import { Eye, EyeOff, Globe, Lock } from "lucide-react";
import { setFolderVisibility, setSavedVisibility } from "@/app/actions";

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-accent" : "bg-line"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </span>
  );
}

export function SavedMasterToggle({ visible }: { visible: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => setSavedVisibility(!visible))}
      className="mb-3 flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-panel px-3 py-2 text-left transition hover:border-accent disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        {visible ? <Eye size={16} className="text-accent" /> : <EyeOff size={16} className="text-zinc-500" />}
        <span>
          <span className="block text-sm font-medium text-zinc-200">Saved movies</span>
          <span className="text-xs text-zinc-500">{visible ? "Friends can see public folders" : "Hidden from everyone"}</span>
        </span>
      </span>
      <Switch on={visible} />
    </button>
  );
}

export function FolderToggle({ id, isPublic, masterVisible }: { id: string; isPublic: boolean; masterVisible: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div>
      <button
        disabled={pending}
        onClick={() => start(() => setFolderVisibility(id, !isPublic))}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-panel px-3 py-2 text-left text-sm transition hover:border-accent disabled:opacity-60"
      >
        <span className="flex items-center gap-2">
          {isPublic ? <Globe size={14} className="text-accent" /> : <Lock size={14} className="text-zinc-500" />}
          {isPublic ? "Visible to friends" : "Private folder"}
        </span>
        <Switch on={isPublic} />
      </button>
      {!masterVisible && <p className="mt-1 text-xs text-zinc-500">All saved movies are currently hidden.</p>}
    </div>
  );
}