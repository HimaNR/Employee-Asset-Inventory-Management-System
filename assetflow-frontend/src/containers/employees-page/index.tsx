'use client';

import { UserPlus } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import AssignAssetDialog from '@/containers/assign-asset-dialog';
import ReturnAssetDialog from '@/containers/return-asset-dialog';
import { EmployeeDetailDrawer } from './components/EmployeeDetailDrawer';
import { EmployeeFilters } from './components/EmployeeFilters';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeesTable } from './components/EmployeesTable';
import { useEmployeesPage } from './hooks/useEmployeesPage';

export default function EmployeesPage() {
  const page = useEmployeesPage();

  return (
    <div className="space-y-6">
      {/* Headline + main action */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <p className="text-6xl font-light tracking-tight tabular-nums">{page.meta.total}</p>
          <p className="pb-2 text-sm leading-tight text-ink-muted">
            {page.canClearFilters ? (
              <>
                employees match
                <br />
                your filters
              </>
            ) : (
              <>
                active
                <br />
                employees
              </>
            )}
          </p>
        </div>
        <Button onClick={page.openCreate}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add employee
        </Button>
      </div>

      <EmployeeFilters
        filters={page.filters}
        departments={page.departments}
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
          <EmployeesTable
            employees={page.employees}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
            onView={page.openDetail}
            onEdit={page.openEdit}
            activeEmployeeId={page.selectedEmployeeId}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <EmployeeDetailDrawer
        open={page.selectedEmployeeId !== null}
        employee={page.detail.employee}
        currentAssignments={page.detail.currentAssignments}
        pastAssignments={page.detail.pastAssignments}
        hasMorePast={page.detail.hasMorePast}
        isLoading={page.detail.isLoading}
        error={page.detail.error}
        actionError={page.actionError}
        isReactivating={page.isReactivating}
        onLoadMorePast={page.detail.loadMorePast}
        onEdit={page.openEdit}
        onAssign={page.openAssign}
        onReturn={page.openReturn}
        onDeactivate={page.askDeactivate}
        onReactivate={page.reactivate}
        onDismissActionError={page.dismissActionError}
        onClose={page.closeDetail}
      />

      <EmployeeFormModal
        key={`form-${page.form.key}`}
        open={page.form.open}
        employee={page.form.employee}
        departments={page.departments}
        isSubmitting={page.isSaving}
        serverError={page.saveError}
        onSubmit={page.saveEmployee}
        onClose={page.closeForm}
      />

      <AssignAssetDialog
        key={`assign-${page.assignDialog.key}`}
        open={page.assignDialog.open}
        presetEmployee={page.assignDialog.presetEmployee}
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

      <ConfirmDialog
        open={page.toDeactivate !== null}
        tone="danger"
        title={`Deactivate ${page.toDeactivate?.fullName ?? ''}?`}
        message="They will no longer be able to receive assets. Their assignment history is kept, and you can reactivate them at any time."
        confirmLabel="Deactivate"
        isLoading={page.isDeactivating}
        onConfirm={page.confirmDeactivate}
        onCancel={page.cancelDeactivate}
      />
    </div>
  );
}
