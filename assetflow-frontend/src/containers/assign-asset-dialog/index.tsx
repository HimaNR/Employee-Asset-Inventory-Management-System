'use client';

import type { FormEvent } from 'react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import SearchSelect, { type SearchOption } from '@/components/SearchSelect';
import Textarea from '@/components/Textarea';
import { friendlyMessage } from '@/libs/api/friendly-error';
import type { Assignment } from '@/types/assignment.types';
import { useAssignAssetDialog } from './hooks/useAssignAssetDialog';
import { nowLocal } from './utils/assign-form';

export interface AssignAssetDialogProps {
  open: boolean;
  /** Pre-select the asset (opened from an asset) */
  presetAsset?: SearchOption | null;
  /** Pre-select the employee (opened from an employee) */
  presetEmployee?: SearchOption | null;
  onAssigned: (assignment: Assignment) => void;
  onClose: () => void;
}

/**
 * Reusable "Assign asset" dialog: used on the Assignments, Assets and Employees pages.
 * The parent gives it a new `key` every time it opens, so the form starts fresh.
 */
export default function AssignAssetDialog({
  open,
  presetAsset = null,
  presetEmployee = null,
  onAssigned,
  onClose,
}: AssignAssetDialogProps) {
  const dialog = useAssignAssetDialog({ presetAsset, presetEmployee, onAssigned });
  const formId = 'assign-asset-form';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void dialog.submit();
  };

  return (
    <Modal
      open={open}
      onClose={dialog.isSubmitting ? () => undefined : onClose}
      title="Assign an asset"
      description="Only available assets and active employees are listed. The asset becomes Assigned and its history records the hand-over."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={dialog.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={dialog.isSubmitting}>
            Assign asset
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <SearchSelect
          label="Asset"
          required
          value={dialog.values.asset}
          onChange={(option) => dialog.update('asset', option)}
          loadOptions={dialog.loadAssets}
          placeholder="Search code, name or serial"
          emptyMessage="No available assets match."
          error={dialog.errors.asset}
        />
        <SearchSelect
          label="Employee"
          required
          value={dialog.values.employee}
          onChange={(option) => dialog.update('employee', option)}
          loadOptions={dialog.loadEmployees}
          placeholder="Search name, code or department"
          emptyMessage="No active employees match."
          error={dialog.errors.employee}
        />
        <Input
          label="Handed over at"
          type="datetime-local"
          required
          max={nowLocal()}
          value={dialog.values.assignedAt}
          onChange={(event) => dialog.update('assignedAt', event.target.value)}
          error={dialog.errors.assignedAt}
        />
        <Textarea
          label="Notes"
          value={dialog.values.notes}
          onChange={(event) => dialog.update('notes', event.target.value)}
          error={dialog.errors.notes}
          hint={`${dialog.values.notes.length}/500`}
          placeholder="Optional, e.g. Primary work laptop"
        />

        {dialog.generalError && (
          <Banner tone="error">
            {friendlyMessage(dialog.generalError)}
          </Banner>
        )}
      </form>
    </Modal>
  );
}
