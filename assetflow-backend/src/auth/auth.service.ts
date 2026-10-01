import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { createHash, randomUUID } from 'node:crypto';
import { EmployeeAssignmentsQueryDto } from '../employees/dto/employee-assignments-query.dto';
import { EmployeesService } from '../employees/employees.service';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
  RefreshTokenPayload,
} from './interfaces/authenticated-user.interface';

const authUserSelect = {
  id: true,
  email: true,
  status: true,
  passwordHash: true,
  refreshTokenHash: true,
  role: { select: { name: true, permissions: true } },
  employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
} satisfies Prisma.UserSelect;

type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  employee: { id: string; employeeCode: string; fullName: string } | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds */
  expiresIn: number;
  user: UserProfile;
}

/** Refresh tokens are stored as a SHA-256 hash, never in plain text */
function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function unauthorized(detail: string): UnauthorizedException {
  return new UnauthorizedException({ type: 'unauthorized', title: 'Not signed in', detail });
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly employees: EmployeesService,
  ) {}

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email }, select: authUserSelect });

    // One generic message for "no such user", "inactive" and "wrong password",
    // so attackers cannot discover which emails exist
    const isValid =
      user !== null && user.status === 'ACTIVE' && (await compare(password, user.passwordHash));
    if (!isValid) throw unauthorized('Invalid email or password.');

    return this.issueTokens(user, { isLogin: true });
  }

  /** Rotation: every refresh returns a NEW refresh token and invalidates the old one */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('auth.refreshSecret'),
      });
    } catch {
      throw unauthorized('Your session has expired. Please sign in again.');
    }
    if (payload.type !== 'refresh') throw unauthorized('Invalid refresh token.');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: authUserSelect,
    });
    if (!user || user.status !== 'ACTIVE' || !user.refreshTokenHash) {
      throw unauthorized('Your session has ended. Please sign in again.');
    }

    if (sha256(refreshToken) !== user.refreshTokenHash) {
      // An OLD refresh token was used again: it may have been stolen.
      // Revoke the session completely; the real user just signs in again.
      await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: null } });
      throw unauthorized('Your session was revoked. Please sign in again.');
    }

    return this.issueTokens(user, { isLogin: false });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async me(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: authUserSelect });
    if (!user || user.status !== 'ACTIVE') throw unauthorized('Your account is not active.');
    return toProfile(user);
  }

  /** Brief: "Employee ... may view assets currently assigned to them" */
  async myAssets(user: AuthenticatedUser) {
    if (!user.employeeId) {
      return { data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 1 } };
    }
    const query = Object.assign(new EmployeeAssignmentsQueryDto(), {
      status: 'ACTIVE' as const,
      page: 1,
      limit: 100,
      sortOrder: 'desc' as const,
    });
    return this.employees.findAssignments(user.employeeId, query);
  }

  private async issueTokens(user: AuthUser, options: { isLogin: boolean }): Promise<AuthTokens> {
    const accessTtl = this.config.getOrThrow<number>('auth.accessTtlSeconds');
    const refreshTtl = this.config.getOrThrow<number>('auth.refreshTtlSeconds');

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
      employeeId: user.employee?.id ?? null,
    };
    const refreshPayload: RefreshTokenPayload = { sub: user.id, type: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.getOrThrow<string>('auth.accessSecret'),
        expiresIn: accessTtl,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.getOrThrow<string>('auth.refreshSecret'),
        expiresIn: refreshTtl,
        jwtid: randomUUID(), // makes every refresh token unique
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: sha256(refreshToken),
        ...(options.isLogin ? { lastLoginAt: new Date() } : {}),
      },
    });

    return { accessToken, refreshToken, expiresIn: accessTtl, user: toProfile(user) };
  }
}

function toProfile(user: AuthUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    role: user.role.name,
    permissions: user.role.permissions,
    employee: user.employee
      ? {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          fullName: `${user.employee.firstName} ${user.employee.lastName}`,
        }
      : null,
  };
}
