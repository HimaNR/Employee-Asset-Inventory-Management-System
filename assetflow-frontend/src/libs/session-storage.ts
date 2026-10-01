import type { AuthTokens, UserProfile } from '@/types/auth.types';

/**
 * Where the session lives:
 * - access token: in MEMORY only (short-lived, never written to disk)
 * - refresh token + user profile: localStorage, so a page reload keeps you signed in
 * Production note: an httpOnly cookie for the refresh token is even safer (not readable by JS).
 */
const STORAGE_KEY = 'assetflow-session';

export interface Session {
  user: UserProfile;
  refreshToken: string;
  accessToken: string | null;
}

let session: Session | null = null;
let isLoaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (isLoaded || typeof window === 'undefined') return;
  isLoaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as { user: UserProfile; refreshToken: string };
      session = { ...stored, accessToken: null }; // a fresh access token is fetched on demand
    }
  } catch {
    session = null;
  }
}

function persist(): void {
  try {
    if (session) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: session.user, refreshToken: session.refreshToken }),
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage blocked: the session still works until the tab closes
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function getSession(): Session | null {
  load();
  return session;
}

export function setSession(tokens: AuthTokens): void {
  session = { user: tokens.user, refreshToken: tokens.refreshToken, accessToken: tokens.accessToken };
  persist();
  emit();
}

export function clearSession(): void {
  session = null;
  persist();
  emit();
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  // Signing out in another tab signs you out here too
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    isLoaded = false;
    session = null;
    load();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
