import { Undo2 } from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { CategoryIcon } from '@/libs/category-icon';
import { cn } from '@/libs/cn';
import { formatDate, formatDuration } from '@/libs/format';
import { initials } from '@/libs/initials';
import type { Assignment } from '@/types/assignment.types';

interface AssignmentsTableProps {
  assignments: Assignment[];
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
  /** Leave out (no permission) and the Actions column disappears */
  onReturn?: (assignment: Assignment) => void;
  /** Row click opens the detail panel */
  onView: (assignment: Assignment) => void;
  activeAssignmentId: string | null;
}

const BASE_COLUMNS: TableColumn<Assignment>[] = [
  {
    key: 'asset',
    header: 'Asset',
    cell: (a) => (
      <div className="flex min-w-[14rem] items-center gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3',
            a.status === 'ACTIVE' ? 'bg-tag/25' : 'bg-surface-2 text-ink-muted',
          )}
        >
          <CategoryIcon name={a.asset.category.name} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{a.asset.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            <span className="rounded-md border border-line px-1.5 py-px font-mono text-[11px] text-ink">
              {a.asset.assetCode}
            </span>{' '}
            {a.asset.category.name}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'employee',
    header: 'Employee',
    cell: (a) => (
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-contrast text-[11px] font-medium text-contrast-fg"
        >
          {initials(a.employee.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate">{a.employee.fullName}</p>
          <p className="font-mono text-[11px] text-ink-muted">{a.employee.employeeCode}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'assignedAt',
    header: 'Assigned',
    sortKey: 'assignedAt',
    cell: (a) => <span className="whitespace-nowrap">{formatDate(a.assignedAt)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortKey: 'returnedAt',
    cell: (a) =>
      a.status === 'ACTIVE' ? (
        <Badge tone="info">With employee</Badge>
      ) : (
        <div>
          <Badge tone="neutral">Returned</Badge>
          <p className="mt-1 text-xs whitespace-nowrap text-ink-muted">
            {formatDate(a.returnedAt)}
          </p>
        </div>
      ),
  },
  {
    key: 'duration',
    header: 'Duration',
    cell: (a) => (
      <span className="text-ink-muted tabular-nums">
        {formatDuration(a.assignedAt, a.returnedAt)}
      </span>
    ),
  },
];

export function AssignmentsTable({
  assignments,
  isLoading,
  sort,
  onSortChange,
  onReturn,
  onView,
  activeAssignmentId,
}: AssignmentsTableProps) {
  if (!onReturn) {
    return (
      <Table
        caption="Asset assignments"
        columns={BASE_COLUMNS}
        rows={assignments}
        getRowKey={(a) => a.id}
        isLoading={isLoading}
        sort={sort}
        onSortChange={onSortChange}
        onRowClick={onView}
        activeRowKey={activeAssignmentId}
        emptyMessage="No assignments match your filters."
      />
    );
  }

  const columns: TableColumn<Assignment>[] = [
    ...BASE_COLUMNS,
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (a) =>
        a.status === 'ACTIVE' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReturn(a)}
            aria-label={`Record return of ${a.asset.assetCode}`}
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            Return
          </Button>
        ) : null,
    },
  ];

  return (
    <Table
      caption="Asset assignments"
      columns={columns}
      rows={assignments}
      getRowKey={(a) => a.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onView}
      activeRowKey={activeAssignmentId}
      emptyMessage="No assignments match your filters."
    />
  );
}
