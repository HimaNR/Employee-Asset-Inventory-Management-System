import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  AssignmentStatus,
  CreateEmployeeInput,
  Employee,
  EmployeeAssignment,
  EmployeeQuery,
  UpdateEmployeeInput,
} from '@/types/employee.types';

export const employeesService = {
  list: (query: EmployeeQuery, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Employee>>('/employees', { query, signal }),

  get: (id: string, signal?: AbortSignal) =>
    apiClient.get<Employee>(`/employees/${id}`, { signal }),

  departments: (signal?: AbortSignal) =>
    apiClient.get<string[]>('/employees/departments', { signal }),

  designations: (signal?: AbortSignal) =>
    apiClient.get<string[]>('/employees/designations', { signal }),

  assignments: (
    id: string,
    query: { status?: AssignmentStatus; page?: number; limit?: number },
    signal?: AbortSignal,
  ) =>
    apiClient.get<PaginatedResponse<EmployeeAssignment>>(`/employees/${id}/assignments`, {
      query,
      signal,
    }),

  create: (input: CreateEmployeeInput) => apiClient.post<Employee>('/employees', input),

  update: (id: string, input: UpdateEmployeeInput) =>
    apiClient.patch<Employee>(`/employees/${id}`, input),

  deactivate: (id: string) => apiClient.post<Employee>(`/employees/${id}/deactivate`),

  reactivate: (id: string) => apiClient.post<Employee>(`/employees/${id}/reactivate`),
};
