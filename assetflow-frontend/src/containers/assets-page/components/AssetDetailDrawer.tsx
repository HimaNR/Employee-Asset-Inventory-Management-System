'use client';

import type { ReactNode } from 'react';
import { ArrowRightLeft, Pencil, Power, RotateCcw } from 'lucide-react';
import Badge, { type BadgeTone } from '@/components/Badge';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Drawer from '@/components/Drawer';
import type { ApiError } from '@/libs/api/api-error';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { CategoryIcon } from '@/libs/category-icon';
import { cn } from '@/libs/cn';
import { daysUntil, formatAmount, formatDate } from '@/libs/format';
import type { Asset, AssetHistoryEntry } from '@/types/asset.types';
import { AssetHistoryTimeline } from './AssetHistoryTimeline';

interface AssetDetailDrawerProps {
  open: boolean;
  asset: Asset | null;
  history: AssetHistoryEntry[];
  hasMoreHistory: boolean;
  isLoading: boolean;
  error: ApiError | null;
  actionError: ApiError | null;
  isReactivating: boolean;
  onLoadMoreHistory: () => void;
  onEdit: (asset: Asset) => void;
  onAssign: (asset: Asset) => void;
  onDeactivate: (asset: Asset) => void;
  onReactivate: (asset: Asset) => void;
  onDismissActionError: () => void;
  onClose: () => void;
}

function warrantyInfo(date: string | null): { label: string; tone: BadgeTone } | null {
  if (!date) return null;
  const days = daysUntil(date);
  if (days < 0) return { label: 'Expired', tone: 'danger' };
  if (days <= 60) return { label: `Ends in ${days} day${days === 1 ? '' : 's'}`, tone: 'warning' };
  return { label: 'Active', tone: 'success' };
}

export function AssetDetailDrawer({
  open,
  asset,
  history,
  hasMoreHistory,
  isLoading,
  error,
  actionError,
  isReactivating,
  onLoadMoreHistory,
  onEdit,
  onAssign,
  onDeactivate,
  onReactivate,
  onDismissActionError,
  onClose,
}: AssetDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Asset details"
      footer={
        asset && (
          <>
            {asset.isActive ? (
              <Button
                variant="ghost"
                onClick={() => onDeactivate(asset)}
                className="mr-auto hover:text-red-600 dark:hover:text-red-400"
              >
                <Power className="h-4 w-4" aria-hidden="true" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => onReactivate(asset)}
                isLoading={isReactivating}
                className="mr-auto"
              >
                {!isReactivating && <RotateCcw className="h-4 w-4" aria-hidden="true" />}
                Reactivate
              </Button>
            )}
            {asset.isActive && asset.status === 'AVAILABLE' && (
              <Button variant="accent" onClick={() => onAssign(asset)}>
                <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                Assign
              </Button>
            )}
            <Button onClick={() => onEdit(asset)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit asset
            </Button>
          </>
        )
      }
    >
      {error && !asset && (
        <Banner tone="error">
          {error.title}: {error.detail}
        </Banner>
      )}

      {!asset && !error && <DrawerSkeleton />}

      {asset && (
        <div className={cn('space-y-8 transition-opacity', isLoading && 'opacity-60')}>
          <AssetHeader asset={asset} />

          {actionError && (
            <Banner tone="error" onDismiss={onDismissActionError}>
              <span className="font-medium">{actionError.title}.</span> {actionError.detail}
            </Banner>
          )}

          <HolderCard asset={asset} />

          <section>
            <h3 className="mb-3 text-sm font-medium">Details</h3>
            <dl className="grid grid-cols-2 gap-3">
              <Detail label="Category">{asset.category.name}</Detail>
              <Detail label="Condition">{ASSET_CONDITION_LABEL[asset.condition]}</Detail>
              <Detail label="Brand">{asset.brand ?? '–'}</Detail>
              <Detail label="Model">{asset.model ?? '–'}</Detail>
              <Detail label="Serial number" mono>
                {asset.serialNumber ?? '–'}
              </Detail>
              <Detail label="Price">{formatAmount(asset.purchasePrice)}</Detail>
              <Detail label="Purchased">{formatDate(asset.purchaseDate)}</Detail>
              <Detail label="Warranty until">
                <span className="flex flex-wrap items-center gap-2">
                  {formatDate(asset.warrantyExpiryDate)}
                  {(() => {
                    const info = warrantyInfo(asset.warrantyExpiryDate);
                    return info && <Badge tone={info.tone}>{info.label}</Badge>;
                  })()}
                </span>
              </Detail>
            </dl>
            {asset.notes && (
              <p className="mt-3 rounded-2xl bg-surface-2/60 px-4 py-3 text-sm whitespace-pre-line">
                {asset.notes}
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-4 text-sm font-medium">History</h3>
            <AssetHistoryTimeline
              entries={history}
              hasMore={hasMoreHistory}
              isLoading={isLoading}
              onLoadMore={onLoadMoreHistory}
            />
          </section>
        </div>
      )}
    </Drawer>
  );
}

function AssetHeader({ asset }: { asset: Asset }) {
  const status = ASSET_STATUS_DISPLAY[asset.status];

  return (
    <header className="flex items-start gap-4">
      <span
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
          asset.isActive ? 'bg-tag/25' : 'bg-surface-2 text-ink-muted',
        )}
      >
        <CategoryIcon name={asset.category.name} className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-xs text-ink-muted">{asset.assetCode}</p>
        <h3 className="text-2xl font-light tracking-tight">{asset.name}</h3>
        <p className="mt-2 flex flex-wrap gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          {!asset.isActive && <Badge tone="neutral">Deactivated</Badge>}
        </p>
      </div>
    </header>
  );
}

function HolderCard({ asset }: { asset: Asset }) {
  const holder = asset.currentAssignment;
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3',
        holder ? 'bg-contrast text-contrast-fg' : 'border border-dashed border-line',
      )}
    >
      {holder ? (
        <>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tag text-sm font-medium text-tag-ink">
            {holder.employee.fullName
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs opacity-70">Currently with</p>
            <p className="truncate font-medium">
              {holder.employee.fullName}{' '}
              <span className="font-mono text-xs opacity-70">{holder.employee.employeeCode}</span>
            </p>
          </div>
          <p className="text-right text-xs opacity-70">
            since
            <br />
            {formatDate(holder.assignedAt)}
          </p>
        </>
      ) : (
        <p className="text-sm text-ink-muted">Not assigned to anyone.</p>
      )}
    </div>
  );
}

function Detail({ label, mono, children }: { label: string; mono?: boolean; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-2/60 px-4 py-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={cn('mt-0.5 text-sm', mono && 'font-mono text-xs')}>{children}</dd>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-surface-2" />
      <div className="h-14 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
