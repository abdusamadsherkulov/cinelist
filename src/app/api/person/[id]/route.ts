import { NextResponse } from "next/server";
import { personBasic } from "@/lib/tmdb";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json(null, { status: 400 });
  try {
    const p = await personBasic(id);
    let bio = p.biography.replace(/\s+/g, " ").trim();
    if (bio.length > 260) bio = bio.slice(0, 260).replace(/\s+\S*$/, "") + "…";
    return NextResponse.json(
      {
        name: p.name,
        photo: p.profile_path,
        department: p.known_for_department,
        birthday: p.birthday,
        deathday: p.deathday,
        place: p.place_of_birth,
        bio,
      },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch {
    return NextResponse.json(null, { status: 404 });
  }
}