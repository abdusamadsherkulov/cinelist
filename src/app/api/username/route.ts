import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { normalizeUsername, usernameError } from "@/lib/username";

export async function GET(req: Request) {
  const u = normalizeUsername(new URL(req.url).searchParams.get("u") ?? "");
  const err = usernameError(u);
  if (err) return NextResponse.json({ available: false, reason: err });
  const me = await getUser();
  const found = await prisma.user.findUnique({ where: { username: u }, select: { id: true } });
  const taken = !!found && found.id !== me?.id;
  return NextResponse.json({ available: !taken, reason: taken ? "Already taken" : undefined });
}