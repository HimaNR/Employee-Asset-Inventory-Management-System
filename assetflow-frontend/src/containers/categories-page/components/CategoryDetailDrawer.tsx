'use client';

import { Search } from 'lucide-react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Drawer from '@/components/Drawer';
import type { ApiError } from '@/libs/api/api-error';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { CategoryIcon } from '@/libs/category-icon';
import { cn } from '@/libs/cn';
import { formatAmount } from '@/libs/format';
import { ASSET_STATUSES, type Asset, type AssetStatus } from '@/types/asset.types';
import type { Category } from '@/types/category.types';

interface CategoryDetailDrawerProps {
  open: boolean;
  category: Category | null;
  assets: Asset[];
  total: number;
  counts: Record<AssetStatus, number> | null;
  hasMore: boolean;
  isLoading: boolean;
  error: ApiError | null;
  search: string;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  onClose: () => void;
}

/** Everything in one category: status breakdown + every asset with its details */
export function CategoryDetailDrawer({
  open,
  category,
  assets,
  total,
  counts,
  hasMore,
  isLoading,
  error,
  search,
  onSearchChange,
  onLoadMore,
  onClose,
}: CategoryDetailDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Category details">
      {category && (
        <div className="space-y-6">
          <header className="flex items-start gap-4">
            <span
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                category.isActive ? 'bg-tag/25' : 'bg-surface-2 text-ink-muted',
              )}
            >
              <CategoryIcon name={category.name} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h3 className="text-2xl font-light tracking-tight">{category.name}</h3>
              <p className="text-sm text-ink-muted">{category.description ?? 'No description'}</p>
              <p className="mt-2">
                {category.isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
              </p>
            </div>
          </header>

          {/* Status breakdown of the ACTIVE assets in this category */}
          <div className="grid grid-cols-3 gap-2">
            {ASSET_STATUSES.map((status) => {
              const display = ASSET_STATUS_DISPLAY[status];
              return (
                <div key={status} className="rounded-2xl bg-surface-2/60 px-3 py-2.5">
                  <p className="text-2xl font-light tabular-nums">{counts ? counts[status] : '·'}</p>
                  <p className="truncate text-xs text-ink-muted">{display.label}</p>
                </div>
              );
            })}
          </div>

          <section>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium">
                Assets <span className="text-ink-muted">({total})</span>
              </h3>
            </div>
            <label className="relative mb-3 block">
              <span className="sr-only">Search assets in {category.name}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search code, name, serial, brand"
                className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink transition-all placeholder:text-ink-muted/70 focus:shadow-md"
              />
            </label>

            {error && (
              <Banner tone="error">
                {error.title}: {error.detail}
              </Banner>
            )}

            {isLoading && assets.length === 0 ? (
              <div className="space-y-2" aria-hidden="true">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-2" />
                ))}
              </div>
            ) : assets.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted">
                {search ? 'No assets match your search.' : 'No assets in this category yet.'}
              </p>
            ) : (
              <ul className={cn('space-y-2 transition-opacity', isLoading && 'opacity-60')}>
                {assets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} />
                ))}
              </ul>
            )}

            {hasMore && (
              <div className="mt-4 text-center">
                <Button variant="secondary" size="sm" onClick={onLoadMore} isLoading={isLoading}>
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

function AssetRow({ asset }: { asset: Asset }) {
  const status = ASSET_STATUS_DISPLAY[asset.status];
  return (
    <li className="rounded-2xl bg-surface-2/60 px-4 py-3 transition-colors hover:bg-surface-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line px-1.5 py-px font-mono text-[11px]">
              {asset.assetCode}
            </span>
            <span className="truncate text-sm font-medium">{asset.name}</span>
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {[asset.brand, asset.model].filter(Boolean).join(' ') || 'No brand/model'}
            {asset.serialNumber && <span className="font-mono"> · {asset.serialNumber}</span>}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tone={status.tone}>{status.label}</Badge>
          {!asset.isActive && <Badge>Deactivated</Badge>}
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-ink-muted">Condition</dt>
          <dd>{ASSET_CONDITION_LABEL[asset.condition]}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">With</dt>
          <dd className="truncate">{asset.currentAssignment?.employee.fullName ?? '–'}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Price</dt>
          <dd>{formatAmount(asset.purchasePrice)}</dd>
        </div>
      </dl>
    </li>
  );
}
