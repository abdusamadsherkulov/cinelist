"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { notify } from "@/lib/realtime";
import { toChatMsg, type ChatMsg } from "@/lib/social";
import { normalizeUsername, usernameError } from "@/lib/username";
import { createNotification } from "@/lib/notifications";

export type Snap = { movieId: number; title: string; posterPath: string | null; year: string | null };

async function need() {
  const u = await getUser();
  if (!u) throw new Error("Please sign in");
  return u;
}
function refresh(movieId?: number) {
  revalidatePath("/library");
  if (movieId) revalidatePath(`/movie/${movieId}`);
}

const ago = (s: number) => new Date(Date.now() - s * 1000);
async function limit(recent: Promise<number>, max: number) {
  if ((await recent) >= max) throw new Error("You're doing that too fast. Try again in a bit.");
}

export async function register(fd: FormData): Promise<{ error?: string }> {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const username = normalizeUsername(String(fd.get("username") ?? ""));
  if (name.length < 2) return { error: "Name is too short" };
  const uerr = usernameError(username);
  if (uerr) return { error: uerr };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "That email is already registered" };
  if (await prisma.user.findUnique({ where: { username } })) return { error: "That username is taken" };
  try {
    await prisma.user.create({
      data: { name, username, email, passwordHash: await bcrypt.hash(password, 10) },
    });
  } catch {
    return { error: "That email or username is already taken" };
  }
  return {};
}

export async function setUsername(raw: string): Promise<{ error?: string }> {
  const u = await need();
  const username = normalizeUsername(raw);
  const err = usernameError(username);
  if (err) return { error: err };
  const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (taken && taken.id !== u.id) return { error: "That username is already taken" };
  try {
    await prisma.user.update({ where: { id: u.id }, data: { username } });
  } catch {
    return { error: "That username is already taken" };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function rate(s: Snap, value: number) {
  const u = await need();
  const movieId = s.movieId;
  const key = { userId_movieId: { userId: u.id, movieId } };
  if (!value) await prisma.rating.deleteMany({ where: { userId: u.id, movieId } });
  else {
    const v = Math.min(10, Math.max(1, Math.round(value)));
    const snap = { title: s.title, posterPath: s.posterPath, year: s.year };
    await prisma.rating.upsert({
      where: key,
      update: { value: v, ...snap },
      create: { userId: u.id, movieId, value: v, ...snap },
    });
  }
  refresh(movieId);
}

export async function toggleFavorite(s: Snap) {
  const u = await need();
  const del = await prisma.favorite.deleteMany({ where: { userId: u.id, movieId: s.movieId } });
  if (del.count === 0)
    await prisma.favorite.create({
      data: { userId: u.id, movieId: s.movieId, title: s.title, posterPath: s.posterPath, year: s.year },
    });
  refresh(s.movieId);
}

export async function toggleWatchlist(s: Snap) {
  const u = await need();
  const del = await prisma.watchlist.deleteMany({ where: { userId: u.id, movieId: s.movieId } });
  if (del.count === 0)
    await prisma.watchlist.create({
      data: { userId: u.id, movieId: s.movieId, title: s.title, posterPath: s.posterPath, year: s.year },
    });
  refresh(s.movieId);
}

export async function saveMovie(s: Snap, folderId: string | null) {
  const u = await need();
  if (folderId && !(await prisma.folder.findFirst({ where: { id: folderId, userId: u.id } })))
    throw new Error("Folder not found");
  await prisma.savedMovie.upsert({
    where: { userId_movieId: { userId: u.id, movieId: s.movieId } },
    update: { folderId },
    create: { userId: u.id, movieId: s.movieId, title: s.title, posterPath: s.posterPath, year: s.year, folderId },
  });
  refresh(s.movieId);
}

export async function unsaveMovie(movieId: number) {
  const u = await need();
  await prisma.savedMovie.deleteMany({ where: { userId: u.id, movieId } });
  refresh(movieId);
}

export async function createFolder(name: string) {
  const u = await need();
  const n = name.trim().slice(0, 40);
  if (!n) return;
  await prisma.folder.upsert({
    where: { userId_name: { userId: u.id, name: n } },
    update: {},
    create: { userId: u.id, name: n },
  });
  refresh();
}

export async function deleteFolder(id: string) {
  const u = await need();
  await prisma.folder.deleteMany({ where: { id, userId: u.id } }); // movies fall back to "Unsorted"
  refresh();
}

export async function addComment(movieId: number, body: string) {
  const u = await need();
  const b = body.trim().slice(0, 1000);
  if (!b) return;
  await limit(prisma.comment.count({ where: { userId: u.id, createdAt: { gte: ago(60) } } }), 5);
  await prisma.comment.create({ data: { userId: u.id, movieId, body: b } });
  refresh(movieId);
}

export async function deleteComment(id: string, movieId: number) {
  const u = await need();
  await prisma.comment.deleteMany({ where: { id, userId: u.id } });
  refresh(movieId);
}

export async function saveNote(movieId: number, body: string) {
  const u = await need();
  const b = body.trim().slice(0, 5000);
  if (!b) await prisma.note.deleteMany({ where: { userId: u.id, movieId } });
  else
    await prisma.note.upsert({
      where: { userId_movieId: { userId: u.id, movieId } },
      update: { body: b },
      create: { userId: u.id, movieId, body: b },
    });
  refresh(movieId);
}

export async function sendFriendRequest(userId: string) {
  const u = await need();
  if (userId === u.id) return;
  if (!(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) throw new Error("User not found");
  const existing = await prisma.friendship.findFirst({
    where: { OR: [{ requesterId: u.id, addresseeId: userId }, { requesterId: userId, addresseeId: u.id }] },
  });
  if (!existing) {
    await prisma.friendship.create({ data: { requesterId: u.id, addresseeId: userId } });
    await createNotification(userId, u.id, "friend_request");
  } else if (existing.status === "PENDING" && existing.addresseeId === u.id) {
    await prisma.friendship.update({ where: { id: existing.id }, data: { status: "ACCEPTED" } });
    await createNotification(userId, u.id, "friend_accepted");
    await prisma.notification.deleteMany({ where: { userId: u.id, actorId: userId, type: "friend_request" } });
  }
  await limit(prisma.friendship.count({ where: { requesterId: u.id, createdAt: { gte: ago(3600) } } }), 20);
  revalidatePath("/friends");
  revalidatePath(`/u/${userId}`);
  await notify(userId, "friends");
}

export async function respondToRequest(id: string, accept: boolean) {
  const u = await need();
  const f = await prisma.friendship.findFirst({ where: { id, addresseeId: u.id, status: "PENDING" } });
  if (!f) return;
  if (accept) await prisma.friendship.update({ where: { id }, data: { status: "ACCEPTED" } });
  else await prisma.friendship.delete({ where: { id } });
  await prisma.notification.deleteMany({ where: { userId: u.id, actorId: f.requesterId, type: "friend_request" } });
  if (accept) await createNotification(f.requesterId, u.id, "friend_accepted");
  revalidatePath("/friends");
  revalidatePath(`/u/${f.requesterId}`);
  await notify(f.requesterId, "friends");
}

// unfriend, decline, or cancel a sent request
export async function removeFriendship(otherId: string) {
  const u = await need();
  await prisma.notification.deleteMany({
    where: { type: "friend_request", OR: [{ userId: otherId, actorId: u.id }, { userId: u.id, actorId: otherId }] },
  });
  await prisma.friendship.deleteMany({
    where: { OR: [{ requesterId: u.id, addresseeId: otherId }, { requesterId: otherId, addresseeId: u.id }] },
  });
  revalidatePath("/friends");
  revalidatePath(`/u/${otherId}`);
  await notify(otherId, "friends");
}

export async function sendMessage(toId: string, body: string, movie?: Snap): Promise<ChatMsg | null> {
  const u = await need();
  const friends = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: u.id, addresseeId: toId }, { requesterId: toId, addresseeId: u.id }],
    },
  });

  if (!friends) throw new Error("You can only message friends");

  await limit(prisma.message.count({ where: { senderId: u.id, createdAt: { gte: ago(60) } } }), 30);

  const b = body.trim().slice(0, 2000);

  if (!b && !movie) return null;

  const m = await prisma.message.create({
    data: {
      senderId: u.id,
      receiverId: toId,
      body: b,
      movieId: movie?.movieId,
      movieTitle: movie?.title,
      moviePoster: movie?.posterPath,
      movieYear: movie?.year,
    },
  });
  await notify(toId, "message", { fromId: u.id, msg: toChatMsg(m, toId) }); // pushed instantly to the receiver
  revalidatePath("/messages", "layout");
  return toChatMsg(m, u.id);
}

export async function setSavedVisibility(visible: boolean) {
  const u = await need();
  await prisma.user.update({ where: { id: u.id }, data: { savedVisible: visible } });
  revalidatePath("/library");
  revalidatePath(`/u/${u.id}`);
}

export async function setFolderVisibility(id: string, isPublic: boolean) {
  const u = await need();
  await prisma.folder.updateMany({ where: { id, userId: u.id }, data: { isPublic } });
  revalidatePath("/library");
}

export type ActorSnap = { personId: number; name: string; profilePath: string | null; department: string | null };

export async function toggleFavoriteActor(a: ActorSnap) {
  const u = await need();
  const del = await prisma.favoriteActor.deleteMany({ where: { userId: u.id, personId: a.personId } });
  if (del.count === 0)
    await prisma.favoriteActor.create({
      data: { userId: u.id, personId: a.personId, name: a.name, profilePath: a.profilePath, department: a.department },
    });
  revalidatePath(`/actor/${a.personId}`);
  revalidatePath("/library");
}