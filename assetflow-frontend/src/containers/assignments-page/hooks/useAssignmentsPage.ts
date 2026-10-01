import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SearchOption } from '@/components/SearchSelect';
import type { SelectOption } from '@/components/Select';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { assignmentsService } from '@/services/assignments/assignments.service';
import { employeesService } from '@/services/employees/employees.service';
import type { PaginationMeta } from '@/types/api.types';
import type { Assignment, AssignmentQuery } from '@/types/assignment.types';
import {
  DEFAULT_FILTERS,
  hasCustomFilters,
  toAssignmentQuery,
  type AssignmentFilters,
} from '../utils/assignment-filters';

const EMPTY_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const DEFAULT_SORT: TableSort = { sortBy: 'assignedAt', sortOrder: 'desc' };

export function useAssignmentsPage() {
  // ---------- filters, sorting, paging ----------
  const [filters, setFilters] = useState<AssignmentFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<TableSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(filters.search);

  const queryKey = JSON.stringify(toAssignmentQuery(filters, debouncedSearch, sort, page, limit));
  const query = useMemo(() => JSON.parse(queryKey) as AssignmentQuery, [queryKey]);

  // ---------- list ----------
  const requestKey = `${queryKey}#${reloadKey}`;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    assignmentsService
      .list(query, controller.signal)
      .then((response) => {
        setAssignments(response.data);
        setMeta(response.meta);
        setListError(null);
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setListError(ApiError.from(err));
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [query, requestKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // ---------- tab counts (Active / Returned) ----------
  const [counts, setCounts] = useState<{ active: number | null; returned: number | null }>({
    active: null,
    returned: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      assignmentsService.count({ status: 'ACTIVE' }, controller.signal),
      assignmentsService.count({ status: 'RETURNED' }, controller.signal),
    ])
      .then(([active, returned]) => setCounts({ active, returned }))
      .catch(() => {
        // Not critical: tabs show "·"
      });
    return () => controller.abort();
  }, [reloadKey]);

  // ---------- employee filter options ----------
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    employeesService
      .list({ limit: 100, sortBy: 'firstName', sortOrder: 'asc' }, controller.signal)
      .then((response) =>
        setEmployeeOptions(
          response.data.map((employee) => ({
            value: employee.id,
            label: `${employee.fullName} · ${employee.employeeCode}`,
          })),
        ),
      )
      .catch(() => {
        // Not critical
      });
    return () => controller.abort();
  }, [reloadKey]);

  // ---------- messages + assign dialog ----------
  const [notice, setNotice] = useState<string | null>(null);
  const [assignDialog, setAssignDialog] = useState({ open: false, key: 0 });

  const openAssign = () => setAssignDialog((d) => ({ open: true, key: d.key + 1 }));
  const closeAssign = () => setAssignDialog((d) => ({ ...d, open: false }));
  const handleAssigned = (assignment: Assignment) => {
    closeAssign();
    setNotice(`${assignment.asset.assetCode} was assigned to ${assignment.employee.fullName}.`);
    reload();
  };

  // ---------- return dialog ----------
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    key: number;
    presetAssignment: SearchOption | null;
  }>({ open: false, key: 0, presetAssignment: null });

  const openReturn = (assignment: Assignment) =>
    setReturnDialog((d) => ({
      open: true,
      key: d.key + 1,
      presetAssignment: {
        value: assignment.id,
        label: `${assignment.asset.assetCode} · ${assignment.asset.name} (with ${assignment.employee.fullName})`,
      },
    }));
  const closeReturn = () => setReturnDialog((d) => ({ ...d, open: false }));
  const handleReturned = (assignment: Assignment) => {
    closeReturn();
    setNotice(`${assignment.asset.assetCode} was returned by ${assignment.employee.fullName}.`);
    reload();
  };

  // ---------- handlers ----------
  const changeFilters = (patch: Partial<AssignmentFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };
  const changeSort = (next: TableSort) => {
    setSort(next);
    setPage(1);
  };
  const changeLimit = (next: number) => {
    setLimit(next);
    setPage(1);
  };

  return {
    assignments,
    meta,
    isLoading,
    listError,
    reload,
    filters,
    counts,
    employeeOptions,
    canClearFilters: hasCustomFilters(filters),
    sort,
    changeFilters,
    clearFilters,
    changeSort,
    changePage: setPage,
    changeLimit,
    notice,
    dismissNotice: () => setNotice(null),
    assignDialog,
    openAssign,
    closeAssign,
    handleAssigned,
    returnDialog,
    openReturn,
    closeReturn,
    handleReturned,
  };
}
