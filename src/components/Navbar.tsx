import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "./AppNav";

export default async function Navbar() {
  const user = await getUser();
  const [unread, requests, notifications] = user
    ? await Promise.all([
        prisma.message.count({ where: { receiverId: user.id, readAt: null } }),
        prisma.friendship.count({ where: { addresseeId: user.id, status: "PENDING" } }),
        prisma.notification.count({ where: { userId: user.id, readAt: null } }),
      ])
    : [0, 0, 0];

  return <AppNav user={user} unread={unread} requests={requests} notifications={notifications} />;
}