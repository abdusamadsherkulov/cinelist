import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { loadThread } from "@/lib/social";

export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  const me = await getUser();
  if (!me) return NextResponse.json([], { status: 401 });
  const msgs = await loadThread(me.id, (await params).userId);
  return NextResponse.json(msgs, { headers: { "Cache-Control": "no-store" } });
}