"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUsername } from "@/app/actions";
import UsernameInput from "./UsernameInput";

export default function OnboardingForm({ name }: { name: string }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(fd: FormData) {
    setError("");
    start(async () => {
      const r = await setUsername(String(fd.get("username") ?? ""));
      if (r.error) return setError(r.error);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-panel p-8">
      <h1 className="text-2xl font-bold">Welcome, {name.split(" ")[0]}!</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Pick a username so friends can find you. Letters, numbers and underscores, 3–20 characters.
      </p>
      <form action={submit} className="mt-6 space-y-3">
        <UsernameInput onStatus={setOk} autoFocus />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={pending || !ok} className="btn-primary w-full justify-center">
          {pending ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}