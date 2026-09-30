import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import type { PaginationMeta } from '@/types/api.types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  isDisabled?: boolean;
}

export default function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  isDisabled = false,
}: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Showing <span className="font-medium text-ink">{from}</span>–
        <span className="font-medium text-ink">{to}</span> of{' '}
        <span className="font-medium text-ink">{total}</span>
      </p>

      <div className="flex items-center gap-3">
        {onLimitChange && (
          <label className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={limit}
              disabled={isDisabled}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="h-8 rounded-md border border-line bg-white px-2 text-sm text-ink"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <span className="whitespace-nowrap">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-1">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous page"
            disabled={isDisabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next page"
            disabled={isDisabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
