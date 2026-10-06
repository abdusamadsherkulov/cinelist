"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      aria-label="Log out"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="absolute right-3 top-3 rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-red-400 md:hidden"
    >
      <LogOut size={20} />
    </button>
  );
}