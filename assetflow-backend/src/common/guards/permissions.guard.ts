import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** Runs AFTER JwtAuthGuard: checks the @Permissions() of the route */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, targets);
    if (!required || required.length === 0) return true; // logged in is enough

    const user = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>().user;
    const missing = required.filter((p) => !user?.permissions.includes(p));
    if (missing.length > 0) {
      throw new ForbiddenException({
        type: 'forbidden',
        title: 'Not allowed',
        detail: `Your role (${user?.role ?? 'none'}) cannot do this. Missing: ${missing.join(', ')}.`,
      });
    }
    return true;
  }
}
