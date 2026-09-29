'use client';

import { ApiStatusCard } from './components/ApiStatusCard';
import { useDashboardPage } from './hooks/useDashboardPage';

export default function DashboardPage() {
  const { health, error, isLoading, refresh } = useDashboardPage();

  return (
    <main className="mx-auto w-full max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ApiStatusCard
          health={health}
          error={error}
          isLoading={isLoading}
          onRefresh={refresh}
        />
      </div>
    </main>
  );
}
