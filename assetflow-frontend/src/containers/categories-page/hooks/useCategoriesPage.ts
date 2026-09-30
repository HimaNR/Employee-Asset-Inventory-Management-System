import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { categoriesService } from '@/services/categories/categories.service';
import type { PaginationMeta } from '@/types/api.types';
import type { Category, CategoryQuery, CategorySortField } from '@/types/category.types';
import type { StatusFilter } from '../components/CategoryFilters';
import { toCategoryInput, type CategoryFormValues } from '../utils/category-form';

const EMPTY_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function useCategoriesPage() {
  // ---------- filters, sorting, paging ----------
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('active');
  const [sort, setSort] = useState<TableSort>({ sortBy: 'name', sortOrder: 'asc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo<CategoryQuery>(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      isActive: status === '' ? undefined : status === 'active',
      sortBy: sort.sortBy as CategorySortField,
      sortOrder: sort.sortOrder,
    }),
    [page, limit, debouncedSearch, status, sort],
  );

  // ---------- list data ----------
  const requestKey = `${JSON.stringify(query)}#${reloadKey}`;
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  // Loading = the data on screen does not belong to the current request yet
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    categoriesService
      .list(query, controller.signal)
      .then((response) => {
        setCategories(response.data);
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

  // ---------- filter handlers (reset to page 1 when the filter changes) ----------
  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const changeStatus = (value: StatusFilter) => {
    setStatus(value);
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

  // ---------- success message ----------
  const [notice, setNotice] = useState<string | null>(null);

  // ---------- create / edit form ----------
  const [form, setForm] = useState<{ open: boolean; category: Category | null; key: number }>({
    open: false,
    category: null,
    key: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | null>(null);

  const openCreate = () => {
    setSaveError(null);
    setForm((f) => ({ open: true, category: null, key: f.key + 1 }));
  };
  const openEdit = (category: Category) => {
    setSaveError(null);
    setForm((f) => ({ open: true, category, key: f.key + 1 }));
  };
  const closeForm = () => setForm((f) => ({ ...f, open: false }));

  const saveCategory = async (values: CategoryFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const input = toCategoryInput(values);
      const saved = form.category
        ? await categoriesService.update(form.category.id, input)
        : await categoriesService.create(input);
      closeForm();
      setNotice(form.category ? `"${saved.name}" was updated.` : `"${saved.name}" was created.`);
      reload();
    } catch (err) {
      setSaveError(ApiError.from(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- deactivate (with confirmation) / reactivate ----------
  const [toDeactivate, setToDeactivate] = useState<Category | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    setIsDeactivating(true);
    setActionError(null);
    try {
      await categoriesService.update(toDeactivate.id, { isActive: false });
      setNotice(`"${toDeactivate.name}" was deactivated.`);
      setToDeactivate(null);
      reload();
    } catch (err) {
      setActionError(ApiError.from(err));
      setToDeactivate(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  const reactivate = async (category: Category) => {
    setReactivatingId(category.id);
    setActionError(null);
    try {
      await categoriesService.update(category.id, { isActive: true });
      setNotice(`"${category.name}" was reactivated.`);
      reload();
    } catch (err) {
      setActionError(ApiError.from(err));
    } finally {
      setReactivatingId(null);
    }
  };

  return {
    // list
    categories,
    meta,
    isLoading,
    listError,
    reload,
    // filters
    search,
    status,
    sort,
    changeSearch,
    changeStatus,
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
    saveCategory,
    // deactivate / reactivate
    toDeactivate,
    isDeactivating,
    askDeactivate: setToDeactivate,
    cancelDeactivate: () => setToDeactivate(null),
    confirmDeactivate,
    reactivatingId,
    reactivate,
  };
}
