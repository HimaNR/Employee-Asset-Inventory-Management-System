import { useCallback, useEffect, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { healthService } from '@/services/health/health.service';
import type { HealthResponse } from '@/types/health.types';

export function useDashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Runs on first load AND every time reloadKey changes
  useEffect(() => {
    const controller = new AbortController();

    healthService
      .getHealth(controller.signal)
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return; // request cancelled, ignore
        setHealth(null);
        setError(ApiError.from(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    // Cleanup: cancel the request if the page closes or a new refresh starts
    return () => controller.abort();
  }, [reloadKey]);

  // Called from a click event (not an effect), so setState here is fine
  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return { health, error, isLoading, refresh };
}
