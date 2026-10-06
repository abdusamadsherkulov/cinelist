"use client";
import { useState, useTransition } from "react";
import { createFolder } from "@/app/actions";

export default function FolderCreate() {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); start(async () => { await createFolder(name); setName(""); }); }}
      className="mt-4 flex gap-2"
    >
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="New folder…" className="input" />
      <button disabled={pending || !name.trim()} className="btn !px-3">＋</button>
    </form>
  );
}
