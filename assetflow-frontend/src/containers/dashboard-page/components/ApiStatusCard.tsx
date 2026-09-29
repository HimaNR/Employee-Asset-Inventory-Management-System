import type { ApiError } from '@/libs/api/api-error';
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
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">System status</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {isLoading && !health && !error && (
        <p className="mt-4 text-sm text-zinc-500">Checking API...</p>
      )}

      {health && (
        <div className="mt-4 space-y-1">
          <p className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
            API {isOnline ? 'online' : 'degraded'}
          </p>
          <p className="text-sm text-zinc-600">
            Database: {health.checks.database.status} ({health.checks.database.responseTimeMs} ms)
          </p>
          <p className="text-xs text-zinc-400">Uptime: {health.uptimeSeconds}s</p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error.title}</p>
          <p>{error.detail}</p>
          {error.requestId && (
            <p className="mt-2 font-mono text-xs text-red-500">
              Request ID: {error.requestId}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
