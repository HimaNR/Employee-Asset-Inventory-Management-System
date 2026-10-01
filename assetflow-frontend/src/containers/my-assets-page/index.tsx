'use client';

import { useEffect, useState } from 'react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { useSession } from '@/libs/auth/use-session';
import { CategoryIcon } from '@/libs/category-icon';
import { formatDate, formatDuration } from '@/libs/format';
import { authService } from '@/services/auth/auth.service';
import type { EmployeeAssignment } from '@/types/employee.types';

/** Brief: an Employee "may view assets currently assigned to them" */
export default function MyAssetsPage() {
  const session = useSession();
  const [assets, setAssets] = useState<EmployeeAssignment[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    authService
      .myAssets(controller.signal)
      .then((response) => setAssets(response.data))
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(ApiError.from(err));
      });
    return () => controller.abort();
  }, []);

  const firstName = session?.user.employee?.fullName.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-light tracking-tight sm:text-5xl">Hi {firstName}</h2>
        <p className="mt-2 text-sm text-ink-muted">
          These company assets are currently assigned to you. Contact the asset team for returns
          or problems.
        </p>
      </div>

      {error && (
        <Banner tone="error">
          {error.title}: {error.detail}
        </Banner>
      )}

      {!assets && !error && (
        <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
          <div className="h-36 animate-pulse rounded-3xl bg-surface-2" />
          <div className="h-36 animate-pulse rounded-3xl bg-surface-2" />
        </div>
      )}

      {assets && assets.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center text-ink-muted">
          You have no assets assigned right now.
        </p>
      )}

      {assets && assets.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {assets.map((a) => {
            const status = ASSET_STATUS_DISPLAY[a.asset.status];
            return (
              <li
                key={a.id}
                className="group rounded-3xl border border-line/70 bg-surface/85 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tag/25 transition-transform group-hover:-rotate-3">
                    <CategoryIcon name={a.asset.category.name} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-ink-muted">{a.asset.assetCode}</p>
                    <p className="truncate text-lg font-medium">{a.asset.name}</p>
                    <p className="text-sm text-ink-muted">{a.asset.category.name}</p>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="mt-5 flex justify-between rounded-2xl bg-surface-2/60 px-4 py-3 text-sm">
                  <span className="text-ink-muted">Since {formatDate(a.assignedAt)}</span>
                  <span>{formatDuration(a.assignedAt)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
