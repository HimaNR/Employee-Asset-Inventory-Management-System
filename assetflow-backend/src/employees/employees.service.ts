import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeAssignmentsQueryDto } from './dto/employee-assignments-query.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  employeeAssignmentSelect,
  type EmployeeAssignmentRecord,
} from './employee-assignment.select';
import { employeeSelect, type EmployeeRecord } from './employee.select';
import { EmployeeResponse } from './interfaces/employee-response.interface';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Queries ----------------

  async findAll(query: EmployeeQueryDto): Promise<PaginatedResponse<EmployeeResponse>> {
    const where: Prisma.EmployeeWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.department) {
      where.department = { equals: query.department, mode: 'insensitive' };
    }
    if (query.search) {
      const contains = { contains: query.search, mode: 'insensitive' as const };
      where.OR = [
        { employeeCode: contains },
        { firstName: contains },
        { lastName: contains },
        { email: contains },
        { department: contains },
        { designation: contains },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        select: employeeSelect,
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: 'asc' }],
        ...toSkipTake(query.page, query.limit),
      }),
    ]);

    return paginate(rows.map(toEmployeeResponse), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<EmployeeResponse> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: employeeSelect,
    });
    if (!employee) throw employeeNotFound(id);
    return toEmployeeResponse(employee);
  }

  /** Distinct department names, A to Z (for filters and form suggestions) */
  async findDepartments(): Promise<string[]> {
    const rows = await this.prisma.employee.findMany({
      where: { department: { not: null } },
      distinct: ['department'],
      select: { department: true },
      orderBy: { department: 'asc' },
    });
    return rows.map((row) => row.department).filter((d): d is string => d !== null);
  }

  /** Assets this employee holds now (ACTIVE) and held before (RETURNED) */
  async findAssignments(
    id: string,
    query: EmployeeAssignmentsQueryDto,
  ): Promise<PaginatedResponse<EmployeeAssignmentRecord>> {
    await this.findOne(id); // 404 if the employee does not exist

    const where: Prisma.AssetAssignmentWhereInput = { employeeId: id };
    if (query.status) where.status = query.status;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.assetAssignment.count({ where }),
      this.prisma.assetAssignment.findMany({
        where,
        select: employeeAssignmentSelect,
        orderBy: [{ assignedAt: query.sortOrder }, { id: 'asc' }],
        ...toSkipTake(query.page, query.limit),
      }),
    ]);

    return paginate(rows, total, query.page, query.limit);
  }

  // ---------------- Commands ----------------

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    await this.assertCodeAvailable(dto.employeeCode);
    await this.assertEmailAvailable(dto.email);

    const employee = await this.prisma.employee.create({
      data: {
        employeeCode: dto.employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        department: dto.department,
        designation: dto.designation,
      },
      select: employeeSelect,
    });
    return toEmployeeResponse(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeResponse> {
    const current = await this.findOne(id);
    if (dto.email && dto.email !== current.email) {
      await this.assertEmailAvailable(dto.email, id);
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        department: dto.department,
        designation: dto.designation,
      },
      select: employeeSelect,
    });
    return toEmployeeResponse(employee);
  }

  /** Inactive employees cannot receive new assets (enforced in Phase 4) */
  async deactivate(id: string): Promise<EmployeeResponse> {
    const current = await this.findOne(id);

    if (current.status === 'INACTIVE') {
      throw new ConflictException({
        type: 'employee-already-inactive',
        title: 'Employee is already inactive',
        detail: `${current.fullName} is already inactive.`,
      });
    }

    // Business rule: nobody leaves while still holding company assets
    if (current.activeAssetCount > 0) {
      const held = await this.prisma.assetAssignment.findMany({
        where: { employeeId: id, status: 'ACTIVE' },
        select: { asset: { select: { assetCode: true } } },
        orderBy: { assignedAt: 'asc' },
      });
      const codes = held.map((a) => a.asset.assetCode);
      throw new ConflictException({
        type: 'employee-holds-assets',
        title: 'Employee still holds assets',
        detail: `${current.fullName} still holds ${codes.join(', ')}. Record the returns before deactivating.`,
        assetCodes: codes,
      });
    }

    return this.setStatus(id, 'INACTIVE');
  }

  async reactivate(id: string): Promise<EmployeeResponse> {
    const current = await this.findOne(id);
    if (current.status === 'ACTIVE') {
      throw new ConflictException({
        type: 'employee-already-active',
        title: 'Employee is already active',
        detail: `${current.fullName} is already active.`,
      });
    }
    return this.setStatus(id, 'ACTIVE');
  }

  // ---------------- Helpers ----------------

  private async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<EmployeeResponse> {
    const employee = await this.prisma.employee.update({
      where: { id },
      data: { status },
      select: employeeSelect,
    });
    return toEmployeeResponse(employee);
  }

  private async assertCodeAvailable(employeeCode: string): Promise<void> {
    const existing = await this.prisma.employee.findUnique({
      where: { employeeCode },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        type: 'employee-code-taken',
        title: 'Employee code already exists',
        detail: `An employee with code ${employeeCode} already exists.`,
      });
    }
  }

  /** Emails are compared case-insensitively */
  private async assertEmailAvailable(email: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.employee.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { employeeCode: true },
    });
    if (existing) {
      throw new ConflictException({
        type: 'employee-email-taken',
        title: 'Email already in use',
        detail: `${email} is already used by employee ${existing.employeeCode}.`,
      });
    }
  }
}

// ---------------- Pure functions ----------------

function employeeNotFound(id: string): NotFoundException {
  return new NotFoundException({
    type: 'employee-not-found',
    title: 'Employee not found',
    detail: `No employee exists with id ${id}.`,
  });
}

function toEmployeeResponse(record: EmployeeRecord): EmployeeResponse {
  const { _count, ...employee } = record;
  return {
    ...employee,
    fullName: `${employee.firstName} ${employee.lastName}`,
    activeAssetCount: _count.assignments,
  };
}
