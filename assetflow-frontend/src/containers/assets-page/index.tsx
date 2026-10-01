'use client';

import { Plus } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import AssignAssetDialog from '@/containers/assign-asset-dialog';
import ReturnAssetDialog from '@/containers/return-asset-dialog';
import { AssetDetailDrawer } from './components/AssetDetailDrawer';
import { AssetFilters } from './components/AssetFilters';
import { AssetFormModal } from './components/AssetFormModal';
import { AssetsTable } from './components/AssetsTable';
import { StatusChangeDialog } from './components/StatusChangeDialog';
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
            onView={page.openDetail}
            onEdit={page.openEdit}
            activeAssetId={page.selectedAssetId}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <AssetDetailDrawer
        open={page.selectedAssetId !== null}
        asset={page.detail.asset}
        history={page.detail.history}
        hasMoreHistory={page.detail.hasMoreHistory}
        isLoading={page.detail.isLoading}
        error={page.detail.error}
        actionError={page.actionError}
        isReactivating={page.isReactivating}
        onLoadMoreHistory={page.detail.loadMoreHistory}
        onEdit={page.openEdit}
        onAssign={page.openAssign}
        onReturn={page.openReturn}
        onChangeStatus={page.openStatusChange}
        onDeactivate={page.askDeactivate}
        onReactivate={page.reactivate}
        onDismissActionError={page.dismissActionError}
        onClose={page.closeDetail}
      />

      <AssetFormModal
        key={`form-${page.form.key}`}
        open={page.form.open}
        asset={page.form.asset}
        categoryOptions={page.formCategoryOptions}
        isSubmitting={page.isSaving}
        serverError={page.saveError}
        onSubmit={page.saveAsset}
        onClose={page.closeForm}
      />

      <AssignAssetDialog
        key={`assign-${page.assignDialog.key}`}
        open={page.assignDialog.open}
        presetAsset={page.assignDialog.presetAsset}
        onAssigned={page.handleAssigned}
        onClose={page.closeAssign}
      />

      <ReturnAssetDialog
        key={`return-${page.returnDialog.key}`}
        open={page.returnDialog.open}
        presetAssignment={page.returnDialog.presetAssignment}
        onReturned={page.handleReturned}
        onClose={page.closeReturn}
      />

      <StatusChangeDialog
        key={`status-${page.statusDialog.key}`}
        open={page.statusDialog.open}
        asset={page.statusDialog.asset}
        target={page.statusDialog.target}
        isSubmitting={page.isChangingStatus}
        error={page.statusError}
        onConfirm={page.confirmStatusChange}
        onClose={page.closeStatusChange}
      />

      <ConfirmDialog
        open={page.toDeactivate !== null}
        tone="danger"
        title={`Deactivate ${page.toDeactivate?.assetCode ?? ''}?`}
        message="It will be hidden from new assignments. Its full history is kept, and you can reactivate it at any time."
        confirmLabel="Deactivate"
        isLoading={page.isDeactivating}
        onConfirm={page.confirmDeactivate}
        onCancel={page.cancelDeactivate}
      />
    </div>
  );
}
