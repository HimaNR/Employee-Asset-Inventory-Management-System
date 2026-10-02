import { Search, X } from 'lucide-react';
import Button from '@/components/Button';
import Select, { type SelectOption } from '@/components/Select';
import { ASSET_CONDITION_LABEL } from '@/libs/asset-display';
import { ASSET_CONDITIONS } from '@/types/asset.types';
import { DEFAULT_FILTERS, type AssetFilters as Filters } from '../utils/asset-filters';

interface AssetFiltersProps {
  filters: Filters;
  categoryOptions: SelectOption[];
  employeeOptions: SelectOption[];
  canClear: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((value) => ({
  value,
  label: ASSET_CONDITION_LABEL[value],
}));

const ACTIVITY_OPTIONS = [
  { value: 'active', label: 'Active assets' },
  { value: 'inactive', label: 'Deactivated' },
];

export function AssetFilters({
  filters,
  categoryOptions,
  employeeOptions,
  canClear,
  onChange,
  onClear,
}: AssetFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Row 2: dropdown filters (2 per row on phones, one line on wide screens) */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Select
          variant="filter"
          label="Category"
          hideLabel
          placeholder="All categories"
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
          className="w-full sm:w-44"
        />
        <Select
          variant="filter"
          label="Assigned to"
          hideLabel
          placeholder="Assigned to anyone"
          options={employeeOptions}
          value={filters.employeeId}
          onChange={(event) => onChange({ employeeId: event.target.value })}
          className="w-full sm:w-60"
        />
        <Select
          variant="filter"
          label="Condition"
          hideLabel
          placeholder="Any condition"
          options={CONDITION_OPTIONS}
          value={filters.condition}
          onChange={(event) =>
            onChange({ condition: event.target.value as Filters['condition'] })
          }
          className="w-full sm:w-44"
        />
        <Select
          variant="filter"
          label="Activity"
          hideLabel
          placeholder="Active + deactivated"
          options={ACTIVITY_OPTIONS}
          value={filters.activity}
          neutralValue={DEFAULT_FILTERS.activity}
          onChange={(event) =>
            onChange({ activity: event.target.value as Filters['activity'] })
          }
          className="w-full sm:w-52"
        />
        {canClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="col-span-2 sm:col-span-1">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Row 3: search */}
      <label className="relative block w-full">
        <span className="sr-only">Search assets</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search code, name, serial, brand or model"
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>
    </div>
  );
}
