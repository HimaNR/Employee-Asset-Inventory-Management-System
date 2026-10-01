import { clearSession, getSession } from '@/libs/session-storage';
import { ApiError } from './api-error';
import { httpRequest, type HttpRequest } from './http-transport';
import { getAccessToken, refreshAccessToken } from './refresh-manager';

type RequestOptions = Pick<HttpRequest, 'query' | 'headers' | 'signal'> & {
  /** false for login/refresh: no token attached, no automatic refresh */
  auth?: boolean;
};

/**
 * Adds "Authorization: Bearer <token>" and, on a 401, refreshes the token once and retries.
 * If the refresh fails, the session is cleared and the app returns to /login.
 */
async function send<T>(request: HttpRequest, auth: boolean, canRetry = true): Promise<T> {
  if (!auth) return httpRequest<T>(request);

  const token = await getAccessToken().catch(() => null);
  try {
    return await httpRequest<T>({
      ...request,
      headers: { ...request.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  } catch (error) {
    const isUnauthorized = error instanceof ApiError && error.status === 401;
    if (isUnauthorized && canRetry && getSession()) {
      await refreshAccessToken(); // throws (and signs out) if the refresh token is no good
      return send<T>(request, auth, false);
    }
    if (isUnauthorized) clearSession();
    throw error;
  }
}

function build(method: HttpRequest['method'], path: string, body: unknown, options?: RequestOptions) {
  const { auth = true, ...rest } = options ?? {};
  return { request: { method, path, body, ...rest } as HttpRequest, auth };
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => {
    const { request, auth } = build('GET', path, undefined, options);
    return send<T>(request, auth);
  },
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const { request, auth } = build('POST', path, body, options);
    return send<T>(request, auth);
  },
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const { request, auth } = build('PUT', path, body, options);
    return send<T>(request, auth);
  },
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const { request, auth } = build('PATCH', path, body, options);
    return send<T>(request, auth);
  },
  delete: <T = void>(path: string, options?: RequestOptions) => {
    const { request, auth } = build('DELETE', path, undefined, options);
    return send<T>(request, auth);
  },
};
