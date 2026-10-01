import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetHistoryService } from '../asset-history/asset-history.service';
import { toAssignmentResponse } from '../assignments/assignment.mapper';
import { assignmentSelect } from '../assignments/assignment.select';
import { AssignmentResponse } from '../assignments/interfaces/assignment-response.interface';
import { statusAfterReturn, statusLabel } from '../common/constants/asset-status.constant';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly history: AssetHistoryService,
  ) {}

  /**
   * Brief's return workflow:
   * validate active assignment -> set returnedAt / returnCondition
   * -> calculate next asset status -> write AssetHistory -> ONE transaction
   */
  async create(dto: CreateReturnDto, actorId: string): Promise<AssignmentResponse> {
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id: dto.assignmentId },
      select: {
        id: true,
        status: true,
        assignedAt: true,
        asset: { select: { id: true, assetCode: true, status: true } },
        employee: { select: { employeeCode: true, firstName: true, lastName: true } },
      },
    });
    if (!assignment) {
      throw new NotFoundException({
        type: 'assignment-not-found',
        title: 'Assignment not found',
        detail: `No assignment exists with id ${dto.assignmentId}.`,
      });
    }
    if (assignment.status !== 'ACTIVE') {
      throw alreadyReturned(assignment.asset.assetCode);
    }

    const returnedAt = dto.returnedAt ? new Date(dto.returnedAt) : new Date();
    if (returnedAt.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      throw invalidReturnDate('returnedAt cannot be in the future.');
    }
    if (returnedAt < assignment.assignedAt) {
      throw invalidReturnDate('returnedAt cannot be earlier than the assignment date.');
    }

    const nextStatus = statusAfterReturn(dto.condition);
    const employeeName = `${assignment.employee.firstName} ${assignment.employee.lastName}`;

    const returned = await this.prisma.$transaction(async (tx) => {
      // Optimistic lock: only closes the assignment if it is STILL active
      const closed = await tx.assetAssignment.updateMany({
        where: { id: assignment.id, status: 'ACTIVE' },
        data: {
          status: 'RETURNED',
          returnedAt,
          returnCondition: dto.condition,
          returnNotes: dto.notes,
          returnedById: actorId, // who received it back
        },
      });
      if (closed.count === 0) {
        throw alreadyReturned(assignment.asset.assetCode);
      }

      await tx.asset.update({
        where: { id: assignment.asset.id },
        data: { status: nextStatus, condition: dto.condition },
      });

      await this.history.record(tx, {
        assetId: assignment.asset.id,
        assignmentId: assignment.id,
        action: 'RETURNED',
        previousStatus: assignment.asset.status,
        newStatus: nextStatus,
        description: `Returned by ${employeeName} (${assignment.employee.employeeCode}) in ${statusLabel(
          dto.condition,
        )} condition`,
        metadata: { condition: dto.condition, ...(dto.notes ? { notes: dto.notes } : {}) },
        performedById: actorId,
      });

      return tx.assetAssignment.findUniqueOrThrow({
        where: { id: assignment.id },
        select: assignmentSelect,
      });
    });

    return toAssignmentResponse(returned);
  }
}

function alreadyReturned(assetCode: string): ConflictException {
  return new ConflictException({
    type: 'assignment-not-active',
    title: 'Assignment is not active',
    detail: `This assignment of ${assetCode} has already been returned.`,
  });
}

function invalidReturnDate(detail: string): BadRequestException {
  return new BadRequestException({
    type: 'invalid-return-date',
    title: 'Invalid return date',
    detail,
  });
}
