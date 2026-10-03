
'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Backpack, Briefcase, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { formatDate, formatRelative } from '@/libs/format';
import { initials } from '@/libs/initials';
import { roleDisplay } from '@/libs/role-display';
import { useProfilePage } from './hooks/useProfilePage';

/** "My profile": account details, linked employee details and change password */
export default function ProfilePage() {
  const page = useProfilePage();
  const { profile } = page;

  if (page.loadError) return <Banner tone="error">{friendlyMessage(page.loadError)}</Banner>;
  if (!profile) {
    return (
      <div className="grid gap-5 lg:grid-cols-2" aria-hidden="true">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
      </div>
    );
  }

  const displayName = profile.employee?.fullName ?? profile.email;
  const role = roleDisplay(profile.role.name);

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <section className="flex flex-col gap-5 rounded-3xl border border-line/70 bg-surface/85 p-6 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-tag text-2xl font-light text-tag-ink"
        >
          {initials(displayName)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-3xl font-light tracking-tight">{displayName}</h2>
          <p className="truncate text-sm text-ink-muted">{profile.email}</p>
          <p className="mt-2 flex flex-wrap gap-2">
            <Badge tone={role.tone}>{role.label}</Badge>
            <Badge tone="success">Active account</Badge>
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------- Account ---------- */}
        <Card>
          <CardTitle icon={<ShieldCheck className="h-4 w-4" />} title="Account" />
          <dl className="mt-4 divide-y divide-line/70 rounded-2xl bg-surface-2/60 px-4">
            <Row label="Sign-in email">{profile.email}</Row>
            <Row label="Role">{role.label}</Row>
            <Row label="Last sign-in">
              {profile.lastLoginAt ? formatRelative(profile.lastLoginAt) : 'This is your first sign-in'}
            </Row>
            <Row label="Member since">{formatDate(profile.createdAt)}</Row>
          </dl>
          {profile.role.description && (
            <p className="mt-3 text-sm text-ink-muted">{profile.role.description}.</p>
          )}
        </Card>

        {/* ---------- Employee details ---------- */}
        <Card>
          <CardTitle icon={<Briefcase className="h-4 w-4" />} title="Employee details" />
          {profile.employee ? (
            <>
              <dl className="mt-4 divide-y divide-line/70 rounded-2xl bg-surface-2/60 px-4">
                <Row label="Employee code">
                  <span className="font-mono text-xs">{profile.employee.employeeCode}</span>
                </Row>
                <Row label="Name">{profile.employee.fullName}</Row>
                <Row label="Designation">{profile.employee.designation ?? '–'}</Row>
                <Row label="Department">{profile.employee.department ?? '–'}</Row>
                <Row label="Work email">{profile.employee.email}</Row>
                <Row label="Status">
                  {profile.employee.status === 'ACTIVE' ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge>Inactive</Badge>
                  )}
                </Row>
              </dl>
              <Link
                href="/my-assets"
                className="mt-4 flex items-center gap-3 rounded-2xl bg-contrast px-4 py-3 text-contrast-fg transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Backpack className="h-5 w-5" aria-hidden="true" />
                <span className="flex-1 text-sm">Assets assigned to you</span>
                <span className="text-2xl font-light tabular-nums">
                  {profile.employee.activeAssetCount}
                </span>
              </Link>
            </>
          ) : (
            <p className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-ink-muted">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              This account is not linked to an employee record, so there are no personal asset
              details to show.
            </p>
          )}
        </Card>
      </div>

      {/* ---------- Change password ---------- */}
      <Card className="max-w-2xl">
        <CardTitle icon={<KeyRound className="h-4 w-4" />} title="Change password" />
        <p className="mt-1 text-sm text-ink-muted">
          Use at least 8 characters with a letter and a number. You stay signed in on this device.
        </p>
        <form key={page.formKey} onSubmit={page.changePassword} noValidate className="mt-5 space-y-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={page.form.current}
            onChange={(event) => page.update('current', event.target.value)}
            error={page.errors.current}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={page.form.next}
              onChange={(event) => page.update('next', event.target.value)}
              error={page.errors.next}
            />
            <Input
              label="Repeat new password"
              type="password"
              autoComplete="new-password"
              value={page.form.confirm}
              onChange={(event) => page.update('confirm', event.target.value)}
              error={page.errors.confirm}
            />
          </div>
          {page.formError && <Banner tone="error">{page.formError}</Banner>}
          {page.success && <Banner tone="success">{page.success}</Banner>}
          <div className="flex justify-end">
            <Button type="submit" isLoading={page.isSaving}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <p className="flex items-center gap-2 text-xs text-ink-muted">
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        To change your name, email or role, contact an administrator.
      </p>
    </div>
  );
}

function CardTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-medium">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2" aria-hidden="true">
        {icon}
      </span>
      {title}
    </h3>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}
