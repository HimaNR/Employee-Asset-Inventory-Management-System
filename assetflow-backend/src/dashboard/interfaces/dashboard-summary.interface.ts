import type { AssetHistoryAction, AssetStatus } from '../../generated/prisma/enums';

export interface CategoryBreakdown {
  categoryId: string;
  name: string;
  total: number;
  byStatus: Record<AssetStatus, number>;
}

export interface RecentAssignment {
  id: string;
  assignedAt: Date;
  asset: { id: string; assetCode: string; name: string; categoryName: string };
  employee: { id: string; employeeCode: string; fullName: string };
}

export interface RecentActivity {
  id: string;
  action: AssetHistoryAction;
  description: string;
  previousStatus: AssetStatus | null;
  newStatus: AssetStatus | null;
  createdAt: Date;
  asset: { id: string; assetCode: string; name: string };
  performedBy: { id: string; email: string } | null;
}

/** GET /dashboard/summary (FR-09: counts by status and category + recent activity) */
export interface DashboardSummary {
  totals: {
    assets: number; // active assets
    categories: number; // active categories
    employees: number; // active employees
    activeAssignments: number;
  };
  byStatus: Record<AssetStatus, number>;
  byCategory: CategoryBreakdown[];
  attention: {
    damaged: number;
    underRepair: number;
    lost: number;
    warrantyExpiringSoon: number; // within the next 60 days
  };
  recentAssignments: RecentAssignment[];
  recentActivity: RecentActivity[];
  generatedAt: Date;
}
