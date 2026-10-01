import { Injectable } from '@nestjs/common';
import { AssetStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummary } from './interfaces/dashboard-summary.interface';

const WARRANTY_WINDOW_DAYS = 60;
const RECENT_LIMIT = 6;

/** Every status with a 0 count, so the response always has all keys */
function emptyStatusCounts(): Record<AssetStatus, number> {
  return Object.fromEntries(Object.values(AssetStatus).map((s) => [s, 0])) as Record<
    AssetStatus,
    number
  >;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummary> {
    const today = startOfTodayUtc();
    const warrantyLimit = addDays(today, WARRANTY_WINDOW_DAYS);

    // All queries run in parallel; the database does the counting (GROUP BY)
    const [
      statusGroups,
      categoryStatusGroups,
      categories,
      activeEmployees,
      activeAssignments,
      warrantyExpiringSoon,
      recentAssignments,
      recentActivity,
    ] = await Promise.all([
      this.prisma.asset.groupBy({
        by: ['status'],
        where: { isActive: true },
        _count: { _all: true },
      }),
      this.prisma.asset.groupBy({
        by: ['categoryId', 'status'],
        where: { isActive: true },
        _count: { _all: true },
      }),
      this.prisma.assetCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.assetAssignment.count({ where: { status: 'ACTIVE' } }),
      this.prisma.asset.count({
        where: {
          isActive: true,
          status: { notIn: ['RETIRED', 'LOST'] },
          warrantyExpiryDate: { gte: today, lt: warrantyLimit },
        },
      }),
      this.prisma.assetAssignment.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { assignedAt: 'desc' },
        take: RECENT_LIMIT,
        select: {
          id: true,
          assignedAt: true,
          asset: {
            select: { id: true, assetCode: true, name: true, category: { select: { name: true } } },
          },
          employee: {
            select: { id: true, employeeCode: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.assetHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: RECENT_LIMIT + 2,
        select: {
          id: true,
          action: true,
          description: true,
          previousStatus: true,
          newStatus: true,
          createdAt: true,
          asset: { select: { id: true, assetCode: true, name: true } },
          performedBy: { select: { id: true, email: true } },
        },
      }),
    ]);

    // ---- counts by status ----
    const byStatus = emptyStatusCounts();
    for (const group of statusGroups) byStatus[group.status] = group._count._all;
    const totalAssets = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

    // ---- counts by category (+ status split for stacked bars) ----
    const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
    const byCategoryMap = new Map<string, Record<AssetStatus, number>>();
    for (const group of categoryStatusGroups) {
      const counts = byCategoryMap.get(group.categoryId) ?? emptyStatusCounts();
      counts[group.status] = group._count._all;
      byCategoryMap.set(group.categoryId, counts);
    }
    const byCategory = [...byCategoryMap.entries()]
      .map(([categoryId, counts]) => ({
        categoryId,
        // Assets can sit in a deactivated category: show it as such
        name: categoryNames.get(categoryId) ?? 'Inactive category',
        total: Object.values(counts).reduce((sum, n) => sum + n, 0),
        byStatus: counts,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totals: {
        assets: totalAssets,
        categories: categories.length,
        employees: activeEmployees,
        activeAssignments,
      },
      byStatus,
      byCategory,
      attention: {
        damaged: byStatus.DAMAGED,
        underRepair: byStatus.UNDER_REPAIR,
        lost: byStatus.LOST,
        warrantyExpiringSoon,
      },
      recentAssignments: recentAssignments.map((a) => ({
        id: a.id,
        assignedAt: a.assignedAt,
        asset: {
          id: a.asset.id,
          assetCode: a.asset.assetCode,
          name: a.asset.name,
          categoryName: a.asset.category.name,
        },
        employee: {
          id: a.employee.id,
          employeeCode: a.employee.employeeCode,
          fullName: `${a.employee.firstName} ${a.employee.lastName}`,
        },
      })),
      recentActivity,
      generatedAt: new Date(),
    };
  }
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
