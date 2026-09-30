import { RefreshCw } from 'lucide-react';
import Card from '@/components/Card';
import type { ApiError } from '@/libs/api/api-error';
import { cn } from '@/libs/cn';
import type { HealthResponse } from '@/types/health.types';

interface ApiStatusCardProps {
  health: HealthResponse | null;
  error: ApiError | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ApiStatusCard({ health, error, isLoading, onRefresh }: ApiStatusCardProps) {
  const isOnline = health?.status === 'ok';

  return (
    <Card interactive className="flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">System status</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh status"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface transition hover:shadow-md disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            className={cn(
              'h-4 w-4 transition-transform duration-500 group-hover:rotate-180',
              isLoading && 'animate-spin',
            )}
          />
        </button>
      </div>

      {isLoading && !health && !error && (
        <p className="mt-6 text-sm text-ink-muted">Checking the API...</p>
      )}

      {health && (
        <div className="mt-6 flex flex-1 flex-col justify-between gap-6">
          <p className="flex items-center gap-3 text-3xl font-light">
            <span className="relative flex h-3 w-3">
              {isOnline && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              )}
              <span
                className={cn(
                  'relative inline-flex h-3 w-3 rounded-full',
                  isOnline ? 'bg-emerald-500' : 'bg-red-500',
                )}
              />
            </span>
            {isOnline ? 'All systems online' : 'Degraded'}
          </p>

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-2 p-4">
              <dt className="text-xs text-ink-muted">Database</dt>
              <dd className="mt-1 text-2xl font-light tabular-nums">
                {health.checks.database.responseTimeMs}
                <span className="ml-1 text-sm text-ink-muted">ms</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <dt className="text-xs text-ink-muted">Uptime</dt>
              <dd className="mt-1 text-2xl font-light tabular-nums">
                {formatUptime(health.uptimeSeconds)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <p className="font-medium">{error.title}</p>
          <p className="mt-0.5 opacity-90">{error.detail}</p>
          {error.requestId && (
            <p className="mt-2 font-mono text-xs opacity-75">Request ID: {error.requestId}</p>
          )}
        </div>
      )}
    </Card>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
