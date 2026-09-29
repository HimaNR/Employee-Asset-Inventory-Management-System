import { apiConfig } from '@/config/api.config';
import { ApiError } from './api-error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryValue = string | number | boolean | null | undefined;

export interface HttpRequest {
  method: HttpMethod;
  path: string; // relative, e.g. "/assets"
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** The ONLY place in the frontend that calls fetch() */
export async function httpRequest<T>(request: HttpRequest): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(apiConfig.timeoutMs);
  const signal = request.signal
    ? AbortSignal.any([request.signal, timeoutSignal])
    : timeoutSignal;
  const hasBody = request.body !== undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(request.path, request.query), {
      method: request.method,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...request.headers,
      },
      body: hasBody ? JSON.stringify(request.body) : undefined,
      signal,
      cache: 'no-store',
    });
  } catch (error) {
    if (request.signal?.aborted) throw error; // cancelled by the caller
    if (timeoutSignal.aborted) throw ApiError.timeout();
    throw ApiError.network();
  }

  const requestId = response.headers.get('x-request-id') ?? undefined;
  const data = await parseBody(response);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, data, requestId);
  }
  return data as T;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path, apiConfig.baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  // matches application/json AND application/problem+json
  if (contentType.includes('json')) return response.json();
  const text = await response.text();
  return text || undefined;
}
