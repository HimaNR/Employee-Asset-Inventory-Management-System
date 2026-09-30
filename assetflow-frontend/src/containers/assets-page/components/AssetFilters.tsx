import { Search, X } from 'lucide-react';
import Button from '@/components/Button';
import Select, { type SelectOption } from '@/components/Select';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/types/asset.types';
import type { AssetFilters as Filters } from '../utils/asset-filters';

interface AssetFiltersProps {
  filters: Filters;
  categoryOptions: SelectOption[];
  canClear: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = ASSET_STATUSES.map((value) => ({
  value,
  label: ASSET_STATUS_DISPLAY[value].label,
}));

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
  canClear,
  onChange,
  onClear,
}: AssetFiltersProps) {
  return (
    <div className="space-y-3">
      <label className="relative block w-full lg:max-w-md">
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
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:flex lg:items-end">
        <Select
          label="Status"
          hideLabel
          placeholder="All statuses"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value as Filters['status'] })}
          className="lg:w-44"
        />
        <Select
          label="Category"
          hideLabel
          placeholder="All categories"
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
          className="lg:w-44"
        />
        <Select
          label="Condition"
          hideLabel
          placeholder="Any condition"
          options={CONDITION_OPTIONS}
          value={filters.condition}
          onChange={(event) =>
            onChange({ condition: event.target.value as Filters['condition'] })
          }
          className="lg:w-40"
        />
        <Select
          label="Activity"
          hideLabel
          placeholder="Active + deactivated"
          options={ACTIVITY_OPTIONS}
          value={filters.activity}
          onChange={(event) =>
            onChange({ activity: event.target.value as Filters['activity'] })
          }
          className="lg:w-48"
        />
        {canClear && (
          <Button variant="ghost" onClick={onClear} className="col-span-2 md:col-span-1">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
