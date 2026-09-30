import type { TableSort } from '@/components/Table';
import type { AssetCondition, AssetQuery, AssetSortField, AssetStatus } from '@/types/asset.types';

export type ActivityFilter = '' | 'active' | 'inactive';

export interface AssetFilters {
  search: string;
  status: AssetStatus | '';
  categoryId: string;
  condition: AssetCondition | '';
  activity: ActivityFilter;
}

export const DEFAULT_FILTERS: AssetFilters = {
  search: '',
  status: '',
  categoryId: '',
  condition: '',
  activity: 'active',
};

export function hasCustomFilters(filters: AssetFilters): boolean {
  return (
    filters.search !== '' ||
    filters.status !== '' ||
    filters.categoryId !== '' ||
    filters.condition !== '' ||
    filters.activity !== DEFAULT_FILTERS.activity
  );
}

/** Pure function: screen state -> API query (empty values are left out) */
export function toAssetQuery(
  filters: AssetFilters,
  search: string,
  sort: TableSort,
  page: number,
  limit: number,
): AssetQuery {
  return {
    page,
    limit,
    search: search.trim() || undefined,
    status: filters.status || undefined,
    categoryId: filters.categoryId || undefined,
    condition: filters.condition || undefined,
    isActive: filters.activity === '' ? undefined : filters.activity === 'active',
    sortBy: sort.sortBy as AssetSortField,
    sortOrder: sort.sortOrder,
  };
}
