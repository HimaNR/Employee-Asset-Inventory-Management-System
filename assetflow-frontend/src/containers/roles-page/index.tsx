'use client';

import { useEffect, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import Card from '@/components/Card';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { cn } from '@/libs/cn';
import { roleDisplay } from '@/libs/role-display';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { rolesService } from '@/services/roles/roles.service';
import type { Role } from '@/types/role.types';

/** "assets:write" -> { area: "Assets", action: "write" } */
function splitPermission(permission: string) {
  const [area, action] = permission.split(':');
  return { area: area.charAt(0).toUpperCase() + area.slice(1), action };
}

/** Read-only overview: who can do what (roles are defined in code + seed) */
export default function RolesPage() {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([rolesService.list(controller.signal), rolesService.permissions(controller.signal)])
      .then(([loadedRoles, loadedPermissions]) => {
        setRoles(loadedRoles);
        setPermissions(loadedPermissions);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(ApiError.from(err));
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <Banner tone="error">
        {friendlyMessage(error)}
      </Banner>
    );
  }
  if (!roles) {
    return <div className="h-64 animate-pulse rounded-3xl bg-surface-2" aria-hidden="true" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const display = roleDisplay(role.name);
          return (
            <Card key={role.id} interactive>
              <Badge tone={display.tone}>{display.label}</Badge>
              <p className="mt-4 text-5xl font-light tabular-nums">{role.userCount}</p>
              <p className="text-sm text-ink-muted">user{role.userCount === 1 ? '' : 's'}</p>
              <p className="mt-3 text-sm">{role.description}</p>
              <p className="mt-2 text-xs text-ink-muted">
                {role.permissions.length} of {permissions.length} permissions
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <caption className="px-6 pt-5 pb-3 text-left text-lg font-medium">Permission matrix</caption>
          <thead className="border-y border-line bg-surface-2/60 text-xs text-ink-muted">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium">Permission</th>
              {roles.map((role) => (
                <th key={role.id} scope="col" className="px-6 py-3 text-center font-medium">
                  {roleDisplay(role.name).label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {permissions.map((permission) => {
              const { area, action } = splitPermission(permission);
              return (
                <tr key={permission} className="transition-colors hover:bg-tag/[0.07]">
                  <th scope="row" className="px-6 py-3 text-left font-normal">
                    <span className="font-medium">{area}</span>{' '}
                    <span className="text-ink-muted">{action}</span>
                    <span className="ml-2 font-mono text-[11px] text-ink-muted/70">{permission}</span>
                  </th>
                  {roles.map((role) => {
                    const has = role.permissions.includes(permission);
                    return (
                      <td key={role.id} className="px-6 py-3 text-center">
                        <span
                          className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full',
                            has ? 'bg-tag text-tag-ink' : 'text-ink-muted/40',
                          )}
                        >
                          {has ? (
                            <Check className="h-4 w-4" aria-label="Allowed" />
                          ) : (
                            <Minus className="h-4 w-4" aria-label="Not allowed" />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-ink-muted">
        Employees have no admin permissions: they only see &quot;My assets&quot;. Roles and their
        permissions are defined in the backend (permissions.constant.ts) and applied by the seed.
      </p>
    </div>
  );
}
