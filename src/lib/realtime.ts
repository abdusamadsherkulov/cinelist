export async function notify(to: string, event: "message" | "friends" | "notification", payload: unknown = {}) {
  const url = process.env.SOCKET_URL;
  const secret = process.env.SOCKET_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ to, event, payload }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    /* socket server offline: chat falls back to slow polling */
  }
}