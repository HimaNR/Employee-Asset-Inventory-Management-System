import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SelectOption } from '@/components/Select';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { assetsService } from '@/services/assets/assets.service';
import { categoriesService } from '@/services/categories/categories.service';
import type { PaginationMeta } from '@/types/api.types';
import type { Asset, AssetQuery } from '@/types/asset.types';
import {
  DEFAULT_FILTERS,
  hasCustomFilters,
  toAssetQuery,
  type AssetFilters,
} from '../utils/asset-filters';

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

  // ---------- category options (for the filter and, later, the form) ----------
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    categoriesService
      .list({ limit: 100, sortBy: 'name', sortOrder: 'asc' }, controller.signal)
      .then((response) =>
        setCategoryOptions(
          response.data.map((category) => ({
            value: category.id,
            label: category.isActive ? category.name : `${category.name} (inactive)`,
          })),
        ),
      )
      .catch(() => {
        // Not critical: the filter just stays empty
      });
    return () => controller.abort();
  }, []);

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
    sort,
    changeFilters,
    clearFilters,
    changeSort,
    changePage: setPage,
    changeLimit,
  };
}
