import Badge from '@/components/Badge';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import type { Asset } from '@/types/asset.types';

interface AssetsTableProps {
  assets: Asset[];
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
}

const COLUMNS: TableColumn<Asset>[] = [
  {
    key: 'asset',
    header: 'Asset',
    sortKey: 'assetCode',
    cell: (asset) => (
      <div className="min-w-[14rem]">
        <p className="flex items-center gap-2">
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
            {asset.assetCode}
          </span>
          {!asset.isActive && <Badge tone="neutral">Deactivated</Badge>}
        </p>
        <p className="mt-1 font-medium">{asset.name}</p>
        <p className="text-xs text-ink-muted">
          {[asset.brand, asset.model].filter(Boolean).join(' · ') || 'No brand/model'}
          {asset.serialNumber && <span className="font-mono"> · {asset.serialNumber}</span>}
        </p>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    cell: (asset) => asset.category.name,
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
    cell: (asset) => <span className="text-ink-muted">{ASSET_CONDITION_LABEL[asset.condition]}</span>,
  },
  {
    key: 'holder',
    header: 'Assigned to',
    cell: (asset) =>
      asset.currentAssignment ? (
        <div>
          <p>{asset.currentAssignment.employee.fullName}</p>
          <p className="font-mono text-xs text-ink-muted">
            {asset.currentAssignment.employee.employeeCode}
          </p>
        </div>
      ) : (
        <span className="text-ink-muted">–</span>
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
