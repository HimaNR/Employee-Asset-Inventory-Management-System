import type { TableSort } from '@/components/Table';
import type { EmployeeQuery, EmployeeSortField, EmployeeStatus } from '@/types/employee.types';

export interface EmployeeFilters {
  search: string;
  status: EmployeeStatus | '';
  department: string;
}

export const DEFAULT_FILTERS: EmployeeFilters = {
  search: '',
  status: 'ACTIVE',
  department: '',
};

export function hasCustomFilters(filters: EmployeeFilters): boolean {
  return (
    filters.search !== '' ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.department !== ''
  );
}

/** Pure function: screen state -> API query (empty values are left out) */
export function toEmployeeQuery(
  filters: EmployeeFilters,
  search: string,
  sort: TableSort,
  page: number,
  limit: number,
): EmployeeQuery {
  return {
    page,
    limit,
    search: search.trim() || undefined,
    status: filters.status || undefined,
    department: filters.department || undefined,
    sortBy: sort.sortBy as EmployeeSortField,
    sortOrder: sort.sortOrder,
  };
}
