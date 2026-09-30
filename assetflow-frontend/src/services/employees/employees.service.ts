import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type { Employee, EmployeeQuery } from '@/types/employee.types';

export const employeesService = {
  list: (query: EmployeeQuery, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Employee>>('/employees', { query, signal }),

  get: (id: string, signal?: AbortSignal) =>
    apiClient.get<Employee>(`/employees/${id}`, { signal }),
};
