'use client';

import type { ReactNode } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryFilters } from './components/CategoryFilters';
import { CategoryFormModal } from './components/CategoryFormModal';
import { useCategoriesPage } from './hooks/useCategoriesPage';

export default function CategoriesPage() {
  const page = useCategoriesPage();

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
        <Button onClick={page.openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New category
        </Button>
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
          {page.actionError.title}: {page.actionError.detail}
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
          <CategoriesTable
            categories={page.categories}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
            onEdit={page.openEdit}
            onDeactivate={page.askDeactivate}
            onReactivate={page.reactivate}
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

function Banner({
  tone,
  children,
  onDismiss,
}: {
  tone: 'success' | 'error';
  children: ReactNode;
  onDismiss: () => void;
}) {
  const styles =
    tone === 'success'
      ? 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300'
      : 'bg-red-500/10 text-red-700 dark:text-red-300';

  return (
    <div role="status" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${styles}`}>
      {tone === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <p className="flex-1">{children}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
