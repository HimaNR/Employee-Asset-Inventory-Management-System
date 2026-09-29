import { httpRequest, type HttpRequest } from './http-transport';

type RequestOptions = Pick<HttpRequest, 'query' | 'headers' | 'signal'>;

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    httpRequest<T>({ method: 'GET', path, ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    httpRequest<T>({ method: 'POST', path, body, ...options }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    httpRequest<T>({ method: 'PUT', path, body, ...options }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    httpRequest<T>({ method: 'PATCH', path, body, ...options }),

  delete: <T = void>(path: string, options?: RequestOptions) =>
    httpRequest<T>({ method: 'DELETE', path, ...options }),
};
