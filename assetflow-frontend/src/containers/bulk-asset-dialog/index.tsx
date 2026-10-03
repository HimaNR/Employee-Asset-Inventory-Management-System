'use client';

import { useId, type FormEvent } from 'react';
import { Layers } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Select, { type SelectOption } from '@/components/Select';
import SuggestionList from '@/components/SuggestionList';
import Textarea from '@/components/Textarea';
import { ASSET_CONDITION_LABEL } from '@/libs/asset-display';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { ASSET_CONDITIONS, type AssetCondition, type BulkCreateAssetsResult } from '@/types/asset.types';
import { useBulkAssetDialog } from './hooks/useBulkAssetDialog';
import {
  MAX_BULK_QUANTITY,
  parseSerials,
  previewRange,
  suggestPrefix,
} from './utils/bulk-asset-form';

export interface BulkAssetDialogProps {
  open: boolean;
  /** Active categories only */
  categoryOptions: SelectOption[];
  onCreated: (result: BulkCreateAssetsResult) => void;
  onClose: () => void;
}

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((value) => ({
  value,
  label: ASSET_CONDITION_LABEL[value],
}));

/** Register many identical assets at once, e.g. 10 keyboards from one purchase */
export default function BulkAssetDialog({
  open,
  categoryOptions,
  onCreated,
  onClose,
}: BulkAssetDialogProps) {
  const dialog = useBulkAssetDialog(onCreated);
  const { values, errors } = dialog;
  const quantity = Number(values.quantity);
  const serialCount = parseSerials(values.serialNumbers).length;
  const formId = 'bulk-asset-form';
  const listId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void dialog.submit();
  };

  const chooseCategory = (categoryId: string) => {
    dialog.update('categoryId', categoryId);
    // Suggest a prefix from the category name if the user has not typed one
    const label = categoryOptions.find((o) => o.value === categoryId)?.label ?? '';
    if (!values.codePrefix && label) dialog.update('codePrefix', suggestPrefix(label));
  };

  return (
    <Modal
      open={open}
      onClose={dialog.isSubmitting ? () => undefined : onClose}
      size="lg"
      title="Bulk add assets"
      description="Register many identical assets in one step, for example 10 keyboards from the same purchase. Each one gets its own code and history."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={dialog.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={dialog.isSubmitting}>
            {!dialog.isSubmitting && <Layers className="h-4 w-4" aria-hidden="true" />}
            Create {Number.isInteger(quantity) && quantity > 0 ? quantity : ''} assets
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-3 text-xs font-medium tracking-wide text-ink-muted">Batch</legend>
          <Select
            label="Category"
            required
            placeholder="Choose a category"
            options={categoryOptions}
            value={values.categoryId}
            onChange={(event) => chooseCategory(event.target.value)}
            error={errors.categoryId}
          />
          <Input
            label="Code prefix"
            required
            maxLength={10}
            value={values.codePrefix}
            onChange={(event) => dialog.update('codePrefix', event.target.value.toUpperCase())}
            error={errors.codePrefix}
            hint="e.g. KEY gives KEY-0001"
            className="[&_input]:font-mono"
          />
          <Input
            label="Quantity"
            type="number"
            required
            min={1}
            max={MAX_BULK_QUANTITY}
            value={values.quantity}
            onChange={(event) => dialog.update('quantity', event.target.value)}
            error={errors.quantity}
            hint={`1 to ${MAX_BULK_QUANTITY}`}
          />
        </fieldset>

        {/* Live preview of the generated codes */}
        {dialog.nextNumber !== null && Number.isInteger(quantity) && quantity > 0 && (
          <p className="rounded-2xl bg-tag/20 px-4 py-3 text-sm">
            Will create <span className="font-medium">{quantity}</span> asset{quantity === 1 ? '' : 's'}:{' '}
            <span className="font-mono">{previewRange(dialog.previewPrefix, dialog.nextNumber, quantity)}</span>
          </p>
        )}

        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-3 text-xs font-medium tracking-wide text-ink-muted">
            Shared details
          </legend>
          <Input
            label="Name"
            required
            value={values.name}
            list={`${listId}-name`}
            autoComplete="off"
            onChange={(event) => dialog.update('name', event.target.value)}
            error={errors.name}
            placeholder="e.g. Logitech MX Keys S"
            className="sm:col-span-3"
          />
          <Input
            label="Brand"
            value={values.brand}
            list={`${listId}-brand`}
            autoComplete="off"
            onChange={(event) => dialog.update('brand', event.target.value)}
          />
          <Input
            label="Model"
            value={values.model}
            list={`${listId}-model`}
            autoComplete="off"
            onChange={(event) => dialog.update('model', event.target.value)}
          />
          <Select
            label="Condition"
            options={CONDITION_OPTIONS}
            value={values.condition}
            onChange={(event) => dialog.update('condition', event.target.value as AssetCondition)}
          />
          <Input
            label="Purchase date"
            type="date"
            value={values.purchaseDate}
            onChange={(event) => dialog.update('purchaseDate', event.target.value)}
          />
          <Input
            label="Price (each)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={values.purchasePrice}
            onChange={(event) => dialog.update('purchasePrice', event.target.value)}
            error={errors.purchasePrice}
          />
          <Input
            label="Warranty until"
            type="date"
            min={values.purchaseDate || undefined}
            value={values.warrantyExpiryDate}
            onChange={(event) => dialog.update('warrantyExpiryDate', event.target.value)}
            error={errors.warrantyExpiryDate}
          />
        </fieldset>

        <Textarea
          label="Serial numbers (optional)"
          rows={4}
          value={values.serialNumbers}
          onChange={(event) => dialog.update('serialNumbers', event.target.value)}
          error={errors.serialNumbers}
          hint={`One per line, in order. ${serialCount} entered${
            Number.isInteger(quantity) && quantity > 0 ? ` for ${quantity} assets` : ''
          }.`}
          placeholder={'SN-KEY-0001\nSN-KEY-0002\n…'}
          className="[&_textarea]:font-mono"
        />
        <Textarea
          label="Notes"
          value={values.notes}
          onChange={(event) => dialog.update('notes', event.target.value)}
          placeholder="Optional, e.g. October procurement batch"
        />

        {dialog.generalError && (
          <Banner tone="error">
            {friendlyMessage(dialog.generalError)}
          </Banner>
        )}
        <SuggestionList id={`${listId}-name`} values={dialog.suggestions.names} />
        <SuggestionList id={`${listId}-brand`} values={dialog.suggestions.brands} />
        <SuggestionList id={`${listId}-model`} values={dialog.suggestions.models} />
      </form>
    </Modal>
  );
}
