import { useEffect, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { assetsService } from '@/services/assets/assets.service';
import type { PaginationMeta } from '@/types/api.types';
import type { Asset, AssetHistoryEntry } from '@/types/asset.types';

const PAGE_SIZE = 10;

/**
 * Loads one asset + its history timeline.
 * `refreshKey` comes from the page, so saving or deactivating refreshes the panel too.
 */
export function useAssetDetail(assetId: string | null, refreshKey: number) {
  // "Load more" size is remembered PER asset; opening another asset starts at 10 again
  const [limitState, setLimitState] = useState({ assetId, limit: PAGE_SIZE });
  const historyLimit = limitState.assetId === assetId ? limitState.limit : PAGE_SIZE;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [historyMeta, setHistoryMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${assetId}#${refreshKey}#${historyLimit}`;

  useEffect(() => {
    if (!assetId) return;
    const controller = new AbortController();

    // Both requests in parallel
    Promise.all([
      assetsService.get(assetId, controller.signal),
      assetsService.history(assetId, { limit: historyLimit }, controller.signal),
    ])
      .then(([loadedAsset, historyPage]) => {
        setAsset(loadedAsset);
        setHistory(historyPage.data);
        setHistoryMeta(historyPage.meta);
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(ApiError.from(err));
        setLoadedKey(requestKey);
      });

    return () => controller.abort();
  }, [assetId, historyLimit, requestKey]);

  // Never show the previous asset while the next one is loading
  const isCurrent = asset !== null && asset.id === assetId;

  return {
    asset: isCurrent ? asset : null,
    history: isCurrent ? history : [],
    hasMoreHistory: isCurrent && historyMeta !== null && historyMeta.total > history.length,
    isLoading: assetId !== null && loadedKey !== requestKey,
    error,
    loadMoreHistory: () => setLimitState({ assetId, limit: historyLimit + PAGE_SIZE }),
  };
}
