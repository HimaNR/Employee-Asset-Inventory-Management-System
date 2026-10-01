import Badge, { type BadgeTone } from '@/components/Badge';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { ASSET_CONDITION_LABEL } from '@/libs/asset-display';
import { CategoryIcon } from '@/libs/category-icon';
import { formatDate, formatDuration } from '@/libs/format';
import { initials } from '@/libs/initials';
import type { AssetCondition } from '@/types/asset.types';
import type { Assignment } from '@/types/assignment.types';

interface ReturnsTableProps {
  returns: Assignment[];
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
}

const CONDITION_TONE: Record<AssetCondition, BadgeTone> = {
  NEW: 'success',
  GOOD: 'success',
  FAIR: 'warning',
  DAMAGED: 'danger',
};

const COLUMNS: TableColumn<Assignment>[] = [
  {
    key: 'asset',
    header: 'Asset',
    cell: (r) => (
      <div className="flex min-w-[14rem] items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tag/25 transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3">
          <CategoryIcon name={r.asset.category.name} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{r.asset.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{r.asset.assetCode}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'employee',
    header: 'Returned by',
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-contrast text-[11px] font-medium text-contrast-fg"
        >
          {initials(r.employee.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate">{r.employee.fullName}</p>
          <p className="font-mono text-[11px] text-ink-muted">{r.employee.employeeCode}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'returnedAt',
    header: 'Returned',
    sortKey: 'returnedAt',
    cell: (r) => <span className="whitespace-nowrap">{formatDate(r.returnedAt)}</span>,
  },
  {
    key: 'condition',
    header: 'Condition',
    cell: (r) =>
      r.returnCondition ? (
        <Badge tone={CONDITION_TONE[r.returnCondition]}>
          {ASSET_CONDITION_LABEL[r.returnCondition]}
        </Badge>
      ) : (
        <span className="text-ink-muted">Closed (lost)</span>
      ),
  },
  {
    key: 'duration',
    header: 'Held for',
    cell: (r) => (
      <span className="text-ink-muted tabular-nums">{formatDuration(r.assignedAt, r.returnedAt)}</span>
    ),
  },
  {
    key: 'notes',
    header: 'Notes',
    cell: (r) => (
      <span className="line-clamp-2 max-w-[16rem] text-xs text-ink-muted">{r.returnNotes ?? '–'}</span>
    ),
  },
];

export function ReturnsTable({ returns, isLoading, sort, onSortChange }: ReturnsTableProps) {
  return (
    <Table
      caption="Returned assets"
      columns={COLUMNS}
      rows={returns}
      getRowKey={(r) => r.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      emptyMessage="No returns recorded yet."
    />
  );
}
