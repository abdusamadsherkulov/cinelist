import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_SOCKET_URL;
  if (!url) return null;
  if (!socket) {
    socket = io(url, {
      transports: ["websocket", "polling"],
      // a fresh token is fetched on every (re)connect
      auth: (cb) => {
        fetch("/api/socket-token", { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => cb({ token: d.token }))
          .catch(() => cb({}));
      },
    });
  }
  return socket;
}