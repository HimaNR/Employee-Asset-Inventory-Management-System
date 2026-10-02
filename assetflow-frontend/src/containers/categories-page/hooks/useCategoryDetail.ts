import { useEffect, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { assetsService } from '@/services/assets/assets.service';
import type { Asset, AssetStatus } from '@/types/asset.types';

const PAGE_SIZE = 20;

/** All assets of one category (with search + "load more") and its status counts */
export function useCategoryDetail(categoryId: string | null, refreshKey: number) {
  // Search text and page size are remembered PER category (derived, no reset effect)
  const [local, setLocal] = useState({ categoryId, search: '', limit: PAGE_SIZE });
  const isSame = local.categoryId === categoryId;
  const search = isSame ? local.search : '';
  const limit = isSame ? local.limit : PAGE_SIZE;
  const debouncedSearch = useDebouncedValue(search);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<AssetStatus, number> | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${categoryId}#${debouncedSearch}#${limit}#${refreshKey}`;

  useEffect(() => {
    if (!categoryId) return;
    const controller = new AbortController();
    Promise.all([
      assetsService.list(
        {
          categoryId,
          search: debouncedSearch.trim() || undefined,
          limit,
          sortBy: 'assetCode',
          sortOrder: 'asc',
        },
        controller.signal,
      ),
      assetsService.statusCounts({ categoryId, isActive: true }, controller.signal),
    ])
      .then(([page, statusCounts]) => {
        setAssets(page.data);
        setTotal(page.meta.total);
        setCounts(statusCounts);
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(ApiError.from(err));
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [categoryId, debouncedSearch, limit, requestKey]);

  const isCurrent = loadedKey?.startsWith(`${categoryId}#`) ?? false;

  return {
    assets: isCurrent ? assets : [],
    total: isCurrent ? total : 0,
    counts: isCurrent ? counts : null,
    hasMore: isCurrent && total > assets.length,
    isLoading: categoryId !== null && loadedKey !== requestKey,
    error,
    search,
    changeSearch: (value: string) => setLocal({ categoryId, search: value, limit: PAGE_SIZE }),
    loadMore: () => setLocal({ categoryId, search, limit: limit + PAGE_SIZE }),
  };
}
