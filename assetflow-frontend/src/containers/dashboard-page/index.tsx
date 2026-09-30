'use client';

import { ApiStatusCard } from './components/ApiStatusCard';
import { OverviewHero } from './components/OverviewHero';
import { QuickLinksCard } from './components/QuickLinksCard';
import { useDashboardPage } from './hooks/useDashboardPage';

export default function DashboardPage() {
  const {
    health,
    healthError,
    isHealthLoading,
    overview,
    overviewError,
    isOverviewLoading,
    refresh,
  } = useDashboardPage();

  return (
    <div className="space-y-10">
      <OverviewHero overview={overview} error={overviewError} isLoading={isOverviewLoading} />

      <div className="grid gap-5 md:grid-cols-2">
        <ApiStatusCard
          health={health}
          error={healthError}
          isLoading={isHealthLoading}
          onRefresh={refresh}
        />
        <QuickLinksCard />
      </div>
    </div>
  );
}
