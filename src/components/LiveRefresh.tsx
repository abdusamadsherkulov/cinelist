"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function LiveRefresh({ events }: { events: ("message" | "friends")[] }) {
  const router = useRouter();
  const key = events.join(",");
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const refresh = () => router.refresh();
    const list = key.split(",") as ("message" | "friends")[];
    list.forEach((e) => s.on(e, refresh));
    return () => list.forEach((e) => s.off(e, refresh));
  }, [router, key]);
  return null;
}