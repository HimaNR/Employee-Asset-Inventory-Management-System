import { clearSession, getSession, setSession } from '@/libs/session-storage';
import type { AuthTokens } from '@/types/auth.types';
import { httpRequest } from './http-transport';

/**
 * Single-flight refresh: if 5 requests fail with 401 at the same time,
 * only ONE POST /auth/refresh is sent and all 5 wait for it.
 */
let inFlight: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRefresh(): Promise<string> {
  const refreshToken = getSession()?.refreshToken;
  if (!refreshToken) throw new Error('Not signed in');

  try {
    const tokens = await httpRequest<AuthTokens>({
      method: 'POST',
      path: '/auth/refresh',
      body: { refreshToken },
    });
    setSession(tokens); // rotation: store the NEW refresh token
    return tokens.accessToken;
  } catch (error) {
    clearSession(); // refresh failed: the app shell sends the user to /login
    throw error;
  }
}

/** The current access token, refreshing first if we only have a refresh token */
export async function getAccessToken(): Promise<string | null> {
  const session = getSession();
  if (!session) return null;
  if (session.accessToken) return session.accessToken;
  return refreshAccessToken();
}
