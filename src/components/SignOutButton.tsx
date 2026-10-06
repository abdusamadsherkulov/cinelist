"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="btn !py-1.5">
      Log out
    </button>
  );
}
