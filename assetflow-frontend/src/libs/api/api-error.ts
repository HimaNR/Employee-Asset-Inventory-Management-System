import type { ProblemDetails } from '@/types/api.types';

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly title: string;
  readonly detail: string;
  readonly errors: string[];
  readonly requestId?: string;
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = 'ApiError';
    this.status = problem.status;
    this.type = problem.type;
    this.title = problem.title;
    this.detail = problem.detail;
    this.errors = problem.errors ?? [];
    this.requestId = problem.requestId;
    this.problem = problem;
  }

  get isValidationError(): boolean {
    return this.status === 400 && this.errors.length > 0;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isConflict(): boolean {
    return this.status === 409;
  }
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** Server answered with an error status */
  static fromResponse(status: number, body: unknown, requestId?: string): ApiError {
    if (isProblemDetails(body)) {
      return new ApiError({ ...body, requestId: body.requestId ?? requestId });
    }
    return new ApiError({
      type: 'about:blank',
      title: `Request failed (${status})`,
      status,
      detail:
        typeof body === 'string' && body
          ? body
          : 'The server returned an unexpected response.',
      requestId,
    });
  }

  /** Server could not be reached at all */
  static network(): ApiError {
    return new ApiError({
      type: 'network-error',
      title: 'Cannot reach the server',
      status: 0,
      detail: 'Check that the API is running and try again.',
    });
  }

  static timeout(): ApiError {
    return new ApiError({
      type: 'timeout',
      title: 'Request timed out',
      status: 0,
      detail: 'The server took too long to respond. Please try again.',
    });
  }

  /** Normalise anything caught in a try/catch into an ApiError */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    return new ApiError({
      type: 'client-error',
      title: 'Unexpected error',
      status: 0,
      detail: error instanceof Error ? error.message : 'Something went wrong.',
    });
  }
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ProblemDetails).status === 'number' &&
    typeof (value as ProblemDetails).title === 'string'
  );
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
