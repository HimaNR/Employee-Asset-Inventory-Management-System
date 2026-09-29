import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { problemType } from '../constants/problem-types.constant';
import { Problem, ProblemDetails } from '../interfaces/problem-details.interface';
import { getRequestId } from '../middleware/request-id.middleware';


// Fields Nest adds automatically; we don't copy them as extensions
const RESERVED_KEYS = new Set([
  'statusCode',
  'error',
  'message',
  'type',
  'title',
  'detail',
  'status',
]);

@Catch() // no argument = catch EVERYTHING
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const problem = this.toProblem(exception);
    const body: ProblemDetails = {
      ...problem,
      instance: req.originalUrl,
      requestId: getRequestId(req),
    };

    // Stack traces only for unexpected errors (real bugs), not intentional HttpExceptions
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `${req.method} ${req.originalUrl} [${body.requestId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(problem.status).type('application/problem+json').json(body);
  }

  private toProblem(exception: unknown): Problem {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }
    if (isPrismaKnownError(exception)) {
      return this.fromPrismaError(exception);
    }
    return {
      type: problemType('internal-error'),
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred. Please try again later.',
    };
  }

  private fromHttpException(exception: HttpException): Problem {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const base: Problem = {
      type: problemType(slugFromStatus(status)),
      title: titleFromStatus(status),
      status,
      detail: exception.message,
    };

    if (typeof response === 'string') {
      return { ...base, detail: response };
    }

    const r = response as Record<string, unknown>;

    // ValidationPipe errors → { message: string[] }
    if (Array.isArray(r.message)) {
      return {
        ...base,
        type: problemType('validation-error'),
        title: 'Validation failed',
        detail: 'One or more fields are invalid.',
        errors: r.message.map(String),
      };
    }

    // Our own exceptions: throw new ConflictException({ type, title, detail, ...extras })
    const extensions = Object.fromEntries(
      Object.entries(r).filter(([key]) => !RESERVED_KEYS.has(key)),
    );

    return {
      ...extensions,
      type: typeof r.type === 'string' ? problemType(r.type) : base.type,
      title: typeof r.title === 'string' ? r.title : base.title,
      status,
      detail:
        typeof r.detail === 'string'
          ? r.detail
          : typeof r.message === 'string'
            ? r.message
            : base.detail,
    };
  }

  private fromPrismaError(error: PrismaKnownError): Problem {
    switch (error.code) {
      case 'P2002': // unique constraint
        return {
          type: problemType('unique-violation'),
          title: 'Duplicate value',
          status: HttpStatus.CONFLICT,
          detail: 'A record with the same unique value already exists.',
        };
      case 'P2003': // foreign key constraint
        return {
          type: problemType('foreign-key-violation'),
          title: 'Related record constraint failed',
          status: HttpStatus.CONFLICT,
          detail: 'The operation references a record that does not exist or is still in use.',
        };
      case 'P2025': // record not found
        return {
          type: problemType('not-found'),
          title: 'Resource not found',
          status: HttpStatus.NOT_FOUND,
          detail: 'The requested record does not exist.',
        };
      default:
        this.logger.error(`Unhandled Prisma error ${error.code}`);
        return {
          type: problemType('database-error'),
          title: 'Database error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: 'A database error occurred. Please try again later.',
        };
    }
  }
}

// ---------- helpers ----------

type PrismaKnownError = { code: string; meta?: Record<string, unknown> };

function isPrismaKnownError(e: unknown): e is PrismaKnownError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof (e as { code: unknown }).code === 'string' &&
    /^P\d{4}$/.test((e as { code: string }).code)
  );
}

// 404 → "NOT_FOUND" → "Not Found"
function titleFromStatus(status: number): string {
  const name = HttpStatus[status] as string | undefined;
  if (!name) return 'Error';
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// 404 → "not-found"
function slugFromStatus(status: number): string {
  const name = HttpStatus[status] as string | undefined;
  return name ? name.toLowerCase().replace(/_/g, '-') : 'error';
}