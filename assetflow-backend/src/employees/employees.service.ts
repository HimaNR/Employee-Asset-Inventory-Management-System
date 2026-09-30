import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { employeeSelect, type EmployeeRecord } from './employee.select';
import { EmployeeResponse } from './interfaces/employee-response.interface';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

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
    if (!employee) {
      throw new NotFoundException({
        type: 'employee-not-found',
        title: 'Employee not found',
        detail: `No employee exists with id ${id}.`,
      });
    }
    return toEmployeeResponse(employee);
  }
}

function toEmployeeResponse(record: EmployeeRecord): EmployeeResponse {
  const { _count, ...employee } = record;
  return {
    ...employee,
    fullName: `${employee.firstName} ${employee.lastName}`,
    activeAssetCount: _count.assignments,
  };
}
