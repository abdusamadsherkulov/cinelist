import { prisma } from "./prisma";
import { notify } from "./realtime";

export async function createNotification(userId: string, actorId: string, type: "friend_request" | "friend_accepted") {
  if (userId === actorId) return;
  const dup = await prisma.notification.findFirst({ where: { userId, actorId, type, readAt: null } });
  if (!dup) await prisma.notification.create({ data: { userId, actorId, type } });
  await notify(userId, "notification");
}