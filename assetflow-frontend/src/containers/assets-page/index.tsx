'use client';

import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import { AssetFilters } from './components/AssetFilters';
import { AssetsTable } from './components/AssetsTable';
import { StatusSummary } from './components/StatusSummary';
import { useAssetsPage } from './hooks/useAssetsPage';

export default function AssetsPage() {
  const page = useAssetsPage();

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div className="flex items-end gap-4">
        <p className="text-6xl font-light tracking-tight tabular-nums">{page.meta.total}</p>
        <p className="pb-2 text-sm leading-tight text-ink-muted">
          {page.canClearFilters ? (
            <>
              assets match
              <br />
              your filters
            </>
          ) : (
            <>
              active assets
              <br />
              in inventory
            </>
          )}
        </p>
      </div>

      {/* Status chips double as the status filter */}
      <StatusSummary
        counts={page.statusCounts}
        selected={page.filters.status}
        onSelect={(status) => page.changeFilters({ status })}
      />

      <AssetFilters
        filters={page.filters}
        categoryOptions={page.categoryOptions}
        employeeOptions={page.employeeOptions}
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
