import type { TableSort } from '@/components/Table';
import type { AssignmentQuery, AssignmentSortField } from '@/types/assignment.types';
import type { AssignmentStatus } from '@/types/employee.types';

export interface AssignmentFilters {
  search: string;
  status: AssignmentStatus | '';
  employeeId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export const DEFAULT_FILTERS: AssignmentFilters = {
  search: '',
  status: 'ACTIVE',
  employeeId: '',
  from: '',
  to: '',
};

export function hasCustomFilters(filters: AssignmentFilters): boolean {
  return (
    filters.search !== '' ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.employeeId !== '' ||
    filters.from !== '' ||
    filters.to !== ''
  );
}

/** Pure function: screen state -> API query */
export function toAssignmentQuery(
  filters: AssignmentFilters,
  search: string,
  sort: TableSort,
  page: number,
  limit: number,
): AssignmentQuery {
  return {
    page,
    limit,
    search: search.trim() || undefined,
    status: filters.status || undefined,
    employeeId: filters.employeeId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    sortBy: sort.sortBy as AssignmentSortField,
    sortOrder: sort.sortOrder,
  };
}
