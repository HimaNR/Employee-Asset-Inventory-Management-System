import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Card from '@/components/Card';
import { cn } from '@/libs/cn';
import type { DashboardSummary } from '@/types/dashboard.types';

interface AttentionCardProps {
  attention: DashboardSummary['attention'];
}

export function AttentionCard({ attention }: AttentionCardProps) {
  const items: Array<{ label: string; value: number; icon: LucideIcon; tone: string }> = [
    { label: 'Damaged', value: attention.damaged, icon: AlertTriangle, tone: 'bg-red-500/12 text-red-700 dark:text-red-300' },
    { label: 'Under repair', value: attention.underRepair, icon: Wrench, tone: 'bg-amber-500/15 text-amber-800 dark:text-amber-300' },
    { label: 'Lost', value: attention.lost, icon: ShieldAlert, tone: 'bg-red-500/12 text-red-700 dark:text-red-300' },
    {
      label: 'Warranty ends in 60 days',
      value: attention.warrantyExpiringSoon,
      icon: CalendarClock,
      tone: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
    },
  ];
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <Card interactive className="flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">Needs attention</h3>
          <p className="text-sm text-ink-muted">
            {total === 0 ? 'Everything looks good.' : `${total} item${total === 1 ? '' : 's'} to check`}
          </p>
        </div>
        <Link
          href="/assets"
          aria-label="Open assets"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface transition hover:shadow-md"
        >
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      </div>

      <ul className="mt-5 space-y-2">
        {items.map(({ label, value, icon: Icon, tone }) => (
          <li
            key={label}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors',
              value > 0 ? tone : 'bg-surface-2/60 text-ink-muted',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-sm">{label}</span>
            <span className="text-xl font-light tabular-nums">{value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
