import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Card from '@/components/Card';
import { CategoryIcon } from '@/libs/category-icon';
import { formatDuration } from '@/libs/format';
import { initials } from '@/libs/initials';
import type { DashboardSummary } from '@/types/dashboard.types';

interface RecentAssignmentsCardProps {
  assignments: DashboardSummary['recentAssignments'];
  activeCount: number;
}

export function RecentAssignmentsCard({ assignments, activeCount }: RecentAssignmentsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">Recent assignments</h3>
          <p className="text-sm text-ink-muted">{activeCount} assets currently with employees</p>
        </div>
        <Link
          href="/assignments"
          aria-label="Open assignments"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface transition hover:shadow-md"
        >
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      </div>

      {assignments.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No active assignments.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="group flex items-center gap-3 rounded-2xl bg-surface-2/60 px-3 py-2.5 transition-colors hover:bg-surface-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tag/25 transition-transform group-hover:scale-105">
                <CategoryIcon name={a.asset.categoryName} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.asset.name}</p>
                <p className="font-mono text-[11px] text-ink-muted">{a.asset.assetCode}</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div className="hidden sm:block">
                  <p className="text-sm">{a.employee.fullName}</p>
                  <p className="text-[11px] text-ink-muted">{formatDuration(a.assignedAt)}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-contrast text-[11px] font-medium text-contrast-fg"
                >
                  {initials(a.employee.fullName)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
