import { apiClient } from '@/libs/api/api-client';
import type { QueryValue } from '@/libs/api/http-transport';
import type { PaginatedResponse } from '@/types/api.types';
import type { DashboardOverview } from '@/types/dashboard.types';

/** Asks a list endpoint for 1 row and reads meta.total (cheap way to count) */
async function countOf(
  path: string,
  query: Record<string, QueryValue>,
  signal?: AbortSignal,
): Promise<number> {
  const response = await apiClient.get<PaginatedResponse<unknown>>(path, {
    query: { ...query, limit: 1 },
    signal,
  });
  return response.meta.total;
}

export const dashboardService = {
  /**
   * Temporary implementation built from existing list endpoints.
   * Phase 6 replaces the inside with one call to GET /dashboard/summary;
   * the hook and UI will not need to change.
   */
  async getOverview(signal?: AbortSignal): Promise<DashboardOverview> {
    const [totalAssets, available, assigned, damaged, underRepair, categories] =
      await Promise.all([
        countOf('/assets', { isActive: true }, signal),
        countOf('/assets', { isActive: true, status: 'AVAILABLE' }, signal),
        countOf('/assets', { isActive: true, status: 'ASSIGNED' }, signal),
        countOf('/assets', { isActive: true, status: 'DAMAGED' }, signal),
        countOf('/assets', { isActive: true, status: 'UNDER_REPAIR' }, signal),
        countOf('/categories', { isActive: true }, signal),
      ]);

    return { totalAssets, available, assigned, inRepair: damaged + underRepair, categories };
  },
};
