import { useCallback, useEffect, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { dashboardService } from '@/services/dashboard/dashboard.service';
import { healthService } from '@/services/health/health.service';
import type { DashboardOverview } from '@/types/dashboard.types';
import type { HealthResponse } from '@/types/health.types';

export function useDashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<ApiError | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [overviewError, setOverviewError] = useState<ApiError | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);

  // Both requests run in parallel; one failing does not hide the other
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
      .getOverview(controller.signal)
      .then((data) => {
        setOverview(data);
        setOverviewError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setOverviewError(ApiError.from(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsOverviewLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setIsHealthLoading(true);
    setIsOverviewLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return {
    health,
    healthError,
    isHealthLoading,
    overview,
    overviewError,
    isOverviewLoading,
    refresh,
  };
}
