import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { assetHistorySelect, type AssetHistoryRecord } from './asset-history.select';

export type HistoryEntry = Prisma.AssetHistoryUncheckedCreateInput;

@Injectable()
export class AssetHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes one history row INSIDE the caller's transaction.
   * If the main change fails, the history row is rolled back too (and vice versa).
   */
  record(tx: Prisma.TransactionClient, entry: HistoryEntry) {
    return tx.assetHistory.create({ data: entry, select: { id: true } });
  }

  async findByAsset(
    assetId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<AssetHistoryRecord>> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true },
    });
    if (!asset) {
      throw new NotFoundException({
        type: 'asset-not-found',
        title: 'Asset not found',
        detail: `No asset exists with id ${assetId}.`,
      });
    }

    const where = { assetId };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.assetHistory.count({ where }),
      this.prisma.assetHistory.findMany({
        where,
        select: assetHistorySelect,
        orderBy: { createdAt: query.sortOrder },
        ...toSkipTake(query.page, query.limit),
      }),
    ]);

    return paginate(rows, total, query.page, query.limit);
  }
}
