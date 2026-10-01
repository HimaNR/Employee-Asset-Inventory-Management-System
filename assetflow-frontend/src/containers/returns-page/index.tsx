'use client';

import { Search, Undo2 } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import ReturnAssetDialog from '@/containers/return-asset-dialog';
import { ReturnsTable } from './components/ReturnsTable';
import { useReturnsPage } from './hooks/useReturnsPage';

export default function ReturnsPage() {
  const page = useReturnsPage();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <p className="text-6xl font-light tracking-tight tabular-nums">{page.meta.total}</p>
          <p className="pb-2 text-sm leading-tight text-ink-muted">
            {page.search ? (
              <>
                returns match
                <br />
                your search
              </>
            ) : (
              <>
                assets returned
                <br />
                so far
              </>
            )}
          </p>
        </div>
        <Button onClick={page.openReturn}>
          <Undo2 className="h-4 w-4" aria-hidden="true" />
          Record a return
        </Button>
      </div>

      <label className="relative block w-full">
        <span className="sr-only">Search returns</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={page.search}
          onChange={(event) => page.changeSearch(event.target.value)}
          placeholder="Search asset code or name, employee name or code"
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted/70 hover:shadow-md focus:shadow-md"
        />
      </label>

      {page.notice && (
        <Banner tone="success" onDismiss={page.dismissNotice}>
          {page.notice}
        </Banner>
      )}

      {page.listError ? (
        <div className="rounded-3xl bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300">
          <p className="font-medium">{page.listError.title}</p>
          <p className="mt-1">{page.listError.detail}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={page.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <ReturnsTable
            returns={page.returns}
            isLoading={page.isLoading}
            sort={page.sort}
            onSortChange={page.changeSort}
          />
          <Pagination
            meta={page.meta}
            onPageChange={page.changePage}
            onLimitChange={page.changeLimit}
            isDisabled={page.isLoading}
          />
        </>
      )}

      <ReturnAssetDialog
        key={page.returnDialog.key}
        open={page.returnDialog.open}
        onReturned={page.handleReturned}
        onClose={page.closeReturn}
      />
    </div>
  );
}
