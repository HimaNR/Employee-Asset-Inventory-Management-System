import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/libs/cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Set this to make the column header clickable for sorting */
  sortKey?: string;
  align?: 'left' | 'right';
  className?: string;
}

export interface TableSort {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  caption?: string;
}

export default function Table<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyMessage = 'No records found.',
  sort,
  onSortChange,
  caption,
}: TableProps<T>) {
  const handleSort = (sortKey: string) => {
    if (!onSortChange) return;
    const nextOrder = sort?.sortBy === sortKey && sort.sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange({ sortBy: sortKey, sortOrder: nextOrder });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead className="border-b border-line bg-paper text-xs font-medium text-ink-muted">
          <tr>
            {columns.map((column) => {
              const sortKey = column.sortKey;
              const isSorted = sortKey !== undefined && sort?.sortBy === sortKey;
              const ariaSort = isSorted
                ? sort?.sortOrder === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cn(
                    'px-4 py-2.5 whitespace-nowrap',
                    column.align === 'right' && 'text-right',
                    column.className,
                  )}
                >
                  {sortKey && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSort(sortKey)}
                      className="inline-flex items-center gap-1 rounded hover:text-ink"
                    >
                      {column.header}
                      {isSorted ? (
                        sort?.sortOrder === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className={cn('divide-y divide-line', isLoading && rows.length > 0 && 'opacity-60')}>
          {isLoading && rows.length === 0 ? (
            Array.from({ length: 5 }, (_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <span className="block h-3.5 w-3/4 animate-pulse rounded bg-paper" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-ink-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-paper/60">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 align-middle',
                      column.align === 'right' && 'text-right',
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
