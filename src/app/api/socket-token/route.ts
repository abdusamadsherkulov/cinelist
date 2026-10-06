import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUser } from "@/lib/auth";

export async function GET() {
  const me = await getUser();
  const secret = process.env.SOCKET_SECRET;
  if (!me || !secret) return NextResponse.json({}, { status: 401 });
  const token = jwt.sign({ uid: me.id }, secret, { expiresIn: "1h" });
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}