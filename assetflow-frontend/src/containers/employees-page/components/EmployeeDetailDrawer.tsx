'use client';

import { Mail, Pencil, Power, RotateCcw } from 'lucide-react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Drawer from '@/components/Drawer';
import type { ApiError } from '@/libs/api/api-error';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { CategoryIcon } from '@/libs/category-icon';
import { cn } from '@/libs/cn';
import { formatDate } from '@/libs/format';
import { initials } from '@/libs/initials';
import type { Employee, EmployeeAssignment } from '@/types/employee.types';

interface EmployeeDetailDrawerProps {
  open: boolean;
  employee: Employee | null;
  currentAssignments: EmployeeAssignment[];
  pastAssignments: EmployeeAssignment[];
  hasMorePast: boolean;
  isLoading: boolean;
  error: ApiError | null;
  actionError: ApiError | null;
  isReactivating: boolean;
  onLoadMorePast: () => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onReactivate: (employee: Employee) => void;
  onDismissActionError: () => void;
  onClose: () => void;
}

export function EmployeeDetailDrawer({
  open,
  employee,
  currentAssignments,
  pastAssignments,
  hasMorePast,
  isLoading,
  error,
  actionError,
  isReactivating,
  onLoadMorePast,
  onEdit,
  onDeactivate,
  onReactivate,
  onDismissActionError,
  onClose,
}: EmployeeDetailDrawerProps) {
  const isActive = employee?.status === 'ACTIVE';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Employee details"
      footer={
        employee && (
          <>
            {isActive ? (
              <Button
                variant="ghost"
                onClick={() => onDeactivate(employee)}
                className="mr-auto hover:text-red-600 dark:hover:text-red-400"
              >
                <Power className="h-4 w-4" aria-hidden="true" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => onReactivate(employee)}
                isLoading={isReactivating}
                className="mr-auto"
              >
                {!isReactivating && <RotateCcw className="h-4 w-4" aria-hidden="true" />}
                Reactivate
              </Button>
            )}
            <Button onClick={() => onEdit(employee)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit employee
            </Button>
          </>
        )
      }
    >
      {error && !employee && (
        <Banner tone="error">
          {error.title}: {error.detail}
        </Banner>
      )}

      {!employee && !error && <DrawerSkeleton />}

      {employee && (
        <div className={cn('space-y-8 transition-opacity', isLoading && 'opacity-60')}>
          {/* Header */}
          <header className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-light',
                isActive ? 'bg-tag text-tag-ink' : 'bg-surface-2 text-ink-muted',
              )}
            >
              {initials(employee.fullName)}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink-muted">{employee.employeeCode}</p>
              <h3 className="text-2xl font-light tracking-tight">{employee.fullName}</h3>
              <p className="text-sm text-ink-muted">
                {[employee.designation, employee.department].filter(Boolean).join(' · ') ||
                  'No role details'}
              </p>
              <p className="mt-2">
                {isActive ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge tone="neutral">Inactive</Badge>
                )}
              </p>
            </div>
          </header>

          {actionError && (
            <Banner tone="error" onDismiss={onDismissActionError}>
              <span className="font-medium">{actionError.title}.</span> {actionError.detail}
            </Banner>
          )}

          {/* Contact */}
          <a
            href={`mailto:${employee.email}`}
            className="group flex items-center gap-3 rounded-2xl bg-surface-2/60 px-4 py-3 text-sm transition hover:bg-surface-2"
          >
            <Mail className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            <span className="flex-1 truncate">{employee.email}</span>
            <span className="text-xs text-ink-muted transition group-hover:text-ink">Send email</span>
          </a>

          {/* Holding now */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              Holding now
              <span className="rounded-full bg-contrast px-2 py-0.5 text-xs text-contrast-fg">
                {currentAssignments.length}
              </span>
            </h3>
            {currentAssignments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
                No assets assigned right now.
              </p>
            ) : (
              <ul className="space-y-2">
                {currentAssignments.map((assignment) => (
                  <AssignmentRow key={assignment.id} assignment={assignment} />
                ))}
              </ul>
            )}
          </section>

          {/* Past assignments */}
          <section>
            <h3 className="mb-3 text-sm font-medium">Previously held</h3>
            {pastAssignments.length === 0 ? (
              <p className="text-sm text-ink-muted">No returned assets yet.</p>
            ) : (
              <ul className="space-y-2">
                {pastAssignments.map((assignment) => (
                  <AssignmentRow key={assignment.id} assignment={assignment} />
                ))}
              </ul>
            )}
            {hasMorePast && (
              <div className="mt-4 text-center">
                <Button variant="secondary" size="sm" onClick={onLoadMorePast} isLoading={isLoading}>
                  Load more
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}

function AssignmentRow({ assignment }: { assignment: EmployeeAssignment }) {
  const isActive = assignment.status === 'ACTIVE';
  const status = ASSET_STATUS_DISPLAY[assignment.asset.status];

  return (
    <li className="group flex items-center gap-3 rounded-2xl bg-surface-2/60 px-4 py-3 transition hover:bg-surface-2">
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
          isActive ? 'bg-tag/25' : 'bg-surface text-ink-muted',
        )}
      >
        <CategoryIcon name={assignment.asset.category.name} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{assignment.asset.name}</p>
        <p className="text-xs text-ink-muted">
          <span className="font-mono">{assignment.asset.assetCode}</span> ·{' '}
          {isActive
            ? `since ${formatDate(assignment.assignedAt)}`
            : `${formatDate(assignment.assignedAt)} – ${formatDate(assignment.returnedAt)}`}
        </p>
      </div>
      {isActive ? (
        <Badge tone={status.tone}>{status.label}</Badge>
      ) : (
        assignment.returnCondition && (
          <span className="text-xs text-ink-muted">
            Returned {ASSET_CONDITION_LABEL[assignment.returnCondition].toLowerCase()}
          </span>
        )
      )}
    </li>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-surface-2" />
      <div className="h-12 animate-pulse rounded-2xl bg-surface-2" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
