'use client';

import { Plus } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import { AssetFilters } from './components/AssetFilters';
import { AssetFormModal } from './components/AssetFormModal';
import { AssetsTable } from './components/AssetsTable';
import { StatusSummary } from './components/StatusSummary';
import { useAssetsPage } from './hooks/useAssetsPage';

export default function AssetsPage() {
  const page = useAssetsPage();

  return (
    <div className="space-y-6">
      {/* Headline + main action */}
      <div className="flex flex-wrap items-end justify-between gap-4">
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
        <Button onClick={page.openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New asset
        </Button>
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

      {page.notice && (
        <Banner tone="success" onDismiss={page.dismissNotice}>
          {page.notice}
        </Banner>
      )}

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
            onEdit={page.openEdit}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <AssetFormModal
        key={page.form.key}
        open={page.form.open}
        asset={page.form.asset}
        categoryOptions={page.formCategoryOptions}
        isSubmitting={page.isSaving}
        serverError={page.saveError}
        onSubmit={page.saveAsset}
        onClose={page.closeForm}
      />
    </div>
  );
}
