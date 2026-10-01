'use client';

import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import SearchSelect, { type SearchOption } from '@/components/SearchSelect';
import Textarea from '@/components/Textarea';
import {
  ASSET_CONDITION_LABEL,
  ASSET_STATUS_DISPLAY,
  statusAfterReturn,
} from '@/libs/asset-display';
import { cn } from '@/libs/cn';
import { ASSET_CONDITIONS, type AssetCondition } from '@/types/asset.types';
import type { Assignment } from '@/types/assignment.types';
import { useReturnAssetDialog } from './hooks/useReturnAssetDialog';
import { nowLocal } from './utils/return-form';

export interface ReturnAssetDialogProps {
  open: boolean;
  /** Pre-select the assignment (opened from a row or drawer) */
  presetAssignment?: SearchOption | null;
  onReturned: (assignment: Assignment) => void;
  onClose: () => void;
}

const CONDITION_HINT: Record<AssetCondition, string> = {
  NEW: 'Unused, as delivered',
  GOOD: 'Normal wear, fully working',
  FAIR: 'Visible wear, still working',
  DAMAGED: 'Needs repair before reuse',
};

/** Reusable "Record a return" dialog (Assignments, Returns, Assets and Employees pages) */
export default function ReturnAssetDialog({
  open,
  presetAssignment = null,
  onReturned,
  onClose,
}: ReturnAssetDialogProps) {
  const dialog = useReturnAssetDialog({ presetAssignment, onReturned });
  const formId = 'return-asset-form';
  const nextStatus = dialog.values.condition ? statusAfterReturn(dialog.values.condition) : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void dialog.submit();
  };

  return (
    <Modal
      open={open}
      onClose={dialog.isSubmitting ? () => undefined : onClose}
      title="Record a return"
      description="Closes the assignment. A damaged return makes the asset Damaged; any other condition makes it Available again."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={dialog.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={dialog.isSubmitting}>
            Record return
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <SearchSelect
          label="Asset being returned"
          required
          disabled={presetAssignment !== null}
          value={dialog.values.assignment}
          onChange={(option) => dialog.update('assignment', option)}
          loadOptions={dialog.loadAssignments}
          placeholder="Search asset code, name or employee"
          emptyMessage="No active assignments match."
          error={dialog.errors.assignment}
        />

        {/* Condition as large radio cards */}
        <fieldset>
          <legend className="mb-2 text-sm text-ink-muted">
            Condition on return <span className="text-red-600">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {ASSET_CONDITIONS.map((condition) => {
              const isSelected = dialog.values.condition === condition;
              return (
                <label
                  key={condition}
                  className={cn(
                    'cursor-pointer rounded-2xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    isSelected
                      ? condition === 'DAMAGED'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-tag bg-tag/20'
                      : 'border-line bg-surface-2/60',
                  )}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={condition}
                    checked={isSelected}
                    onChange={() => dialog.setCondition(condition)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-medium">{ASSET_CONDITION_LABEL[condition]}</span>
                  <span className="block text-xs text-ink-muted">{CONDITION_HINT[condition]}</span>
                </label>
              );
            })}
          </div>
          {dialog.errors.condition && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{dialog.errors.condition}</p>
          )}
        </fieldset>

        {/* Preview of what will happen */}
        {nextStatus && (
          <p className="flex items-center gap-2 rounded-2xl bg-surface-2/60 px-4 py-3 text-sm">
            <span className="text-ink-muted">Asset status will become</span>
            <Badge tone="info">Assigned</Badge>
            <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            <Badge tone={ASSET_STATUS_DISPLAY[nextStatus].tone}>
              {ASSET_STATUS_DISPLAY[nextStatus].label}
            </Badge>
          </p>
        )}

        <Input
          label="Returned at"
          type="datetime-local"
          required
          max={nowLocal()}
          value={dialog.values.returnedAt}
          onChange={(event) => dialog.update('returnedAt', event.target.value)}
          error={dialog.errors.returnedAt}
        />
        <Textarea
          label="Notes"
          value={dialog.values.notes}
          onChange={(event) => dialog.update('notes', event.target.value)}
          error={dialog.errors.notes}
          hint={`${dialog.values.notes.length}/500`}
          placeholder="Optional, e.g. Returned during device upgrade"
        />

        {dialog.generalError && (
          <Banner tone="error">
            <span className="font-medium">{dialog.generalError.title}.</span>{' '}
            {dialog.generalError.detail}
          </Banner>
        )}
      </form>
    </Modal>
  );
}
