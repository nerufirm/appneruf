export type StaffSession = { id: string; name: string };

const COOKIE_NAME = "appsheetto_staff";

export function getStaffFromCookie(): StaffSession | null {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/appsheetto_staff=([^;]+)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

export function setStaffCookie(staff: StaffSession): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(staff))};path=/;max-age=86400`;
}

export function clearStaffCookie(): void {
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`;
}
