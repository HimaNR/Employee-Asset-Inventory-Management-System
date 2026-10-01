'use client';

import Banner from '@/components/Banner';
import { greetingNameFor, useSession } from '@/libs/auth/use-session';
import { ApiStatusCard } from './components/ApiStatusCard';
import { AttentionCard } from './components/AttentionCard';
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard';
import { OverviewHero } from './components/OverviewHero';
import { QuickLinksCard } from './components/QuickLinksCard';
import { RecentActivityCard } from './components/RecentActivityCard';
import { RecentAssignmentsCard } from './components/RecentAssignmentsCard';
import { useDashboardPage } from './hooks/useDashboardPage';

export default function DashboardPage() {
  const page = useDashboardPage();
  const { summary } = page;
  const session = useSession();

  return (
    <div className="space-y-10">
      <OverviewHero
        greetingName={session ? greetingNameFor(session.user) : ''}
        overview={page.overview}
        error={page.summaryError}
        isLoading={page.isSummaryLoading}
      />

      {page.summaryError && !summary && (
        <Banner tone="error">
          {page.summaryError.title}: {page.summaryError.detail}
        </Banner>
      )}

      {/* Skeleton while the first summary loads */}
      {!summary && !page.summaryError && (
        <div className="grid gap-5 lg:grid-cols-3" aria-hidden="true">
          <div className="h-72 animate-pulse rounded-3xl bg-surface-2 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-3xl bg-surface-2" />
        </div>
      )}

      {summary && (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <CategoryBreakdownCard categories={summary.byCategory} />
            <AttentionCard attention={summary.attention} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <RecentAssignmentsCard
              assignments={summary.recentAssignments}
              activeCount={summary.totals.activeAssignments}
            />
            <RecentActivityCard activity={summary.recentActivity} />
          </div>
        </>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <ApiStatusCard
          health={page.health}
          error={page.healthError}
          isLoading={page.isHealthLoading}
          onRefresh={page.refresh}
        />
        <QuickLinksCard />
      </div>
    </div>
  );
}
