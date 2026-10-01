import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../interfaces/authenticated-user.interface';

/**
 * Global guard: every route needs "Authorization: Bearer <access token>"
 * unless it is marked @Public().
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw unauthorized('Sign in to continue.');
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('auth.accessSecret'),
      });
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        employeeId: payload.employeeId,
      };
      return true;
    } catch {
      // Expired or tampered token: the frontend will try a refresh
      throw unauthorized('Your session has expired. Please sign in again.');
    }
  }
}

function unauthorized(detail: string): UnauthorizedException {
  return new UnauthorizedException({ type: 'unauthorized', title: 'Not signed in', detail });
}
