'use client';

import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import { AssetFilters } from './components/AssetFilters';
import { AssetsTable } from './components/AssetsTable';
import { useAssetsPage } from './hooks/useAssetsPage';

export default function AssetsPage() {
  const page = useAssetsPage();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-4xl font-light tracking-tight tabular-nums">{page.meta.total}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {page.canClearFilters ? 'assets match your filters' : 'active assets'}
        </p>
      </div>

      <AssetFilters
        filters={page.filters}
        categoryOptions={page.categoryOptions}
        canClear={page.canClearFilters}
        onChange={page.changeFilters}
        onClear={page.clearFilters}
      />

      {page.listError ? (
        <div className="rounded-3xl bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300">
          <p className="font-medium">{page.listError.title}</p>
          <p className="mt-1">{page.listError.detail}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={page.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <AssetsTable
            assets={page.assets}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}
    </div>
  );
}
