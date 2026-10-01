import Link from 'next/link';
import Card from '@/components/Card';
import { CategoryIcon } from '@/libs/category-icon';
import { cn } from '@/libs/cn';
import type { DashboardSummary } from '@/types/dashboard.types';

interface CategoryBreakdownCardProps {
  categories: DashboardSummary['byCategory'];
}

/** Stacked bar per category: assigned | available | needs attention | lost/retired */
const SEGMENTS = [
  { key: 'assigned', label: 'Assigned', className: 'bg-contrast' },
  { key: 'available', label: 'Available', className: 'bg-tag' },
  { key: 'repair', label: 'Damaged / repair', className: 'bg-amber-500/70' },
  { key: 'other', label: 'Lost / retired', className: 'bg-line' },
] as const;

export function CategoryBreakdownCard({ categories }: CategoryBreakdownCardProps) {
  const max = Math.max(1, ...categories.map((c) => c.total));

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-medium">Assets by category</h3>
        <ul className="flex flex-wrap gap-3 text-xs text-ink-muted">
          {SEGMENTS.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', s.className)} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">No active assets yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {categories.map((category) => {
            const s = category.byStatus;
            const values = {
              assigned: s.ASSIGNED,
              available: s.AVAILABLE,
              repair: s.DAMAGED + s.UNDER_REPAIR,
              other: s.LOST + s.RETIRED,
            };
            return (
              <li key={category.categoryId} className="group">
                <Link
                  href="/assets"
                  className="flex items-center gap-3 rounded-2xl p-1 transition-colors hover:bg-surface-2/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tag/25 transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3">
                    <CategoryIcon name={category.name} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{category.name}</span>
                      <span className="text-ink-muted tabular-nums">{category.total}</span>
                    </div>
                    {/* Bar width is relative to the biggest category */}
                    <div
                      className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-surface-2"
                      style={{ width: `${(category.total / max) * 100}%` }}
                      role="img"
                      aria-label={`${category.name}: ${values.assigned} assigned, ${values.available} available, ${values.repair} in repair, ${values.other} lost or retired`}
                    >
                      {SEGMENTS.map((seg) =>
                        values[seg.key] > 0 ? (
                          <span
                            key={seg.key}
                            className={cn('h-full transition-all duration-500', seg.className)}
                            style={{ flexGrow: values[seg.key] }}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
