import { Search, X } from 'lucide-react';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { DEFAULT_FILTERS, type EmployeeFilters as Filters } from '../utils/employee-filters';

interface EmployeeFiltersProps {
  filters: Filters;
  departments: string[];
  canClear: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active employees' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function EmployeeFilters({
  filters,
  departments,
  canClear,
  onChange,
  onClear,
}: EmployeeFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          variant="filter"
          label="Status"
          hideLabel
          placeholder="Active + inactive"
          options={STATUS_OPTIONS}
          value={filters.status}
          neutralValue={DEFAULT_FILTERS.status}
          onChange={(event) => onChange({ status: event.target.value as Filters['status'] })}
          className="w-full sm:w-52"
        />
        <Select
          variant="filter"
          label="Department"
          hideLabel
          placeholder="All departments"
          options={departments.map((d) => ({ value: d, label: d }))}
          value={filters.department}
          onChange={(event) => onChange({ department: event.target.value })}
          className="w-full sm:w-52"
        />
        {canClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      <label className="relative block w-full">
        <span className="sr-only">Search employees</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search name, code, email, department or designation"
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>
    </div>
  );
}
