"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { register } from "@/app/actions";
import UsernameInput from "./UsernameInput";
import { queueSplash } from "./WelcomeSplash";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [googleLoading, setGoogleLoading] = useState(false);
  const isReg = mode === "register";
  const [usernameOk, setUsernameOk] = useState(false);

  function dest() {
    try {
      const cb = new URLSearchParams(window.location.search).get("callbackUrl");
      if (!cb) return "/";
      const u = new URL(cb, window.location.origin);
      return u.origin === window.location.origin ? u.pathname + u.search : "/";
    } catch {
      return "/";
    }
  }

  function submit(fd: FormData) {
    setError("");
    start(async () => {
      if (isReg) {
        const r = await register(fd);
        if (r.error) return setError(r.error);
      }
      const res = await signIn("credentials", {
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        redirect: false,
      });
      if (res?.error) return setError("Wrong email or password");
      queueSplash(true);
      router.push(dest());
      router.refresh();
    });
  }

  function google() {
    setGoogleLoading(true);
    queueSplash();
    signIn("google", { callbackUrl: dest() });
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-panel p-8">
      <h1 className="text-2xl font-bold">{isReg ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {isReg ? "Rate, save and journal every movie you love." : "Log in to your library."}
      </p>

      <button
        type="button"
        onClick={google}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
        <div className="h-px flex-1 bg-line" />
        or use email
        <div className="h-px flex-1 bg-line" />
      </div>

      <form action={submit} className="space-y-3">
        {isReg && <input name="name" placeholder="Name" required className="input" />}
        {isReg && <UsernameInput onStatus={setUsernameOk} />}
        <input name="email" type="email" placeholder="Email" required className="input" />
        <input
          name="password"
          type="password"
          placeholder={isReg ? "Password (8+ characters)" : "Password"}
          autoComplete={isReg ? "new-password" : "current-password"}
          required
          className="input"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={pending || (isReg && !usernameOk)} className="btn-primary w-full justify-center">
          {pending ? "Please wait…" : isReg ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        {isReg ? "Already have an account?" : "New here?"}{" "}
        <Link href={isReg ? "/login" : "/register"} className="text-accent hover:underline">
          {isReg ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}