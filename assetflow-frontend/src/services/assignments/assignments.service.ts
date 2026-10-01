import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Assignment,
  AssignmentQuery,
  CreateAssignmentInput,
} from '@/types/assignment.types';

export const assignmentsService = {
  list: (query: AssignmentQuery, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Assignment>>('/assignments', { query, signal }),

  get: (id: string, signal?: AbortSignal) =>
    apiClient.get<Assignment>(`/assignments/${id}`, { signal }),

  create: (input: CreateAssignmentInput) =>
    apiClient.post<Assignment>('/assignments', input),

  /** Total for a filter (reads meta.total with limit=1) */
  count: async (query: AssignmentQuery, signal?: AbortSignal) =>
    (
      await apiClient.get<PaginatedResponse<Assignment>>('/assignments', {
        query: { ...query, limit: 1 },
        signal,
      })
    ).meta.total,
};
