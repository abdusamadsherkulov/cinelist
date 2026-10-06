"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function UsernameGate({ needs }: { needs: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const block = needs && path !== "/onboarding";
  useEffect(() => {
    if (block) router.replace("/onboarding");
  }, [block, router]);
  return block ? <div className="fixed inset-0 z-[200] bg-ink" /> : null;
}