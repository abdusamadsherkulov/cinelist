import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  const me = await getUser();
  if (!me) return NextResponse.json({}, { status: 401 });
  await prisma.message.updateMany({
    where: { senderId: (await params).userId, receiverId: me.id, readAt: null },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}