import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import {
  ASSET_STATUSES,
  type Asset,
  type AssetHistoryEntry,
  type AssetQuery,
  type AssetStatus,
  type ChangeStatusInput,
  type CreateAssetInput,
  type UpdateAssetInput,
} from '@/types/asset.types';

export const assetsService = {
  list: (query: AssetQuery, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Asset>>('/assets', { query, signal }),

  get: (id: string, signal?: AbortSignal) => apiClient.get<Asset>(`/assets/${id}`, { signal }),

  create: (input: CreateAssetInput) => apiClient.post<Asset>('/assets', input),

  update: (id: string, input: UpdateAssetInput) =>
    apiClient.patch<Asset>(`/assets/${id}`, input),

  deactivate: (id: string) => apiClient.post<Asset>(`/assets/${id}/deactivate`),

  reactivate: (id: string) => apiClient.post<Asset>(`/assets/${id}/reactivate`),

  /** Damaged / under repair / lost / retired; the backend checks the allowed transitions */
  changeStatus: (id: string, input: ChangeStatusInput) =>
    apiClient.post<Asset>(`/assets/${id}/status`, input),

  /**
   * How many assets are in each status (reads meta.total with limit=1).
   * Phase 6 will replace this with the dashboard summary endpoint.
   */
  async statusCounts(
    filter: Pick<AssetQuery, 'isActive'>,
    signal?: AbortSignal,
  ): Promise<Record<AssetStatus, number>> {
    const totals = await Promise.all(
      ASSET_STATUSES.map((status) =>
        apiClient
          .get<PaginatedResponse<Asset>>('/assets', {
            query: { ...filter, status, limit: 1 },
            signal,
          })
          .then((response) => response.meta.total),
      ),
    );
    return Object.fromEntries(
      ASSET_STATUSES.map((status, i) => [status, totals[i]]),
    ) as Record<AssetStatus, number>;
  },

  history: (id: string, query: { page?: number; limit?: number }, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<AssetHistoryEntry>>(`/assets/${id}/history`, {
      query,
      signal,
    }),
};
