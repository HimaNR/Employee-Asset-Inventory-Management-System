import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { assignmentsService } from '@/services/assignments/assignments.service';
import type { PaginationMeta } from '@/types/api.types';
import type { Assignment, AssignmentQuery, AssignmentSortField } from '@/types/assignment.types';

const EMPTY_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const DEFAULT_SORT: TableSort = { sortBy: 'returnedAt', sortOrder: 'desc' };

/** Returns = assignments with status RETURNED (newest first) */
export function useReturnsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TableSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const queryKey = JSON.stringify({
    status: 'RETURNED',
    search: debouncedSearch.trim() || undefined,
    sortBy: sort.sortBy as AssignmentSortField,
    sortOrder: sort.sortOrder,
    page,
    limit,
  } satisfies AssignmentQuery);
  const query = useMemo(() => JSON.parse(queryKey) as AssignmentQuery, [queryKey]);

  const requestKey = `${queryKey}#${reloadKey}`;
  const [returns, setReturns] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    assignmentsService
      .list(query, controller.signal)
      .then((response) => {
        setReturns(response.data);
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

  // ---------- "Record a return" dialog ----------
  const [notice, setNotice] = useState<string | null>(null);
  const [returnDialog, setReturnDialog] = useState({ open: false, key: 0 });

  const openReturn = () => setReturnDialog((d) => ({ open: true, key: d.key + 1 }));
  const closeReturn = () => setReturnDialog((d) => ({ ...d, open: false }));
  const handleReturned = (assignment: Assignment) => {
    closeReturn();
    setNotice(
      `${assignment.asset.assetCode} was returned by ${assignment.employee.fullName}` +
        ` in ${assignment.returnCondition?.toLowerCase() ?? 'unknown'} condition.`,
    );
    reload();
  };

  return {
    returns,
    meta,
    isLoading,
    listError,
    reload,
    search,
    changeSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    sort,
    changeSort: (next: TableSort) => {
      setSort(next);
      setPage(1);
    },
    changePage: setPage,
    changeLimit: (next: number) => {
      setLimit(next);
      setPage(1);
    },
    notice,
    dismissNotice: () => setNotice(null),
    returnDialog,
    openReturn,
    closeReturn,
    handleReturned,
  };
}
