import type { DashboardOverview, DashboardSummary } from '@/types/dashboard.types';

/** Pure function: the hero section's numbers from the summary */
export function toOverview(summary: DashboardSummary): DashboardOverview {
  return {
    totalAssets: summary.totals.assets,
    available: summary.byStatus.AVAILABLE,
    assigned: summary.byStatus.ASSIGNED,
    inRepair: summary.byStatus.DAMAGED + summary.byStatus.UNDER_REPAIR,
    categories: summary.totals.categories,
  };
}
