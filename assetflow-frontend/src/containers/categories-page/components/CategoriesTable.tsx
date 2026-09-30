import { Pencil, Power, RotateCcw } from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { categoryIcon } from '@/libs/category-icon';
import { cn } from '@/libs/cn';
import { formatDate } from '@/libs/format';
import type { Category } from '@/types/category.types';

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => void;
  onReactivate: (category: Category) => void;
  reactivatingId: string | null;
}

export function CategoriesTable({
  categories,
  isLoading,
  sort,
  onSortChange,
  onEdit,
  onDeactivate,
  onReactivate,
  reactivatingId,
}: CategoriesTableProps) {
  const columns: TableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Category',
      sortKey: 'name',
      cell: (category) => {
        const Icon = categoryIcon(category.name);
        return (
          <div className="flex min-w-[14rem] items-center gap-3">
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3',
                category.isActive ? 'bg-tag/25 text-ink' : 'bg-surface-2 text-ink-muted',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className={cn('font-medium', !category.isActive && 'text-ink-muted')}>
                {category.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
                {category.description ?? 'No description'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'assets',
      header: 'Assets',
      align: 'right',
      cell: (category) => (
        <span className="text-base font-light tabular-nums">{category.assetCount}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (category) =>
        category.isActive ? (
          <Badge tone="success">Active</Badge>
        ) : (
          <Badge tone="neutral">Inactive</Badge>
        ),
    },
    {
      key: 'updatedAt',
      header: 'Last updated',
      sortKey: 'updatedAt',
      cell: (category) => <span className="text-ink-muted">{formatDate(category.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            aria-label={`Edit ${category.name}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
          {category.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeactivate(category)}
              aria-label={`Deactivate ${category.name}`}
              className="hover:text-red-600 dark:hover:text-red-400"
            >
              <Power className="h-3.5 w-3.5" aria-hidden="true" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReactivate(category)}
              isLoading={reactivatingId === category.id}
              aria-label={`Reactivate ${category.name}`}
            >
              {reactivatingId !== category.id && (
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      caption="Asset categories"
      columns={columns}
      rows={categories}
      getRowKey={(category) => category.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      emptyMessage="No categories match your filters."
    />
  );
}
