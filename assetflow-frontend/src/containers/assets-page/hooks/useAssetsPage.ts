import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SelectOption } from '@/components/Select';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { assetsService } from '@/services/assets/assets.service';
import { categoriesService } from '@/services/categories/categories.service';
import { employeesService } from '@/services/employees/employees.service';
import type { PaginationMeta } from '@/types/api.types';
import type { SearchOption } from '@/components/SearchSelect';
import type { Asset, AssetQuery, AssetStatus } from '@/types/asset.types';
import type { Assignment } from '@/types/assignment.types';
import type { Category } from '@/types/category.types';
import {
  DEFAULT_FILTERS,
  hasCustomFilters,
  toAssetQuery,
  type AssetFilters,
} from '../utils/asset-filters';
import { toCreateInput, toUpdateInput, type AssetFormValues } from '../utils/asset-form';
import { useAssetDetail } from './useAssetDetail';

const EMPTY_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const DEFAULT_SORT: TableSort = { sortBy: 'createdAt', sortOrder: 'desc' };

export function useAssetsPage() {
  // ---------- filters, sorting, paging ----------
  const [filters, setFilters] = useState<AssetFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<TableSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(filters.search);

  // The query only gets a new identity when its CONTENT changes.
  // Typing in the search box changes filters.search, but the query waits for the debounced value.
  const queryKey = JSON.stringify(toAssetQuery(filters, debouncedSearch, sort, page, limit));
  const query = useMemo(() => JSON.parse(queryKey) as AssetQuery, [queryKey]);

  // ---------- asset list ----------
  const requestKey = `${queryKey}#${reloadKey}`;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    assetsService
      .list(query, controller.signal)
      .then((response) => {
        setAssets(response.data);
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

  // ---------- status counts (for the chips above the table) ----------
  const [statusCounts, setStatusCounts] = useState<Record<AssetStatus, number> | null>(null);
  const isActiveFilter = query.isActive;

  useEffect(() => {
    const controller = new AbortController();
    assetsService
      .statusCounts({ isActive: isActiveFilter }, controller.signal)
      .then(setStatusCounts)
      .catch(() => {
        // Not critical: chips just show "·" instead of a number
      });
    return () => controller.abort();
  }, [isActiveFilter, reloadKey]);

  // ---------- dropdown options: categories + employees ----------
  const [categories, setCategories] = useState<Category[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [optionsKey, setOptionsKey] = useState(0);

  // Coming back to this browser tab refreshes the options,
  // so an employee added elsewhere appears without reloading the page.
  useEffect(() => {
    const refresh = () => setOptionsKey((key) => key + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    categoriesService
      .list({ limit: 100, sortBy: 'name', sortOrder: 'asc' }, controller.signal)
      .then((response) => setCategories(response.data))
      .catch(() => {
        // Not critical: the filter just stays empty
      });

    employeesService
      .list({ limit: 100, sortBy: 'firstName', sortOrder: 'asc' }, controller.signal)
      .then((response) =>
        setEmployeeOptions(
          response.data.map((employee) => ({
            value: employee.id,
            label: `${employee.fullName} · ${employee.employeeCode}${
              employee.status === 'INACTIVE' ? ' (inactive)' : ''
            }`,
          })),
        ),
      )
      .catch(() => {
        // Not critical: the filter just stays empty
      });

    return () => controller.abort();
  }, [optionsKey]);

  // Filter: every category (old assets can sit in a deactivated one)
  const categoryOptions = useMemo<SelectOption[]>(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.isActive ? category.name : `${category.name} (inactive)`,
      })),
    [categories],
  );

  // ---------- messages ----------
  const [notice, setNotice] = useState<string | null>(null);

  // ---------- create / edit form ----------
  const [form, setForm] = useState<{ open: boolean; asset: Asset | null; key: number }>({
    open: false,
    asset: null,
    key: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | null>(null);

  // Form: only ACTIVE categories, plus the asset's current one when editing
  const formCategoryOptions = useMemo<SelectOption[]>(
    () =>
      categories
        .filter((category) => category.isActive || category.id === form.asset?.category.id)
        .map((category) => ({
          value: category.id,
          label: category.isActive ? category.name : `${category.name} (inactive)`,
        })),
    [categories, form.asset],
  );

  const openCreate = () => {
    setSaveError(null);
    setForm((f) => ({ open: true, asset: null, key: f.key + 1 }));
  };
  const openEdit = (asset: Asset) => {
    setSaveError(null);
    setForm((f) => ({ open: true, asset, key: f.key + 1 }));
  };
  const closeForm = () => setForm((f) => ({ ...f, open: false }));

  const saveAsset = async (values: AssetFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = form.asset
        ? await assetsService.update(form.asset.id, toUpdateInput(values))
        : await assetsService.create(toCreateInput(values));
      closeForm();
      setNotice(
        form.asset ? `${saved.assetCode} was updated.` : `${saved.assetCode} was registered.`,
      );
      reload(); // refreshes the table AND the status counts
    } catch (err) {
      setSaveError(ApiError.from(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- detail drawer ----------
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const detail = useAssetDetail(selectedAssetId, reloadKey);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  const openDetail = (asset: Asset) => {
    setActionError(null);
    setSelectedAssetId(asset.id);
  };
  const closeDetail = () => setSelectedAssetId(null);

  // ---------- deactivate (with confirmation) / reactivate ----------
  const [toDeactivate, setToDeactivate] = useState<Asset | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    setIsDeactivating(true);
    setActionError(null);
    try {
      const saved = await assetsService.deactivate(toDeactivate.id);
      setNotice(`${saved.assetCode} was deactivated.`);
      reload();
    } catch (err) {
      // e.g. 409 asset-currently-assigned: shown inside the drawer
      setActionError(ApiError.from(err));
    } finally {
      setIsDeactivating(false);
      setToDeactivate(null);
    }
  };

  const reactivate = async (asset: Asset) => {
    setIsReactivating(true);
    setActionError(null);
    try {
      const saved = await assetsService.reactivate(asset.id);
      setNotice(`${saved.assetCode} was reactivated.`);
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
    presetAsset: SearchOption | null;
  }>({ open: false, key: 0, presetAsset: null });

  const openAssign = (asset: Asset) =>
    setAssignDialog((d) => ({
      open: true,
      key: d.key + 1,
      presetAsset: { value: asset.id, label: `${asset.assetCode} · ${asset.name}` },
    }));
  const closeAssign = () => setAssignDialog((d) => ({ ...d, open: false }));
  const handleAssigned = (assignment: Assignment) => {
    closeAssign();
    setNotice(`${assignment.asset.assetCode} was assigned to ${assignment.employee.fullName}.`);
    reload(); // table, chips AND the open drawer refresh
  };

  // ---------- handlers (every filter change goes back to page 1) ----------
  const changeFilters = (patch: Partial<AssetFilters>) => {
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
    assets,
    meta,
    isLoading,
    listError,
    reload,
    filters,
    canClearFilters: hasCustomFilters(filters),
    categoryOptions,
    formCategoryOptions,
    employeeOptions,
    statusCounts,
    sort,
    changeFilters,
    clearFilters,
    changeSort,
    changePage: setPage,
    changeLimit,
    notice,
    dismissNotice: () => setNotice(null),
    form,
    isSaving,
    saveError,
    openCreate,
    openEdit,
    closeForm,
    saveAsset,
    // detail drawer
    selectedAssetId,
    detail,
    openDetail,
    closeDetail,
    actionError,
    dismissActionError: () => setActionError(null),
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
  };
}
