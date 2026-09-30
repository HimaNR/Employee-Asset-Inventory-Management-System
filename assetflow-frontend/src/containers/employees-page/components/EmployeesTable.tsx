import { Eye, Laptop, Pencil } from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { cn } from '@/libs/cn';
import { initials } from '@/libs/initials';
import type { Employee } from '@/types/employee.types';

interface EmployeesTableProps {
  employees: Employee[];
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  activeEmployeeId: string | null;
}

const BASE_COLUMNS: TableColumn<Employee>[] = [
  {
    key: 'employee',
    header: 'Employee',
    sortKey: 'firstName',
    cell: (employee) => {
      const isActive = employee.status === 'ACTIVE';
      return (
        <div className="flex min-w-[16rem] items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-medium transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3',
              isActive ? 'bg-tag/25 text-ink' : 'bg-surface-2 text-ink-muted',
            )}
          >
            {initials(employee.fullName)}
          </span>
          <div className="min-w-0">
            <p className={cn('truncate font-medium', !isActive && 'text-ink-muted')}>
              {employee.fullName}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
              <span className="rounded-md border border-line px-1.5 py-px font-mono text-[11px] text-ink">
                {employee.employeeCode}
              </span>
              <span className="truncate">{employee.email}</span>
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'department',
    header: 'Department',
    sortKey: 'department',
    cell: (employee) => (
      <div>
        <p>{employee.department ?? '–'}</p>
        <p className="text-xs text-ink-muted">{employee.designation ?? ''}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (employee) =>
      employee.status === 'ACTIVE' ? (
        <Badge tone="success">Active</Badge>
      ) : (
        <Badge tone="neutral">Inactive</Badge>
      ),
  },
  {
    key: 'assets',
    header: 'Assets held',
    cell: (employee) =>
      employee.activeAssetCount > 0 ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-contrast px-3 py-1 text-xs font-medium text-contrast-fg">
          <Laptop className="h-3.5 w-3.5" aria-hidden="true" />
          {employee.activeAssetCount}
        </span>
      ) : (
        <span className="text-ink-muted/60">None</span>
      ),
  },
];

export function EmployeesTable({
  employees,
  isLoading,
  sort,
  onSortChange,
  onView,
  onEdit,
  activeEmployeeId,
}: EmployeesTableProps) {
  const columns: TableColumn<Employee>[] = [
    ...BASE_COLUMNS,
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (employee) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(employee)}
            aria-label={`View ${employee.fullName}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(employee)}
            aria-label={`Edit ${employee.fullName}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      caption="Employees"
      columns={columns}
      rows={employees}
      getRowKey={(employee) => employee.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onView}
      activeRowKey={activeEmployeeId}
      emptyMessage="No employees match your filters."
    />
  );
}
