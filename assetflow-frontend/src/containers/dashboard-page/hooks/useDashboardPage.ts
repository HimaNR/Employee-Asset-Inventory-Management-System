import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { dashboardService } from '@/services/dashboard/dashboard.service';
import { healthService } from '@/services/health/health.service';
import type { DashboardSummary } from '@/types/dashboard.types';
import type { HealthResponse } from '@/types/health.types';
import { toOverview } from '../utils/to-overview';

export function useDashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<ApiError | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<ApiError | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);

  // Two independent requests: one failing does not hide the other
  useEffect(() => {
    const controller = new AbortController();

    healthService
      .getHealth(controller.signal)
      .then((data) => {
        setHealth(data);
        setHealthError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setHealth(null);
        setHealthError(ApiError.from(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsHealthLoading(false);
      });

    dashboardService
      .getSummary(controller.signal)
      .then((data) => {
        setSummary(data);
        setSummaryError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setSummaryError(ApiError.from(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSummaryLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  // Coming back to the tab refreshes the numbers
  useEffect(() => {
    const refresh = () => setReloadKey((key) => key + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const refresh = useCallback(() => {
    setIsHealthLoading(true);
    setIsSummaryLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const overview = useMemo(() => (summary ? toOverview(summary) : null), [summary]);

  return {
    health,
    healthError,
    isHealthLoading,
    summary,
    overview,
    summaryError,
    isSummaryLoading,
    refresh,
  };
}
