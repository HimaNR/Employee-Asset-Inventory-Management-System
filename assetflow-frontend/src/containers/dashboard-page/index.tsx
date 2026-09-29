'use client';

import { ApiStatusCard } from './components/ApiStatusCard';
import { useDashboardPage } from './hooks/useDashboardPage';

export default function DashboardPage() {
  const { health, error, isLoading, refresh } = useDashboardPage();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ApiStatusCard
        health={health}
        error={error}
        isLoading={isLoading}
        onRefresh={refresh}
      />
    </div>
  );
}
