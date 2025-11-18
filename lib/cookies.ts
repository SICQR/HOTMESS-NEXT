// Tiny cookie helpers (client-aware) for age gate & consent.
// All functions safely no-op server-side.

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const re = new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/\+^])/g, '\$1') + '=([^;]*)');
  const match = document.cookie.match(re);
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  setCookie(name, '', -1);
}

export function isCookieTrue(name: string): boolean {
  return getCookie(name) === '1';
}

const cookies = { setCookie, getCookie, deleteCookie, isCookieTrue };
export default cookies;