import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Asset,
  AssetHistoryEntry,
  AssetQuery,
  CreateAssetInput,
  UpdateAssetInput,
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

  history: (id: string, query: { page?: number; limit?: number }, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<AssetHistoryEntry>>(`/assets/${id}/history`, {
      query,
      signal,
    }),
};
