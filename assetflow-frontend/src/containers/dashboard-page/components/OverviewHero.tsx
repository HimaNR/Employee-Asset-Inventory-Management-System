import { Layers, Laptop, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ApiError } from '@/libs/api/api-error';
import { cn } from '@/libs/cn';
import type { DashboardOverview } from '@/types/dashboard.types';

interface OverviewHeroProps {
  /** Shown in the greeting, e.g. "Nimal" or "Manager" */
  greetingName: string;
  overview: DashboardOverview | null;
  error: ApiError | null;
  isLoading: boolean;
}

const TODAY = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function OverviewHero({ greetingName, overview, error, isLoading }: OverviewHeroProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="min-w-0">
        <p className="text-sm text-ink-muted">{TODAY.format(new Date())}</p>
        <h2 className="mt-1 text-4xl font-light tracking-tight sm:text-5xl">
          Welcome back, {greetingName}
        </h2>

        <div className="mt-7">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Could not load inventory figures: {error.title}
            </p>
          ) : isLoading && !overview ? (
            <div className="h-[4.5rem] animate-pulse rounded-full bg-surface-2" />
          ) : overview ? (
            <UtilisationBar overview={overview} />
          ) : null}
        </div>
      </div>

      <div className="flex gap-8 sm:gap-10">
        <BigNumber icon={<Laptop className="h-4 w-4" />} value={overview?.totalAssets} label="Assets" />
        <BigNumber icon={<UserCheck className="h-4 w-4" />} value={overview?.assigned} label="Assigned" />
        <BigNumber icon={<Layers className="h-4 w-4" />} value={overview?.categories} label="Categories" />
      </div>
    </section>
  );
}

/** Crextio-style segmented bar: each pill is sized by its share of the inventory */
function UtilisationBar({ overview }: { overview: DashboardOverview }) {
  const { totalAssets, assigned, available, inRepair } = overview;
  const other = Math.max(0, totalAssets - assigned - available - inRepair);
  const percent = (value: number) =>
    totalAssets === 0 ? '0%' : `${Math.round((value / totalAssets) * 100)}%`;

  const segments = [
    { label: 'Assigned', value: assigned, className: 'bg-contrast text-contrast-fg' },
    { label: 'Available', value: available, className: 'bg-tag text-tag-ink' },
    {
      label: 'In repair',
      value: inRepair,
      className:
        'text-ink bg-[repeating-linear-gradient(135deg,var(--line)_0_6px,transparent_6px_12px)] border border-line',
    },
    { label: 'Lost / retired', value: other, className: 'border border-ink-muted/40 text-ink-muted' },
  ].filter((segment) => segment.value > 0);

  if (segments.length === 0) {
    return <p className="text-sm text-ink-muted">No active assets yet.</p>;
  }

  return (
    <div className="flex w-full gap-2" role="list" aria-label="Asset utilisation">
      {segments.map((segment) => (
        <div
          key={segment.label}
          role="listitem"
          className="group min-w-[5.5rem]"
          style={{ flexGrow: segment.value, flexBasis: 0 }}
        >
          <p className="mb-2 truncate text-sm text-ink-muted">{segment.label}</p>
          <div
            className={cn(
              'flex h-11 items-center rounded-full px-4 text-sm font-medium transition-transform duration-300 group-hover:-translate-y-1',
              segment.className,
            )}
          >
            {percent(segment.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function BigNumber({ icon, value, label }: { icon: ReactNode; value?: number; label: string }) {
  return (
    <div className="group">
      <p className="text-5xl font-light tracking-tight tabular-nums sm:text-6xl">
        {value === undefined ? <span className="text-ink-muted/40">–</span> : value}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        {label}
      </p>
    </div>
  );
}
