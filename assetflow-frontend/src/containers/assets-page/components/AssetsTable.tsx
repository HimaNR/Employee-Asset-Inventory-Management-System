import { categoryIcon } from '@/libs/category-icon';
import Badge from '@/components/Badge';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { cn } from '@/libs/cn';
import type { Asset, AssetCondition } from '@/types/asset.types';

interface AssetsTableProps {
  assets: Asset[];
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
}

/** Condition as a 4-step meter: NEW 4 bars, GOOD 3, FAIR 2, DAMAGED 1 */
const CONDITION_LEVEL: Record<AssetCondition, { level: number; color: string }> = {
  NEW: { level: 4, color: 'bg-emerald-500' },
  GOOD: { level: 3, color: 'bg-emerald-500' },
  FAIR: { level: 2, color: 'bg-amber-500' },
  DAMAGED: { level: 1, color: 'bg-red-500' },
};

function initials(fullName: string): string {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const COLUMNS: TableColumn<Asset>[] = [
  {
    key: 'asset',
    header: 'Asset',
    sortKey: 'assetCode',
    cell: (asset) => {
      const Icon = categoryIcon(asset.category.name);
      return (
        <div className="flex min-w-[16rem] items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-ink transition-transform duration-200 group-hover:scale-105">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span className="truncate font-medium">{asset.name}</span>
              {!asset.isActive && <Badge tone="neutral">Deactivated</Badge>}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
              <span className="rounded-md border border-line px-1.5 py-px font-mono text-[11px] text-ink">
                {asset.assetCode}
              </span>
              <span className="truncate">
                {[asset.brand, asset.model].filter(Boolean).join(' ') || '—'}
              </span>
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'category',
    header: 'Category',
    cell: (asset) => <span className="text-ink-muted">{asset.category.name}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortKey: 'status',
    cell: (asset) => {
      const display = ASSET_STATUS_DISPLAY[asset.status];
      return <Badge tone={display.tone}>{display.label}</Badge>;
    },
  },
  {
    key: 'condition',
    header: 'Condition',
    sortKey: 'condition',
    cell: (asset) => {
      const { level, color } = CONDITION_LEVEL[asset.condition];
      return (
        <div className="flex items-center gap-2.5" title={ASSET_CONDITION_LABEL[asset.condition]}>
          <span aria-hidden="true" className="flex gap-0.5">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cn('h-3.5 w-1.5 rounded-full', step <= level ? color : 'bg-line')}
              />
            ))}
          </span>
          <span className="text-ink-muted">{ASSET_CONDITION_LABEL[asset.condition]}</span>
        </div>
      );
    },
  },
  {
    key: 'holder',
    header: 'Assigned to',
    cell: (asset) =>
      asset.currentAssignment ? (
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-contrast text-[11px] font-medium text-contrast-fg"
          >
            {initials(asset.currentAssignment.employee.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate">{asset.currentAssignment.employee.fullName}</p>
            <p className="font-mono text-[11px] text-ink-muted">
              {asset.currentAssignment.employee.employeeCode}
            </p>
          </div>
        </div>
      ) : (
        <span className="text-ink-muted/60">Unassigned</span>
      ),
  },
];

export function AssetsTable({ assets, isLoading, sort, onSortChange }: AssetsTableProps) {
  return (
    <Table
      caption="Company assets"
      columns={COLUMNS}
      rows={assets}
      getRowKey={(asset) => asset.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      emptyMessage="No assets match your filters."
    />
  );
}
