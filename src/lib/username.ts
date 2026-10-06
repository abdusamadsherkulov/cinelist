export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(v: string) {
  return v.trim().toLowerCase().replace(/^@/, "");
}

export function usernameError(u: string): string | null {
  if (u.length < 3) return "At least 3 characters";
  if (u.length > 20) return "At most 20 characters";
  if (!USERNAME_RE.test(u)) return "Only letters, numbers and underscores";
  return null;
}