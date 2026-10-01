import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { employeesService } from '@/services/employees/employees.service';
import type { PaginationMeta } from '@/types/api.types';
import type { SearchOption } from '@/components/SearchSelect';
import type { Assignment } from '@/types/assignment.types';
import type { Employee, EmployeeAssignment, EmployeeQuery } from '@/types/employee.types';
import {
  DEFAULT_FILTERS,
  hasCustomFilters,
  toEmployeeQuery,
  type EmployeeFilters,
} from '../utils/employee-filters';
import { toCreateInput, toUpdateInput, type EmployeeFormValues } from '../utils/employee-form';
import { useEmployeeDetail } from './useEmployeeDetail';

const EMPTY_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const DEFAULT_SORT: TableSort = { sortBy: 'firstName', sortOrder: 'asc' };

export function useEmployeesPage() {
  // ---------- filters, sorting, paging ----------
  const [filters, setFilters] = useState<EmployeeFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<TableSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(filters.search);

  const queryKey = JSON.stringify(toEmployeeQuery(filters, debouncedSearch, sort, page, limit));
  const query = useMemo(() => JSON.parse(queryKey) as EmployeeQuery, [queryKey]);

  // ---------- employee list ----------
  const requestKey = `${queryKey}#${reloadKey}`;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    employeesService
      .list(query, controller.signal)
      .then((response) => {
        setEmployees(response.data);
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

  // ---------- departments (filter options + form suggestions) ----------
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    employeesService
      .departments(controller.signal)
      .then(setDepartments)
      .catch(() => {
        // Not critical: the filter just stays empty
      });
    return () => controller.abort();
  }, [reloadKey]); // a new department appears after saving

  // ---------- messages ----------
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  // ---------- create / edit form ----------
  const [form, setForm] = useState<{ open: boolean; employee: Employee | null; key: number }>({
    open: false,
    employee: null,
    key: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | null>(null);

  const openCreate = () => {
    setSaveError(null);
    setForm((f) => ({ open: true, employee: null, key: f.key + 1 }));
  };
  const openEdit = (employee: Employee) => {
    setSaveError(null);
    setForm((f) => ({ open: true, employee, key: f.key + 1 }));
  };
  const closeForm = () => setForm((f) => ({ ...f, open: false }));

  const saveEmployee = async (values: EmployeeFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = form.employee
        ? await employeesService.update(form.employee.id, toUpdateInput(values))
        : await employeesService.create(toCreateInput(values));
      closeForm();
      setNotice(form.employee ? `${saved.fullName} was updated.` : `${saved.fullName} was added.`);
      reload();
    } catch (err) {
      setSaveError(ApiError.from(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- detail drawer ----------
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const detail = useEmployeeDetail(selectedEmployeeId, reloadKey);

  const openDetail = (employee: Employee) => {
    setActionError(null);
    setSelectedEmployeeId(employee.id);
  };
  const closeDetail = () => setSelectedEmployeeId(null);

  // ---------- deactivate (with confirmation) / reactivate ----------
  const [toDeactivate, setToDeactivate] = useState<Employee | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    setIsDeactivating(true);
    setActionError(null);
    try {
      const saved = await employeesService.deactivate(toDeactivate.id);
      setNotice(`${saved.fullName} was deactivated.`);
      reload();
    } catch (err) {
      // e.g. 409 employee-holds-assets: shown inside the drawer
      setActionError(ApiError.from(err));
    } finally {
      setIsDeactivating(false);
      setToDeactivate(null);
    }
  };

  const reactivate = async (employee: Employee) => {
    setIsReactivating(true);
    setActionError(null);
    try {
      const saved = await employeesService.reactivate(employee.id);
      setNotice(`${saved.fullName} was reactivated.`);
      reload();
    } catch (err) {
      setActionError(ApiError.from(err));
    } finally {
      setIsReactivating(false);
    }
  };

  // ---------- assign dialog (opened from the drawer) ----------
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    key: number;
    presetEmployee: SearchOption | null;
  }>({ open: false, key: 0, presetEmployee: null });

  const openAssign = (employee: Employee) =>
    setAssignDialog((d) => ({
      open: true,
      key: d.key + 1,
      presetEmployee: { value: employee.id, label: `${employee.fullName} · ${employee.employeeCode}` },
    }));
  const closeAssign = () => setAssignDialog((d) => ({ ...d, open: false }));
  const handleAssigned = (assignment: Assignment) => {
    closeAssign();
    setNotice(`${assignment.asset.assetCode} was assigned to ${assignment.employee.fullName}.`);
    reload(); // table ("Assets held") AND the open drawer refresh
  };

  // ---------- return dialog (from "Holding now") ----------
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    key: number;
    presetAssignment: SearchOption | null;
  }>({ open: false, key: 0, presetAssignment: null });

  const openReturn = (assignment: EmployeeAssignment) =>
    setReturnDialog((d) => ({
      open: true,
      key: d.key + 1,
      presetAssignment: {
        value: assignment.id,
        label: `${assignment.asset.assetCode} · ${assignment.asset.name}`,
      },
    }));
  const closeReturn = () => setReturnDialog((d) => ({ ...d, open: false }));
  const handleReturned = (assignment: Assignment) => {
    closeReturn();
    setNotice(`${assignment.asset.assetCode} was returned by ${assignment.employee.fullName}.`);
    reload();
  };

  // ---------- filter handlers (always back to page 1) ----------
  const changeFilters = (patch: Partial<EmployeeFilters>) => {
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
    // list
    employees,
    meta,
    isLoading,
    listError,
    reload,
    // filters
    filters,
    departments,
    canClearFilters: hasCustomFilters(filters),
    sort,
    changeFilters,
    clearFilters,
    changeSort,
    changePage: setPage,
    changeLimit,
    // messages
    notice,
    dismissNotice: () => setNotice(null),
    actionError,
    dismissActionError: () => setActionError(null),
    // form
    form,
    isSaving,
    saveError,
    openCreate,
    openEdit,
    closeForm,
    saveEmployee,
    // drawer
    selectedEmployeeId,
    detail,
    openDetail,
    closeDetail,
    // deactivate / reactivate
    toDeactivate,
    isDeactivating,
    askDeactivate: setToDeactivate,
    cancelDeactivate: () => setToDeactivate(null),
    confirmDeactivate,
    isReactivating,
    reactivate,
    // assign
    assignDialog,
    openAssign,
    closeAssign,
    handleAssigned,
    // return
    returnDialog,
    openReturn,
    closeReturn,
    handleReturned,
  };
}
