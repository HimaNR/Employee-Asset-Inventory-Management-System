import type { AssetHistoryAction, AssetStatus } from './asset.types';

/** Matches the backend GET /dashboard/summary */
export interface DashboardSummary {
  totals: {
    assets: number;
    categories: number;
    employees: number;
    activeAssignments: number;
  };
  byStatus: Record<AssetStatus, number>;
  byCategory: Array<{
    categoryId: string;
    name: string;
    total: number;
    byStatus: Record<AssetStatus, number>;
  }>;
  attention: {
    damaged: number;
    underRepair: number;
    lost: number;
    warrantyExpiringSoon: number;
  };
  recentAssignments: Array<{
    id: string;
    assignedAt: string;
    asset: { id: string; assetCode: string; name: string; categoryName: string };
    employee: { id: string; employeeCode: string; fullName: string };
  }>;
  recentActivity: Array<{
    id: string;
    action: AssetHistoryAction;
    description: string;
    previousStatus: AssetStatus | null;
    newStatus: AssetStatus | null;
    createdAt: string;
    asset: { id: string; assetCode: string; name: string };
    performedBy: { id: string; email: string } | null;
  }>;
  generatedAt: string;
}

/** The numbers the hero section needs (derived from the summary) */
export interface DashboardOverview {
  totalAssets: number;
  available: number;
  assigned: number;
  inRepair: number; // DAMAGED + UNDER_REPAIR
  categories: number;
}
