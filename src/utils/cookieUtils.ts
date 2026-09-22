/**
 * Cookie Management Utilities for Four Pieces Game
 * Ensures user account info and player preferences persist across sessions.
 */

export function setCookie(name: string, value: string, days: number = 60): void {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to set cookie:', err);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (err) {
    console.warn('Failed to read cookie:', err);
  }
  return null;
}

export function eraseCookie(name: string): void {
  try {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to erase cookie:', err);
  }
}
