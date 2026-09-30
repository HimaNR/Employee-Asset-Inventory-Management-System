import { Search } from 'lucide-react';
import Select from '@/components/Select';

export type StatusFilter = '' | 'active' | 'inactive';

interface CategoryFiltersProps {
  search: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function CategoryFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative block w-full sm:max-w-xs">
        <span className="sr-only">Search categories</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name or description"
          className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>

      <Select
        variant="filter"
        label="Status"
        hideLabel
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        placeholder="All statuses"
        options={STATUS_OPTIONS}
      />
    </div>
  );
}
