import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { AssetHistoryService } from '../asset-history/asset-history.service';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { toAssignmentResponse } from './assignment.mapper';
import { assignmentSelect } from './assignment.select';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentResponse } from './interfaces/assignment-response.interface';

/** Small tolerance for clocks that are slightly out of sync */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly history: AssetHistoryService,
  ) {}

  // ---------------- Queries ----------------

  async findAll(query: AssignmentQueryDto): Promise<PaginatedResponse<AssignmentResponse>> {
    const where: Prisma.AssetAssignmentWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.assetId) where.assetId = query.assetId;
    if (query.from || query.to) {
      where.assignedAt = {
        ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
        ...(query.to ? { lt: nextDay(query.to) } : {}),
      };
    }
    if (query.search) {
      const contains = { contains: query.search, mode: 'insensitive' as const };
      where.OR = [
        { asset: { assetCode: contains } },
        { asset: { name: contains } },
        { employee: { employeeCode: contains } },
        { employee: { firstName: contains } },
        { employee: { lastName: contains } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.assetAssignment.count({ where }),
      this.prisma.assetAssignment.findMany({
        where,
        select: assignmentSelect,
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: 'asc' }],
        ...toSkipTake(query.page, query.limit),
      }),
    ]);

    return paginate(rows.map(toAssignmentResponse), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<AssignmentResponse> {
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id },
      select: assignmentSelect,
    });
    if (!assignment) {
      throw new NotFoundException({
        type: 'assignment-not-found',
        title: 'Assignment not found',
        detail: `No assignment exists with id ${id}.`,
      });
    }
    return toAssignmentResponse(assignment);
  }

  // ---------------- The assignment workflow ----------------

  /**
   * PDF "Required service behavior":
   * 1. employee exists and is ACTIVE
   * 2. asset exists and is AVAILABLE
   * 3. ONE transaction: create assignment + asset -> ASSIGNED + history ASSIGNED
   */
  async create(dto: CreateAssignmentDto): Promise<AssignmentResponse> {
    const assignedAt = dto.assignedAt ? new Date(dto.assignedAt) : new Date();
    if (assignedAt.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      throw new BadRequestException({
        type: 'invalid-assignment-date',
        title: 'Invalid assignment date',
        detail: 'assignedAt cannot be in the future.',
      });
    }

    // ---- 1. Employee must exist and be active ----
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      select: { id: true, employeeCode: true, firstName: true, lastName: true, status: true },
    });
    if (!employee) {
      throw new NotFoundException({
        type: 'employee-not-found',
        title: 'Employee not found',
        detail: `No employee exists with id ${dto.employeeId}.`,
      });
    }
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    if (employee.status !== 'ACTIVE') {
      throw new ConflictException({
        type: 'employee-inactive',
        title: 'Employee is inactive',
        detail: `${employeeName} (${employee.employeeCode}) is inactive and cannot receive assets.`,
      });
    }

    // ---- 2. Asset must exist, be active and AVAILABLE ----
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
      select: { id: true, assetCode: true, status: true, isActive: true },
    });
    if (!asset) {
      throw new NotFoundException({
        type: 'asset-not-found',
        title: 'Asset not found',
        detail: `No asset exists with id ${dto.assetId}.`,
      });
    }
    if (!asset.isActive) {
      throw new ConflictException({
        type: 'asset-inactive',
        title: 'Asset is deactivated',
        detail: `Asset ${asset.assetCode} is deactivated. Reactivate it before assigning.`,
      });
    }
    if (asset.status !== 'AVAILABLE') {
      throw assetNotAvailable(asset.assetCode, asset.status);
    }

    // ---- 3. One transaction: all three writes succeed, or none ----
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        // Conditional update = optimistic lock: only flips if STILL available.
        // If another request assigned it a millisecond ago, count is 0.
        const flipped = await tx.asset.updateMany({
          where: { id: asset.id, status: 'AVAILABLE', isActive: true },
          data: { status: 'ASSIGNED' },
        });
        if (flipped.count === 0) {
          throw assetNotAvailable(asset.assetCode, 'ASSIGNED');
        }

        const assignment = await tx.assetAssignment.create({
          data: {
            assetId: asset.id,
            employeeId: employee.id,
            assignedAt,
            notes: dto.notes,
            // assignedById is filled in once login exists (security phase)
          },
          select: assignmentSelect,
        });

        await this.history.record(tx, {
          assetId: asset.id,
          assignmentId: assignment.id,
          action: 'ASSIGNED',
          previousStatus: 'AVAILABLE',
          newStatus: 'ASSIGNED',
          description: `Assigned to ${employeeName} (${employee.employeeCode})`,
          metadata: { employeeId: employee.id },
        });

        return assignment;
      });

      return toAssignmentResponse(created);
    } catch (error) {
      // Last line of defence: the partial unique index (one ACTIVE per asset)
      if (isUniqueViolation(error)) {
        throw assetNotAvailable(asset.assetCode, 'ASSIGNED');
      }
      throw error;
    }
  }
}

// ---------------- Pure functions ----------------

/** Matches the error example in the assessment PDF */
function assetNotAvailable(assetCode: string, status: string): ConflictException {
  const reason =
    status === 'ASSIGNED'
      ? 'is currently assigned and cannot be assigned again'
      : `is ${status.replace('_', ' ').toLowerCase()} and cannot be assigned`;
  return new ConflictException({
    type: 'asset-not-available',
    title: 'Asset is not available',
    detail: `Asset ${assetCode} ${reason}.`,
  });
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}

function nextDay(dateOnly: string): Date {
  const date = new Date(`${dateOnly}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}
