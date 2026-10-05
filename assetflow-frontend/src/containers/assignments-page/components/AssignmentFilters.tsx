import { Search, X } from 'lucide-react';
import Button from '@/components/Button';
import Select, { type SelectOption } from '@/components/Select';
import { cn } from '@/libs/cn';
import type { AssignmentFilters as Filters } from '../utils/assignment-filters';

interface AssignmentFiltersProps {
  filters: Filters;
  counts: { active: number | null; returned: number | null };
  employeeOptions: SelectOption[];
  canClear: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}

const TABS: Array<{ value: Filters['status']; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RETURNED', label: 'Returned' },
  { value: '', label: 'All' },
];

export function AssignmentFilters({
  filters,
  counts,
  employeeOptions,
  canClear,
  onChange,
  onClear,
}: AssignmentFiltersProps) {
  const countFor = (value: Filters['status']) =>
    value === 'ACTIVE'
      ? counts.active
      : value === 'RETURNED'
        ? counts.returned
        : counts.active !== null && counts.returned !== null
          ? counts.active + counts.returned
          : null;

  return (
    <div className="space-y-3">
      {/* Row 1: status tabs with counts */}
      <div role="group" aria-label="Assignment status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isSelected = filters.status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange({ status: tab.value })}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]',
                isSelected
                  ? 'border-tag bg-tag text-tag-ink shadow-[0_8px_20px_-8px_rgba(246,207,69,0.8)]'
                  : 'border-line bg-surface text-ink',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'min-w-6 rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                  isSelected ? 'bg-tag-ink/10' : 'bg-surface-2 text-ink-muted',
                )}
              >
                {countFor(tab.value) ?? '·'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2: employee + date range */}
      <div className="flex flex-wrap items-end gap-2">
        <Select
          variant="filter"
          label="Employee"
          hideLabel
          placeholder="Any employee"
          options={employeeOptions}
          value={filters.employeeId}
          onChange={(event) => onChange({ employeeId: event.target.value })}
          className="w-full sm:w-60"
        />
        <DateFilter label="From" value={filters.from} max={filters.to} onChange={(from) => onChange({ from })} />
        <DateFilter label="To" value={filters.to} min={filters.from} onChange={(to) => onChange({ to })} />
        {canClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Row 3: search */}
      <label className="relative block w-full">
        <span className="sr-only">Search assignments</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search asset code or name, employee name or code"
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>
    </div>
  );
}

function DateFilter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        value ? 'border-contrast bg-contrast text-contrast-fg' : 'border-line bg-surface text-ink',
      )}
    >
      <span className={value ? 'opacity-70' : 'text-ink-muted'}>{label}</span>
      <input
        type="date"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm outline-none [color-scheme:inherit]"
      />
    </label>
  );
}
