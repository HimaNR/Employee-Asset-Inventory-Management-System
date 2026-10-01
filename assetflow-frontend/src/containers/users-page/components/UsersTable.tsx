import { KeyRound, Pencil } from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import { cn } from '@/libs/cn';
import { formatRelative } from '@/libs/format';
import { initials } from '@/libs/initials';
import { roleDisplay } from '@/libs/role-display';
import type { User } from '@/types/user.types';

interface UsersTableProps {
  users: User[];
  currentUserId: string;
  isLoading: boolean;
  sort: TableSort;
  onSortChange: (sort: TableSort) => void;
  onEdit: (user: User) => void;
  onSetPassword: (user: User) => void;
}

export function UsersTable({
  users,
  currentUserId,
  isLoading,
  sort,
  onSortChange,
  onEdit,
  onSetPassword,
}: UsersTableProps) {
  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      header: 'User',
      sortKey: 'email',
      cell: (u) => (
        <div className="flex min-w-[16rem] items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-medium transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3',
              u.status === 'ACTIVE' ? 'bg-tag/25' : 'bg-surface-2 text-ink-muted',
            )}
          >
            {initials(u.employee?.fullName ?? u.email)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium">
              {u.email}
              {u.id === currentUserId && <Badge tone="info">You</Badge>}
            </p>
            <p className="text-xs text-ink-muted">
              {u.employee ? `${u.employee.fullName} · ${u.employee.employeeCode}` : 'No employee link'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (u) => {
        const role = roleDisplay(u.role.name);
        return <Badge tone={role.tone}>{role.label}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) =>
        u.status === 'ACTIVE' ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
    },
    {
      key: 'lastLoginAt',
      header: 'Last sign-in',
      sortKey: 'lastLoginAt',
      cell: (u) => (
        <span className="text-ink-muted">{u.lastLoginAt ? formatRelative(u.lastLoginAt) : 'Never'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(u)} aria-label={`Edit ${u.email}`}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetPassword(u)}
            aria-label={`Set password for ${u.email}`}
          >
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      caption="System users"
      columns={columns}
      rows={users}
      getRowKey={(u) => u.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      emptyMessage="No users match your filters."
    />
  );
}
