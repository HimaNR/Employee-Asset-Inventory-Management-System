'use client';

import { useState, type ReactNode } from 'react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import Select from '@/components/Select';
import Table, { type TableColumn, type TableSort } from '@/components/Table';
import Textarea from '@/components/Textarea';

interface DemoRow {
  id: string;
  code: string;
  name: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNDER_REPAIR';
}

const DEMO_ROWS: DemoRow[] = [
  { id: '1', code: 'LAP-0001', name: 'Dell Latitude 5450', status: 'AVAILABLE' },
  { id: '2', code: 'LAP-0002', name: 'Dell Latitude 5450', status: 'ASSIGNED' },
  { id: '3', code: 'MON-0003', name: 'LG 27UP850 4K', status: 'UNDER_REPAIR' },
];

const STATUS_TONE = { AVAILABLE: 'success', ASSIGNED: 'info', UNDER_REPAIR: 'warning' } as const;

const COLUMNS: TableColumn<DemoRow>[] = [
  {
    key: 'code',
    header: 'Code',
    sortKey: 'code',
    cell: (row) => <span className="font-mono text-xs">{row.code}</span>,
  },
  { key: 'name', header: 'Name', sortKey: 'name', cell: (row) => row.name },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status.replace('_', ' ')}</Badge>,
  },
];

/** Development-only playground for the shared UI components */
export default function UiKitPage() {
  const [sort, setSort] = useState<TableSort>({ sortBy: 'code', sortOrder: 'asc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const sortedRows = [...DEMO_ROWS].sort((a, b) => {
    const key = sort.sortBy as 'code' | 'name';
    const result = a[key].localeCompare(b[key]);
    return sort.sortOrder === 'asc' ? result : -result;
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-muted">
        Development-only preview of the shared components in <code>src/components/</code>.
      </p>

      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
        <Button isLoading>Saving</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm">Small</Button>
      </Section>

      <Section title="Badges">
        <Badge>Neutral</Badge>
        <Badge tone="success">Available</Badge>
        <Badge tone="info">Assigned</Badge>
        <Badge tone="warning">Under repair</Badge>
        <Badge tone="danger">Lost</Badge>
      </Section>

      <Section title="Form fields" grid>
        <Input label="Asset code" placeholder="LAP-0012" hint="Letters, numbers and dashes" required />
        <Input label="Serial number" defaultValue="SN-123" error="Serial number already exists." />
        <Select
          label="Category"
          placeholder="Choose a category"
          options={[
            { value: 'laptop', label: 'Laptop' },
            { value: 'monitor', label: 'Monitor' },
          ]}
        />
        <Textarea label="Notes" placeholder="Optional notes" />
      </Section>

      <Section title="Table + pagination">
        <div className="w-full space-y-3">
          <Button size="sm" variant="secondary" onClick={() => setIsTableLoading((v) => !v)}>
            Toggle loading
          </Button>
          <Table
            caption="Demo assets"
            columns={COLUMNS}
            rows={isTableLoading ? [] : sortedRows}
            getRowKey={(row) => row.id}
            isLoading={isTableLoading}
            sort={sort}
            onSortChange={setSort}
          />
          <Pagination
            meta={{ page, limit, total: 132, totalPages: Math.ceil(132 / limit) }}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        </div>
      </Section>

      <Section title="Dialogs">
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          Open modal
        </Button>
        <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
          Deactivate asset
        </Button>
      </Section>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create category"
        description="Categories group assets for filtering and reports."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Save</Button>
          </>
        }
      >
        <Input label="Name" placeholder="Docking Station" required />
      </Modal>

      <ConfirmDialog
        open={isConfirmOpen}
        tone="danger"
        title="Deactivate LAP-0001?"
        message="It will be hidden from new assignments. Its history is kept."
        confirmLabel="Deactivate"
        onConfirm={() => setIsConfirmOpen(false)}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

function Section({ title, grid, children }: { title: string; grid?: boolean; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className={grid ? 'grid gap-4 md:grid-cols-2' : 'flex flex-wrap items-start gap-3'}>
        {children}
      </div>
    </section>
  );
}
