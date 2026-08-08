export function getAuthTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("fintrail-token="));

  if (!cookie) return null;
  return decodeURIComponent(cookie.split("=")[1] ?? "");
}

export function setAuthTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `fintrail-token=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "fintrail-token=; Path=/; Max-Age=0; SameSite=Lax";
}
