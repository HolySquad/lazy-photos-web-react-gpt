export function setAuthSession(
  accessToken: string,
  refreshToken: string,
  username: string,
) {
  const base = "path=/; secure; samesite=strict";
  // short-lived access token (~15m)
  document.cookie = `accessToken=${encodeURIComponent(
    accessToken,
  )}; ${base}; max-age=${60 * 15}`;
  // longer refresh token & username (~7d)
  const longLived = `${base}; max-age=${60 * 60 * 24 * 7}`;
  document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; ${longLived}`;
  document.cookie = `username=${encodeURIComponent(username)}; ${longLived}`;
}

export function clearAuthSession() {
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "refreshToken=; path=/; max-age=0";
  document.cookie = "username=; path=/; max-age=0";
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}
