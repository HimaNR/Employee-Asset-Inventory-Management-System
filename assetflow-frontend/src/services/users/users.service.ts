import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type { CreateUserInput, UpdateUserInput, User, UserQuery } from '@/types/user.types';

export const usersService = {
  list: (query: UserQuery, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<User>>('/users', { query, signal }),

  create: (input: CreateUserInput) => apiClient.post<User>('/users', input),

  update: (id: string, input: UpdateUserInput) => apiClient.patch<User>(`/users/${id}`, input),

  setPassword: (id: string, password: string) =>
    apiClient.put<void>(`/users/${id}/password`, { password }),
};
