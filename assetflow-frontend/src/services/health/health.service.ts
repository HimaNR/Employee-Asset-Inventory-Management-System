import { apiClient } from '@/libs/api/api-client';
import type { HealthResponse } from '@/types/health.types';

export const healthService = {
  getHealth: (signal?: AbortSignal) =>
    apiClient.get<HealthResponse>('/health', { signal }),
};
