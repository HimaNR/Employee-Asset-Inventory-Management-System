import { ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { cn } from '@/libs/cn';
import { ASSET_STATUSES, type AssetStatus } from '@/types/asset.types';

interface StatusSummaryProps {
  counts: Record<AssetStatus, number> | null;
  selected: AssetStatus | '';
  onSelect: (status: AssetStatus | '') => void;
}

const DOT: Record<string, string> = {
  success: 'bg-emerald-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-ink-muted',
};

/** Status chips with live counts; clicking one filters the table (click again to clear) */
export function StatusSummary({ counts, selected, onSelect }: StatusSummaryProps) {
  const total = counts ? ASSET_STATUSES.reduce((sum, status) => sum + counts[status], 0) : null;

  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      <Chip label="All" count={total} isSelected={selected === ''} onClick={() => onSelect('')} />
      {ASSET_STATUSES.map((status) => {
        const display = ASSET_STATUS_DISPLAY[status];
        return (
          <Chip
            key={status}
            label={display.label}
            count={counts ? counts[status] : null}
            dotClass={DOT[display.tone]}
            isSelected={selected === status}
            onClick={() => onSelect(selected === status ? '' : status)}
          />
        );
      })}
    </div>
  );
}

function Chip({
  label,
  count,
  dotClass,
  isSelected,
  onClick,
}: {
  label: string;
  count: number | null;
  dotClass?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        'group inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]',
        isSelected
          ? 'border-tag bg-tag text-tag-ink shadow-[0_8px_20px_-8px_rgba(246,207,69,0.8)]'
          : 'border-line bg-surface text-ink',
      )}
    >
      {dotClass && <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', dotClass)} />}
      {label}
      <span
        className={cn(
          'min-w-6 rounded-full px-1.5 py-0.5 text-xs tabular-nums',
          isSelected ? 'bg-tag-ink/10' : 'bg-surface-2 text-ink-muted',
        )}
      >
        {count ?? '·'}
      </span>
    </button>
  );
}
