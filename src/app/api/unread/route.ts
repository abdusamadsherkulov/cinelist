import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const me = await getUser();
  if (!me) return NextResponse.json({ unread: 0, requests: 0, notifications: 0 });
  const [unread, requests, notifications] = await Promise.all([
    prisma.message.count({ where: { receiverId: me.id, readAt: null } }),
    prisma.friendship.count({ where: { addresseeId: me.id, status: "PENDING" } }),
    prisma.notification.count({ where: { userId: me.id, readAt: null } }),
  ]);
  return NextResponse.json({ unread, requests, notifications }, { headers: { "Cache-Control": "no-store" } });
}