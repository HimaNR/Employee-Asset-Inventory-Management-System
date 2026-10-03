'use client';

import type { ReactNode } from 'react';
import { CalendarCheck, CalendarClock, StickyNote, Undo2, UserRound } from 'lucide-react';
import Badge, { type BadgeTone } from '@/components/Badge';
import Button from '@/components/Button';
import Drawer from '@/components/Drawer';
import { ASSET_CONDITION_LABEL, ASSET_STATUS_DISPLAY } from '@/libs/asset-display';
import { CategoryIcon } from '@/libs/category-icon';
import { formatDateTime, formatDuration } from '@/libs/format';
import { initials } from '@/libs/initials';
import type { AssetCondition } from '@/types/asset.types';
import type { Assignment } from '@/types/assignment.types';

export interface AssignmentDetailDrawerProps {
  open: boolean;
  assignment: Assignment | null;
  /** Shown only for ACTIVE assignments when the user may record returns */
  onReturn?: (assignment: Assignment) => void;
  onClose: () => void;
}

const CONDITION_TONE: Record<AssetCondition, BadgeTone> = {
  NEW: 'success',
  GOOD: 'success',
  FAIR: 'warning',
  DAMAGED: 'danger',
};

/** Read-only side panel for one assignment (Assignments and Returns pages) */
export default function AssignmentDetailDrawer({
  open,
  assignment,
  onReturn,
  onClose,
}: AssignmentDetailDrawerProps) {
  const isActive = assignment?.status === 'ACTIVE';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isActive ? 'Assignment details' : 'Return details'}
      footer={
        assignment && isActive && onReturn ? (
          <Button variant="accent" onClick={() => onReturn(assignment)}>
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Record return
          </Button>
        ) : undefined
      }
    >
      {assignment && (
        <div className="space-y-6">
          {/* Asset */}
          <header className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tag/25">
              <CategoryIcon name={assignment.asset.category.name} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink-muted">{assignment.asset.assetCode}</p>
              <h3 className="text-2xl font-light tracking-tight">{assignment.asset.name}</h3>
              <p className="mt-2 flex flex-wrap gap-2">
                {isActive ? (
                  <Badge tone="info">With employee</Badge>
                ) : (
                  <Badge tone="neutral">Returned</Badge>
                )}
                <Badge tone={ASSET_STATUS_DISPLAY[assignment.asset.status].tone}>
                  Asset now: {ASSET_STATUS_DISPLAY[assignment.asset.status].label}
                </Badge>
              </p>
            </div>
          </header>

          {/* Employee */}
          <div className="flex items-center gap-3 rounded-2xl bg-contrast px-4 py-3 text-contrast-fg">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tag text-sm font-medium text-tag-ink">
              {initials(assignment.employee.fullName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs opacity-70">{isActive ? 'Currently with' : 'Was with'}</p>
              <p className="truncate font-medium">
                {assignment.employee.fullName}{' '}
                <span className="font-mono text-xs opacity-70">{assignment.employee.employeeCode}</span>
              </p>
            </div>
            <p className="text-right text-xs opacity-70">
              {isActive ? 'for' : 'held for'}
              <br />
              {formatDuration(assignment.assignedAt, assignment.returnedAt)}
            </p>
          </div>

          {/* Hand-over */}
          <Section icon={<CalendarClock className="h-4 w-4" />} title="Handed over">
            <Row label="Date">{formatDateTime(assignment.assignedAt)}</Row>
            <Row label="By">{assignment.assignedBy?.email ?? 'System'}</Row>
            <Row label="Category">{assignment.asset.category.name}</Row>
          </Section>

          <Note title="Assignment notes" text={assignment.notes} empty="No notes were added." />

          {/* Return */}
          {!isActive && (
            <>
              <Section icon={<CalendarCheck className="h-4 w-4" />} title="Returned">
                <Row label="Date">{formatDateTime(assignment.returnedAt)}</Row>
                <Row label="Received by">{assignment.returnedBy?.email ?? 'System'}</Row>
                <Row label="Condition">
                  {assignment.returnCondition ? (
                    <Badge tone={CONDITION_TONE[assignment.returnCondition]}>
                      {ASSET_CONDITION_LABEL[assignment.returnCondition]}
                    </Badge>
                  ) : (
                    'Closed (asset lost)'
                  )}
                </Row>
              </Section>
              <Note title="Return notes" text={assignment.returnNotes} empty="No return notes." />
            </>
          )}

          <p className="flex items-center gap-2 text-xs text-ink-muted">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Employee status: {assignment.employee.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </p>
        </div>
      )}
    </Drawer>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className="text-ink-muted" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h3>
      <dl className="divide-y divide-line/70 rounded-2xl bg-surface-2/60 px-4">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

function Note({ title, text, empty }: { title: string; text: string | null; empty: string }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
        <StickyNote className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        {title}
      </h3>
      <p
        className={
          text
            ? 'rounded-2xl bg-tag/15 px-4 py-3 text-sm whitespace-pre-line'
            : 'rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-ink-muted'
        }
      >
        {text ?? empty}
      </p>
    </section>
  );
}
