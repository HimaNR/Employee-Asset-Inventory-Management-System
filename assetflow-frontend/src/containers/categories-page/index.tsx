'use client';

import { Plus } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import { useCan } from '@/libs/auth/use-session';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { PERMISSIONS } from '@/types/auth.types';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryDetailDrawer } from './components/CategoryDetailDrawer';
import { CategoryFilters } from './components/CategoryFilters';
import { CategoryFormModal } from './components/CategoryFormModal';
import { useCategoriesPage } from './hooks/useCategoriesPage';

export default function CategoriesPage() {
  const page = useCategoriesPage();
  const canWrite = useCan()(PERMISSIONS.CATEGORIES_WRITE);

  return (
    <div className="space-y-6">
      {/* Intro + main action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-4xl font-light tracking-tight tabular-nums">{page.meta.total}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {page.status === 'inactive' ? 'inactive' : page.status === 'active' ? 'active' : ''}{' '}
            categories
          </p>
        </div>
        {canWrite && (
          <Button onClick={page.openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New category
          </Button>
        )}
      </div>

      <CategoryFilters
        search={page.search}
        status={page.status}
        onSearchChange={page.changeSearch}
        onStatusChange={page.changeStatus}
      />

      {/* Messages */}
      {page.notice && (
        <Banner tone="success" onDismiss={page.dismissNotice}>
          {page.notice}
        </Banner>
      )}
      {page.actionError && (
        <Banner tone="error" onDismiss={page.dismissActionError}>
          {friendlyMessage(page.actionError)}
        </Banner>
      )}

      {page.listError ? (
        <div className="rounded-3xl bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300">
          <p>{friendlyMessage(page.listError)}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={page.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <CategoriesTable
            categories={page.categories}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
            onView={page.openDetail}
            activeCategoryId={page.selectedCategory?.id ?? null}
            onEdit={canWrite ? page.openEdit : undefined}
            onDeactivate={canWrite ? page.askDeactivate : undefined}
            onReactivate={canWrite ? page.reactivate : undefined}
            reactivatingId={page.reactivatingId}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <CategoryDetailDrawer
        open={page.selectedCategory !== null}
        category={page.selectedCategory}
        assets={page.detail.assets}
        total={page.detail.total}
        counts={page.detail.counts}
        hasMore={page.detail.hasMore}
        isLoading={page.detail.isLoading}
        error={page.detail.error}
        search={page.detail.search}
        onSearchChange={page.detail.changeSearch}
        onLoadMore={page.detail.loadMore}
        onClose={page.closeDetail}
      />

      <CategoryFormModal
        key={page.form.key}
        open={page.form.open}
        category={page.form.category}
        isSubmitting={page.isSaving}
        serverError={page.saveError}
        onSubmit={page.saveCategory}
        onClose={page.closeForm}
      />

      <ConfirmDialog
        open={page.toDeactivate !== null}
        tone="danger"
        title={`Deactivate "${page.toDeactivate?.name ?? ''}"?`}
        message="It will be hidden from new asset forms. Existing assets keep this category, and you can reactivate it at any time."
        confirmLabel="Deactivate"
        isLoading={page.isDeactivating}
        onConfirm={page.confirmDeactivate}
        onCancel={page.cancelDeactivate}
      />
    </div>
  );
}
