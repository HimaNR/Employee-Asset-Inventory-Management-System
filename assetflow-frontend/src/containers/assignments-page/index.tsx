'use client';

import { ArrowRightLeft } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import AssignAssetDialog from '@/containers/assign-asset-dialog';
import AssignmentDetailDrawer from '@/containers/assignment-detail-drawer';
import ReturnAssetDialog from '@/containers/return-asset-dialog';
import { useCan } from '@/libs/auth/use-session';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { PERMISSIONS } from '@/types/auth.types';
import { AssignmentFilters } from './components/AssignmentFilters';
import { AssignmentsTable } from './components/AssignmentsTable';
import { useAssignmentsPage } from './hooks/useAssignmentsPage';

export default function AssignmentsPage() {
  const page = useAssignmentsPage();
  const can = useCan();

  return (
    <div className="space-y-6">
      {/* Headline + main action */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <p className="text-5xl font-light tracking-tight tabular-nums sm:text-6xl">{page.meta.total}</p>
          <p className="pb-2 text-sm leading-tight text-ink-muted">
            {page.filters.status === 'ACTIVE' && !page.canClearFilters ? (
              <>
                assets currently
                <br />
                with employees
              </>
            ) : (
              <>
                assignments match
                <br />
                your filters
              </>
            )}
          </p>
        </div>
        {can(PERMISSIONS.ASSIGNMENTS_WRITE) && (
          <Button onClick={page.openAssign}>
            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
            Assign asset
          </Button>
        )}
      </div>

      <AssignmentFilters
        filters={page.filters}
        counts={page.counts}
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
          <p>{friendlyMessage(page.listError)}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={page.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <AssignmentsTable
            assignments={page.assignments}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
            onReturn={can(PERMISSIONS.RETURNS_WRITE) ? page.openReturn : undefined}
            onView={page.openDetail}
            activeAssignmentId={page.selectedAssignment?.id ?? null}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <AssignAssetDialog
        key={`assign-${page.assignDialog.key}`}
        open={page.assignDialog.open}
        onAssigned={page.handleAssigned}
        onClose={page.closeAssign}
      />

      <AssignmentDetailDrawer
        open={page.selectedAssignment !== null}
        assignment={page.selectedAssignment}
        onReturn={can(PERMISSIONS.RETURNS_WRITE) ? page.openReturn : undefined}
        onClose={page.closeDetail}
      />

      <ReturnAssetDialog
        key={`return-${page.returnDialog.key}`}
        open={page.returnDialog.open}
        presetAssignment={page.returnDialog.presetAssignment}
        onReturned={page.handleReturned}
        onClose={page.closeReturn}
      />
    </div>
  );
}
