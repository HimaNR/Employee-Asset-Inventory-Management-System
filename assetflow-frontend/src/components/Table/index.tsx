import type { MouseEvent, ReactNode } from 'react';
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
  /** Makes whole rows clickable (buttons inside a row keep working normally) */
  onRowClick?: (row: T) => void;
  /** Highlights one row, e.g. the one open in a side panel */
  activeRowKey?: string | null;
}

/** Clicks on buttons/links/fields or text selection should not count as a row click */
function shouldIgnoreClick(event: MouseEvent<HTMLElement>): boolean {
  const target = event.target as HTMLElement;
  if (target.closest('button, a, input, select, textarea, label')) return true;
  return Boolean(window.getSelection()?.toString());
}

/**
 * Responsive data table:
 * - md and up: a classic table with sortable headers
 * - phones: every row becomes a card ("label: value" lines) with a sort picker on top
 */
export default function Table<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyMessage = 'No records found.',
  sort,
  onSortChange,
  caption,
  onRowClick,
  activeRowKey = null,
}: TableProps<T>) {
  const handleSort = (sortKey: string) => {
    if (!onSortChange) return;
    const nextOrder = sort?.sortBy === sortKey && sort.sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange({ sortBy: sortKey, sortOrder: nextOrder });
  };

  const handleRowClick = (event: MouseEvent<HTMLElement>, row: T) => {
    if (!onRowClick || shouldIgnoreClick(event)) return;
    onRowClick(row);
  };

  const sortableColumns = columns.filter((column) => column.sortKey);
  const [titleColumn, ...detailColumns] = columns;
  const isFirstLoad = isLoading && rows.length === 0;

  return (
    <div>
      {/* ---------------- Desktop / tablet: table ---------------- */}
      <div className="hidden overflow-x-auto rounded-3xl border border-line/70 bg-surface/85 backdrop-blur-sm md:block">
        <table className="w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead className="border-b border-line bg-surface-2/60 text-xs font-medium text-ink-muted">
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
                      'px-5 py-3.5 whitespace-nowrap',
                      column.align === 'right' && 'text-right',
                      column.className,
                    )}
                  >
                    {sortKey && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => handleSort(sortKey)}
                        className="inline-flex items-center gap-1 rounded-full transition-colors hover:text-ink"
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

          <tbody
            className={cn(
              'divide-y divide-line/70 transition-opacity',
              isLoading && rows.length > 0 && 'opacity-50',
            )}
          >
            {isFirstLoad ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4">
                      <span className="block h-3.5 w-3/4 animate-pulse rounded-full bg-surface-2" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-14 text-center text-sm text-ink-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowKey = getRowKey(row);
                return (
                  <tr
                    key={rowKey}
                    onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
                    className={cn(
                      'group transition-all duration-200 hover:bg-tag/[0.09] hover:shadow-[inset_3px_0_0_var(--tag)]',
                      onRowClick && 'cursor-pointer',
                      rowKey === activeRowKey && 'bg-tag/[0.14] shadow-[inset_3px_0_0_var(--tag)]',
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-5 py-4 align-middle',
                          column.align === 'right' && 'text-right',
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Phones: cards ---------------- */}
      <div className="space-y-3 md:hidden">
        {onSortChange && sortableColumns.length > 0 && rows.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <label className="flex flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 shadow-sm">
              <span className="text-ink-muted">Sort</span>
              <select
                value={sort?.sortBy ?? ''}
                onChange={(event) =>
                  onSortChange({ sortBy: event.target.value, sortOrder: sort?.sortOrder ?? 'asc' })
                }
                className="min-w-0 flex-1 bg-transparent font-medium outline-none"
              >
                {sortableColumns.map((column) => (
                  <option key={column.key} value={column.sortKey}>
                    {column.header}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-label={sort?.sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
              onClick={() =>
                onSortChange({
                  sortBy: sort?.sortBy ?? sortableColumns[0].sortKey!,
                  sortOrder: sort?.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface shadow-sm"
            >
              {sort?.sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {isFirstLoad ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-surface-2" aria-hidden="true" />
          ))
        ) : rows.length === 0 ? (
          <p className="rounded-3xl border border-line/70 bg-surface/85 px-5 py-12 text-center text-sm text-ink-muted">
            {emptyMessage}
          </p>
        ) : (
          <ul aria-label={caption} className={cn('space-y-3', isLoading && 'opacity-50')}>
            {rows.map((row) => {
              const rowKey = getRowKey(row);
              return (
                <li
                  key={rowKey}
                  onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
                  className={cn(
                    'group rounded-3xl border border-line/70 bg-surface/85 p-4 transition-all duration-200 active:scale-[0.99]',
                    onRowClick && 'cursor-pointer',
                    rowKey === activeRowKey && 'border-tag shadow-[inset_3px_0_0_var(--tag)]',
                  )}
                >
                  {titleColumn && <div className="min-w-0">{titleColumn.cell(row)}</div>}
                  <dl className="mt-3 space-y-2 border-t border-line/70 pt-3 text-sm">
                    {detailColumns.map((column) =>
                      column.key === 'actions' ? (
                        <div key={column.key} className="flex justify-end pt-1">
                          {column.cell(row)}
                        </div>
                      ) : (
                        <div key={column.key} className="flex items-start justify-between gap-4">
                          <dt className="shrink-0 text-xs text-ink-muted">{column.header}</dt>
                          <dd className="min-w-0 text-right">{column.cell(row)}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
