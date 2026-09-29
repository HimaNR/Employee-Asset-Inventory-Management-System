import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

// Accept a client-provided ID only if it's short and safe
const VALID_REQUEST_ID = /^[A-Za-z0-9_-]{1,100}$/;

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId =
    incoming && VALID_REQUEST_ID.test(incoming)
      ? incoming
      : `req_${randomUUID().replace(/-/g, '')}`;

  req.headers[REQUEST_ID_HEADER] = requestId; // readable later in the request
  res.setHeader(REQUEST_ID_HEADER, requestId); // returned to the client
  next();
}

export function getRequestId(req: Request): string {
  const value = req.headers[REQUEST_ID_HEADER];
  return typeof value === 'string' ? value : 'unknown';
}