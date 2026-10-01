import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { AssetHistoryService } from '../asset-history/asset-history.service';
import { CategoriesService } from '../categories/categories.service';
import {
  MANUAL_STATUS_TRANSITIONS,
  canChangeStatus,
  statusLabel,
} from '../common/constants/asset-status.constant';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { parseDateOnly } from '../common/utils/date.util';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { toAssetResponse } from './asset.mapper';
import { assetSelect } from './asset.select';
import { AssetQueryDto } from './dto/asset-query.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetResponse } from './interfaces/asset-response.interface';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
    private readonly history: AssetHistoryService,
  ) {}

  // ---------------- Queries ----------------

  async findAll(query: AssetQueryDto): Promise<PaginatedResponse<AssetResponse>> {
    const where: Prisma.AssetWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.condition) where.condition = query.condition;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.employeeId) {
      // "assets this employee currently holds"
      where.assignments = { some: { employeeId: query.employeeId, status: 'ACTIVE' } };
    }
    if (query.search) {
      const contains = { contains: query.search, mode: 'insensitive' as const };
      where.OR = [
        { assetCode: contains },
        { name: contains },
        { serialNumber: contains },
        { brand: contains },
        { model: contains },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.asset.count({ where }),
      this.prisma.asset.findMany({
        where,
        select: assetSelect,
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: 'asc' }],
        ...toSkipTake(query.page, query.limit),
      }),
    ]);

    return paginate(rows.map(toAssetResponse), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<AssetResponse> {
    const asset = await this.prisma.asset.findUnique({ where: { id }, select: assetSelect });
    if (!asset) throw assetNotFound(id);
    return toAssetResponse(asset);
  }

  // ---------------- Commands ----------------

  async create(dto: CreateAssetDto, actorId: string): Promise<AssetResponse> {
    await this.categories.assertUsable(dto.categoryId);
    await this.assertAssetCodeAvailable(dto.assetCode);
    if (dto.serialNumber) await this.assertSerialAvailable(dto.serialNumber);
    assertWarrantyAfterPurchase(dto.purchaseDate, dto.warrantyExpiryDate);

    // Asset + CREATED history row: both saved, or neither
    const asset = await this.prisma.$transaction(async (tx) => {
      const created = await tx.asset.create({
        data: {
          assetCode: dto.assetCode,
          name: dto.name,
          serialNumber: dto.serialNumber,
          brand: dto.brand,
          model: dto.model,
          categoryId: dto.categoryId,
          condition: dto.condition,
          purchaseDate: parseDateOnly(dto.purchaseDate),
          purchasePrice: dto.purchasePrice,
          warrantyExpiryDate: parseDateOnly(dto.warrantyExpiryDate),
          notes: dto.notes,
        },
        select: assetSelect,
      });

      await this.history.record(tx, {
        assetId: created.id,
        action: 'CREATED',
        newStatus: created.status,
        description: `Asset ${created.assetCode} registered`,
        performedById: actorId,
      });

      return created;
    });

    return toAssetResponse(asset);
  }

  async update(id: string, dto: UpdateAssetDto, actorId: string): Promise<AssetResponse> {
    const current = await this.findOne(id);

    if (dto.categoryId && dto.categoryId !== current.category.id) {
      await this.categories.assertUsable(dto.categoryId);
    }
    if (dto.serialNumber && dto.serialNumber !== current.serialNumber) {
      await this.assertSerialAvailable(dto.serialNumber, id);
    }
    assertWarrantyAfterPurchase(
      dto.purchaseDate !== undefined ? dto.purchaseDate : current.purchaseDate,
      dto.warrantyExpiryDate !== undefined ? dto.warrantyExpiryDate : current.warrantyExpiryDate,
    );

    const changedFields = findChangedFields(current, dto);
    if (changedFields.length === 0) {
      return current; // nothing changed: no write, no history noise
    }

    const asset = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.asset.update({
        where: { id },
        data: {
          name: dto.name,
          serialNumber: dto.serialNumber,
          brand: dto.brand,
          model: dto.model,
          categoryId: dto.categoryId,
          condition: dto.condition,
          purchaseDate: parseDateOnly(dto.purchaseDate),
          purchasePrice: dto.purchasePrice,
          warrantyExpiryDate: parseDateOnly(dto.warrantyExpiryDate),
          notes: dto.notes,
        },
        select: assetSelect,
      });

      await this.history.record(tx, {
        assetId: id,
        action: 'UPDATED',
        previousStatus: current.status,
        newStatus: updated.status,
        description: `Updated ${changedFields.join(', ')}`,
        metadata: { changedFields },
        performedById: actorId,
      });

      return updated;
    });

    return toAssetResponse(asset);
  }

  /** FR-01 "deactivate": soft delete, the asset and its history stay in the database */
  async deactivate(id: string, actorId: string): Promise<AssetResponse> {
    const current = await this.findOne(id);

    if (!current.isActive) {
      throw new ConflictException({
        type: 'asset-already-inactive',
        title: 'Asset is already deactivated',
        detail: `Asset ${current.assetCode} is already deactivated.`,
      });
    }
    if (current.status === 'ASSIGNED') {
      throw new ConflictException({
        type: 'asset-currently-assigned',
        title: 'Asset is currently assigned',
        detail: `Asset ${current.assetCode} is assigned to ${current.currentAssignment?.employee.fullName ?? 'an employee'}. Record the return before deactivating it.`,
      });
    }

    return this.setActive(current, false, actorId);
  }

  async reactivate(id: string, actorId: string): Promise<AssetResponse> {
    const current = await this.findOne(id);

    if (current.isActive) {
      throw new ConflictException({
        type: 'asset-already-active',
        title: 'Asset is already active',
        detail: `Asset ${current.assetCode} is already active.`,
      });
    }

    return this.setActive(current, true, actorId);
  }

  /**
   * US-06: mark an asset damaged, under repair, lost or retired (and back).
   * Only the transitions in MANUAL_STATUS_TRANSITIONS are allowed.
   */
  async changeStatus(id: string, dto: ChangeStatusDto, actorId: string): Promise<AssetResponse> {
    const current = await this.findOne(id);

    if (!current.isActive) {
      throw new ConflictException({
        type: 'asset-inactive',
        title: 'Asset is deactivated',
        detail: `Asset ${current.assetCode} is deactivated. Reactivate it before changing its status.`,
      });
    }
    if (!canChangeStatus(current.status, dto.status)) {
      const allowed = MANUAL_STATUS_TRANSITIONS[current.status].map(statusLabel);
      throw new ConflictException({
        type: 'invalid-status-transition',
        title: 'Status change not allowed',
        detail: `${current.assetCode} cannot go from ${statusLabel(current.status)} to ${statusLabel(
          dto.status,
        )}. Allowed: ${allowed.length ? allowed.join(', ') : 'none'}.`,
        allowed: MANUAL_STATUS_TRANSITIONS[current.status],
      });
    }

    const asset = await this.prisma.$transaction(async (tx) => {
      // Optimistic lock: only changes if nobody changed the status meanwhile
      const changed = await tx.asset.updateMany({
        where: { id, status: current.status },
        data: { status: dto.status },
      });
      if (changed.count === 0) {
        throw new ConflictException({
          type: 'status-changed-concurrently',
          title: 'Status was changed by someone else',
          detail: `${current.assetCode} changed while you were editing. Refresh and try again.`,
        });
      }

      // Lost while assigned: the assignment is closed so nobody "holds" a lost asset
      let assignmentId: string | undefined;
      if (current.status === 'ASSIGNED' && current.currentAssignment) {
        assignmentId = current.currentAssignment.id;
        await tx.assetAssignment.update({
          where: { id: assignmentId },
          data: {
            status: 'RETURNED',
            returnedAt: new Date(),
            returnNotes: dto.notes ?? 'Asset reported lost',
            returnedById: actorId,
          },
        });
      }

      await this.history.record(tx, {
        assetId: id,
        assignmentId,
        action: 'STATUS_CHANGED',
        previousStatus: current.status,
        newStatus: dto.status,
        description: dto.notes
          ? `Status changed to ${statusLabel(dto.status)}: ${dto.notes}`
          : `Status changed to ${statusLabel(dto.status)}`,
        metadata: dto.notes ? { notes: dto.notes } : undefined,
        performedById: actorId,
      });

      return tx.asset.findUniqueOrThrow({ where: { id }, select: assetSelect });
    });

    return toAssetResponse(asset);
  }

  // ---------------- Helpers ----------------

  private async setActive(
    current: AssetResponse,
    isActive: boolean,
    actorId: string,
  ): Promise<AssetResponse> {
    const asset = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.asset.update({
        where: { id: current.id },
        data: { isActive },
        select: assetSelect,
      });
      await this.history.record(tx, {
        assetId: current.id,
        action: isActive ? 'REACTIVATED' : 'DEACTIVATED',
        previousStatus: current.status,
        newStatus: updated.status,
        description: `Asset ${current.assetCode} ${isActive ? 'reactivated' : 'deactivated'}`,
        performedById: actorId,
      });
      return updated;
    });
    return toAssetResponse(asset);
  }

  private async assertAssetCodeAvailable(assetCode: string): Promise<void> {
    const existing = await this.prisma.asset.findUnique({
      where: { assetCode },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        type: 'asset-code-taken',
        title: 'Asset code already exists',
        detail: `An asset with code ${assetCode} already exists.`,
      });
    }
  }

  /** Serial numbers are compared case-insensitively ("sn-1" clashes with "SN-1") */
  private async assertSerialAvailable(serialNumber: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.asset.findFirst({
      where: {
        serialNumber: { equals: serialNumber, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { assetCode: true },
    });
    if (existing) {
      throw new ConflictException({
        type: 'serial-number-taken',
        title: 'Serial number already exists',
        detail: `Serial number ${serialNumber} is already used by asset ${existing.assetCode}.`,
      });
    }
  }
}

// ---------------- Pure functions (easy to unit-test) ----------------

function assetNotFound(id: string): NotFoundException {
  return new NotFoundException({
    type: 'asset-not-found',
    title: 'Asset not found',
    detail: `No asset exists with id ${id}.`,
  });
}

function assertWarrantyAfterPurchase(
  purchaseDate: string | null | undefined,
  warrantyExpiryDate: string | null | undefined,
): void {
  // "YYYY-MM-DD" strings compare correctly as text
  if (purchaseDate && warrantyExpiryDate && warrantyExpiryDate < purchaseDate) {
    throw new BadRequestException({
      type: 'invalid-warranty-date',
      title: 'Invalid warranty date',
      detail: 'warrantyExpiryDate cannot be earlier than purchaseDate.',
    });
  }
}

/** Compares the request with the current asset and lists fields that really change */
function findChangedFields(current: AssetResponse, dto: UpdateAssetDto): string[] {
  const currentValues: Record<string, unknown> = {
    name: current.name,
    serialNumber: current.serialNumber,
    brand: current.brand,
    model: current.model,
    categoryId: current.category.id,
    condition: current.condition,
    purchaseDate: current.purchaseDate,
    purchasePrice: current.purchasePrice,
    warrantyExpiryDate: current.warrantyExpiryDate,
    notes: current.notes,
  };

  return Object.entries(dto)
    .filter(([, value]) => value !== undefined)
    .filter(([field, value]) => {
      const normalised =
        field === 'purchasePrice' && typeof value === 'number' ? value.toFixed(2) : value;
      return normalised !== currentValues[field];
    })
    .map(([field]) => field);
}
