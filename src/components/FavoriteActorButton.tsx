"use client";
import { useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toggleFavoriteActor, type ActorSnap } from "@/app/actions";

export default function FavoriteActorButton({
  snap,
  signedIn,
  isFav,
}: {
  snap: ActorSnap;
  signedIn: boolean;
  isFav: boolean;
}) {
  const [pending, start] = useTransition();

  if (!signedIn)
    return (
      <Link href="/login" className="btn">
        <Heart size={16} /> Log in to favorite
      </Link>
    );

  return (
    <button
      disabled={pending}
      onClick={() => start(() => toggleFavoriteActor(snap))}
      className={`btn ${isFav ? "!border-rose-500 !text-rose-400" : ""}`}
    >
      <Heart size={16} fill={isFav ? "currentColor" : "none"} />
      {isFav ? "Favorite actor" : "Add to favorites"}
    </button>
  );
}