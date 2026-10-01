import { apiClient } from '@/libs/api/api-client';
import type { Role } from '@/types/role.types';

export const rolesService = {
  list: (signal?: AbortSignal) => apiClient.get<Role[]>('/roles', { signal }),

  permissions: (signal?: AbortSignal) => apiClient.get<string[]>('/roles/permissions', { signal }),
};
