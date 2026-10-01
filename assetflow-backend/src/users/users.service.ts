import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import type { Prisma } from '../generated/prisma/client';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponse } from './interfaces/user-response.interface';
import { userSelect, type UserRecord } from './user.select';

/** bcrypt work factor: higher = slower to crack (and to check) */
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto): Promise<PaginatedResponse<UserResponse>> {
    const where: Prisma.UserWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.roleId) where.roleId = query.roleId;
    if (query.search) {
      const contains = { contains: query.search, mode: 'insensitive' as const };
      where.OR = [
        { email: contains },
        { employee: { firstName: contains } },
        { employee: { lastName: contains } },
        { employee: { employeeCode: contains } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: [toOrderBy(query), { id: 'asc' }],
        ...toSkipTake(query.page, query.limit),
      }),
    ]);
    return paginate(rows.map(toUserResponse), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) {
      throw new NotFoundException({
        type: 'user-not-found',
        title: 'User not found',
        detail: `No user exists with id ${id}.`,
      });
    }
    return toUserResponse(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponse> {
    await this.assertEmailAvailable(dto.email);
    const roleName = await this.assertRoleExists(dto.roleId);
    assertEmployeeLinkForRole(roleName, dto.employeeId ?? null);
    if (dto.employeeId) await this.assertEmployeeLinkable(dto.employeeId);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: await hash(dto.password, BCRYPT_ROUNDS),
        roleId: dto.roleId,
        employeeId: dto.employeeId ?? null,
      },
      select: userSelect,
    });
    return toUserResponse(user);
  }

  async update(id: string, dto: UpdateUserDto, actorId: string): Promise<UserResponse> {
    const current = await this.findOne(id);

    // Protects against locking yourself out
    if (id === actorId && (dto.status === 'INACTIVE' || dto.roleId !== undefined)) {
      throw new ConflictException({
        type: 'cannot-modify-self',
        title: 'Cannot change your own access',
        detail: 'Ask another administrator to change your role or deactivate your account.',
      });
    }
    const roleName = dto.roleId ? await this.assertRoleExists(dto.roleId) : current.role.name;
    const employeeId = dto.employeeId !== undefined ? dto.employeeId : (current.employee?.id ?? null);
    assertEmployeeLinkForRole(roleName, employeeId);
    if (dto.employeeId) await this.assertEmployeeLinkable(dto.employeeId, id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        roleId: dto.roleId,
        status: dto.status,
        employeeId: dto.employeeId,
        // A deactivated user is signed out everywhere
        ...(dto.status === 'INACTIVE' ? { refreshTokenHash: null } : {}),
      },
      select: userSelect,
    });
    return toUserResponse(user);
  }

  /** Admin sets a new password; existing sessions end */
  async setPassword(id: string, password: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await hash(password, BCRYPT_ROUNDS), refreshTokenHash: null },
    });
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        type: 'user-email-taken',
        title: 'Email already in use',
        detail: `A user with email ${email} already exists.`,
      });
    }
  }

  /** Returns the role name so callers can apply role-specific rules */
  private async assertRoleExists(roleId: string): Promise<string> {
    const role = await this.prisma.role.findUnique({ where: { id: roleId }, select: { name: true } });
    if (!role) {
      throw new BadRequestException({
        type: 'role-not-found',
        title: 'Role not found',
        detail: `No role exists with id ${roleId}.`,
      });
    }
    return role.name;
  }

  /** One login per employee (User.employeeId is unique) */
  private async assertEmployeeLinkable(employeeId: string, excludeUserId?: string): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { employeeCode: true, user: { select: { id: true, email: true } } },
    });
    if (!employee) {
      throw new BadRequestException({
        type: 'employee-not-found',
        title: 'Employee not found',
        detail: `No employee exists with id ${employeeId}.`,
      });
    }
    if (employee.user && employee.user.id !== excludeUserId) {
      throw new ConflictException({
        type: 'employee-already-linked',
        title: 'Employee already has a login',
        detail: `${employee.employeeCode} is already linked to ${employee.user.email}.`,
      });
    }
  }
}

/**
 * The Employee role can only open "My assets", which needs a linked employee.
 * Without the link the account could sign in but see nothing.
 */
function assertEmployeeLinkForRole(roleName: string, employeeId: string | null): void {
  if (roleName === 'EMPLOYEE' && !employeeId) {
    throw new BadRequestException({
      type: 'employee-link-required',
      title: 'Employee link required',
      detail: 'Users with the Employee role must be linked to an employee record.',
    });
  }
}

/**
 * "nulls: last" is only allowed on NULLABLE columns (lastLoginAt).
 * Users who never signed in go to the end, whatever the direction.
 */
function toOrderBy(query: UserQueryDto): Prisma.UserOrderByWithRelationInput {
  if (query.sortBy === 'lastLoginAt') {
    return { lastLoginAt: { sort: query.sortOrder, nulls: 'last' } };
  }
  return { [query.sortBy]: query.sortOrder };
}

function toUserResponse(record: UserRecord): UserResponse {
  const { employee, ...user } = record;
  return {
    ...user,
    employee: employee
      ? {
          id: employee.id,
          employeeCode: employee.employeeCode,
          fullName: `${employee.firstName} ${employee.lastName}`,
        }
      : null,
  };
}
