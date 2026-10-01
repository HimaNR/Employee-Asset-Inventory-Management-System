import { Injectable } from '@nestjs/common';
import { ALL_PERMISSIONS } from '../common/constants/permissions.constant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        _count: { select: { users: true } },
      },
    });
    return roles.map(({ _count, ...role }) => ({ ...role, userCount: _count.users }));
  }

  /** Every permission that exists (for the permission matrix) */
  permissions(): string[] {
    return ALL_PERMISSIONS;
  }
}
