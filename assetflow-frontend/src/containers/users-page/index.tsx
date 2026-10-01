'use client';

import { Search, UserPlus } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import Select from '@/components/Select';
import { useSession } from '@/libs/auth/use-session';
import type { UserStatus } from '@/types/user.types';
import { PasswordModal } from './components/PasswordModal';
import { UserFormModal } from './components/UserFormModal';
import { UsersTable } from './components/UsersTable';
import { useUsersPage } from './hooks/useUsersPage';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function UsersPage() {
  const page = useUsersPage();
  const session = useSession();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <p className="text-6xl font-light tracking-tight tabular-nums">{page.meta.total}</p>
          <p className="pb-2 text-sm leading-tight text-ink-muted">
            system
            <br />
            users
          </p>
        </div>
        <Button onClick={page.openCreate}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add user
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          variant="filter"
          label="Role"
          hideLabel
          placeholder="All roles"
          options={page.roleOptions}
          value={page.roleId}
          onChange={(event) => page.changeRole(event.target.value)}
          className="w-48"
        />
        <Select
          variant="filter"
          label="Status"
          hideLabel
          placeholder="Any status"
          options={STATUS_OPTIONS}
          value={page.status}
          onChange={(event) => page.changeStatus(event.target.value as UserStatus | '')}
          className="w-44"
        />
      </div>
      <label className="relative block w-full">
        <span className="sr-only">Search users</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={page.search}
          onChange={(event) => page.changeSearch(event.target.value)}
          placeholder="Search email or linked employee"
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>

      {page.notice && (
        <Banner tone="success" onDismiss={page.dismissNotice}>
          {page.notice}
        </Banner>
      )}

      {page.listError ? (
        <Banner tone="error">
          {page.listError.title}: {page.listError.detail}
        </Banner>
      ) : (
        <>
          <UsersTable
            users={page.users}
            currentUserId={session?.user.id ?? ''}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
            onEdit={page.openEdit}
            onSetPassword={page.openPassword}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <UserFormModal
        key={`form-${page.form.key}`}
        open={page.form.open}
        user={page.form.user}
        roleOptions={page.roleOptions}
        isSubmitting={page.isSaving}
        serverError={page.saveError}
        onSubmit={page.saveUser}
        onClose={page.closeForm}
      />
      <PasswordModal
        key={`password-${page.passwordDialog.key}`}
        open={page.passwordDialog.open}
        user={page.passwordDialog.user}
        isSubmitting={page.isSettingPassword}
        serverError={page.passwordError}
        onSubmit={page.savePassword}
        onClose={page.closePassword}
      />
    </div>
  );
}
