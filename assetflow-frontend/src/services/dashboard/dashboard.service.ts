import { apiClient } from '@/libs/api/api-client';
import type { DashboardSummary } from '@/types/dashboard.types';

export const dashboardService = {
  /** One request for everything on the dashboard (US-09, FR-09) */
  getSummary: (signal?: AbortSignal) =>
    apiClient.get<DashboardSummary>('/dashboard/summary', { signal }),
};
