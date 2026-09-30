import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Category,
  CategoryQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/category.types';

export const categoriesService = {
  list: (query: CategoryQuery, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Category>>('/categories', { query, signal }),

  get: (id: string, signal?: AbortSignal) =>
    apiClient.get<Category>(`/categories/${id}`, { signal }),

  create: (input: CreateCategoryInput) => apiClient.post<Category>('/categories', input),

  update: (id: string, input: UpdateCategoryInput) =>
    apiClient.patch<Category>(`/categories/${id}`, input),
};
