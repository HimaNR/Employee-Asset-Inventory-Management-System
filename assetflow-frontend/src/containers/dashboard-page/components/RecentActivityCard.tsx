import {
  Activity,
  ArrowRightLeft,
  Pencil,
  Power,
  RotateCcw,
  Sparkles,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import Card from '@/components/Card';
import { cn } from '@/libs/cn';
import { formatRelative } from '@/libs/format';
import type { AssetHistoryAction } from '@/types/asset.types';
import type { DashboardSummary } from '@/types/dashboard.types';

interface RecentActivityCardProps {
  activity: DashboardSummary['recentActivity'];
}

const ACTION_STYLE: Record<AssetHistoryAction, { icon: LucideIcon; dot: string }> = {
  CREATED: { icon: Sparkles, dot: 'bg-tag text-tag-ink' },
  UPDATED: { icon: Pencil, dot: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  ASSIGNED: { icon: ArrowRightLeft, dot: 'bg-contrast text-contrast-fg' },
  RETURNED: { icon: Undo2, dot: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  STATUS_CHANGED: { icon: Activity, dot: 'bg-amber-500/20 text-amber-800 dark:text-amber-300' },
  DEACTIVATED: { icon: Power, dot: 'bg-red-500/15 text-red-700 dark:text-red-300' },
  REACTIVATED: { icon: RotateCcw, dot: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
};

/** Latest lifecycle events across ALL assets */
export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-medium">Recent activity</h3>
      {activity.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nothing has happened yet.</p>
      ) : (
        <ol className="relative mt-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line">
          {activity.map((event) => {
            const style = ACTION_STYLE[event.action];
            const Icon = style.icon;
            return (
              <li key={event.id} className="group relative flex gap-3">
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface transition-transform duration-200 group-hover:scale-110',
                    style.dot,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-sm">
                    <span className="font-mono text-xs">{event.asset.assetCode}</span>{' '}
                    <span className="text-ink-muted">{event.description}</span>
                  </p>
                  <p className="text-xs text-ink-muted/80">
                    <time dateTime={event.createdAt}>{formatRelative(event.createdAt)}</time> · by{' '}
                    {event.performedBy?.email ?? 'System'}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
