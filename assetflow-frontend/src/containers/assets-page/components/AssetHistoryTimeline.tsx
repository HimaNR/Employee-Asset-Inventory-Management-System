import {
  Activity,
  ArrowRight,
  ArrowRightLeft,
  Pencil,
  Power,
  RotateCcw,
  Sparkles,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { cn } from '@/libs/cn';
import { formatDateTime } from '@/libs/format';
import type { AssetHistoryAction, AssetHistoryEntry } from '@/types/asset.types';

interface AssetHistoryTimelineProps {
  entries: AssetHistoryEntry[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

const ACTION_STYLE: Record<AssetHistoryAction, { icon: LucideIcon; label: string; dot: string }> = {
  CREATED: { icon: Sparkles, label: 'Registered', dot: 'bg-tag text-tag-ink' },
  UPDATED: { icon: Pencil, label: 'Updated', dot: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  ASSIGNED: { icon: ArrowRightLeft, label: 'Assigned', dot: 'bg-contrast text-contrast-fg' },
  RETURNED: { icon: Undo2, label: 'Returned', dot: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  STATUS_CHANGED: { icon: Activity, label: 'Status changed', dot: 'bg-amber-500/20 text-amber-800 dark:text-amber-300' },
  DEACTIVATED: { icon: Power, label: 'Deactivated', dot: 'bg-red-500/15 text-red-700 dark:text-red-300' },
  REACTIVATED: { icon: RotateCcw, label: 'Reactivated', dot: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
};

function changedFields(entry: AssetHistoryEntry): string[] {
  const fields = entry.metadata?.changedFields;
  return Array.isArray(fields) ? fields.map(String) : [];
}

/** US-08: every important lifecycle event, newest first */
export function AssetHistoryTimeline({
  entries,
  hasMore,
  isLoading,
  onLoadMore,
}: AssetHistoryTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-ink-muted">No history yet.</p>;
  }

  return (
    <div>
      <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-px before:bg-line">
        {entries.map((entry) => {
          const style = ACTION_STYLE[entry.action];
          const Icon = style.icon;
          const fields = changedFields(entry);
          const statusChanged =
            entry.previousStatus !== null &&
            entry.newStatus !== null &&
            entry.previousStatus !== entry.newStatus;

          return (
            <li key={entry.id} className="group relative flex gap-4">
              <span
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-surface transition-transform duration-200 group-hover:scale-110',
                  style.dot,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1 rounded-2xl bg-surface-2/60 px-4 py-3 transition-colors group-hover:bg-surface-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-medium">{style.label}</p>
                  <time dateTime={entry.createdAt} className="text-xs text-ink-muted">
                    {formatDateTime(entry.createdAt)}
                  </time>
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">{entry.description}</p>

                {statusChanged && entry.previousStatus && entry.newStatus && (
                  <p className="mt-2 flex items-center gap-2">
                    <Badge tone={ASSET_STATUS_DISPLAY[entry.previousStatus].tone}>
                      {ASSET_STATUS_DISPLAY[entry.previousStatus].label}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-label="changed to" />
                    <Badge tone={ASSET_STATUS_DISPLAY[entry.newStatus].tone}>
                      {ASSET_STATUS_DISPLAY[entry.newStatus].label}
                    </Badge>
                  </p>
                )}

                {fields.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {fields.map((field) => (
                      <span
                        key={field}
                        className="rounded-md border border-line px-1.5 py-px font-mono text-[11px]"
                      >
                        {field}
                      </span>
                    ))}
                  </p>
                )}

                <p className="mt-2 text-xs text-ink-muted/80">
                  by {entry.performedBy?.email ?? 'System'}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {hasMore && (
        <div className="mt-5 text-center">
          <Button variant="secondary" size="sm" onClick={onLoadMore} isLoading={isLoading}>
            Load older events
          </Button>
        </div>
      )}
    </div>
  );
}
