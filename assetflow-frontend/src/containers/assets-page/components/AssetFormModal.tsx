'use client';

import { useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Select, { type SelectOption } from '@/components/Select';
import Textarea from '@/components/Textarea';
import type { ApiError } from '@/libs/api/api-error';
import { ASSET_CONDITION_LABEL } from '@/libs/asset-display';
import { ASSET_CONDITIONS, type Asset, type AssetCondition } from '@/types/asset.types';
import {
  mapServerError,
  toFormValues,
  validateAssetForm,
  type AssetFormErrors,
  type AssetFormField,
  type AssetFormValues,
} from '../utils/asset-form';

interface AssetFormModalProps {
  open: boolean;
  /** null = register a new asset, otherwise edit this one */
  asset: Asset | null;
  categoryOptions: SelectOption[];
  isSubmitting: boolean;
  serverError: ApiError | null;
  onSubmit: (values: AssetFormValues) => void;
  onClose: () => void;
}

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((value) => ({
  value,
  label: ASSET_CONDITION_LABEL[value],
}));

/** The parent passes a new `key` on every open, so the fields start fresh */
export function AssetFormModal({
  open,
  asset,
  categoryOptions,
  isSubmitting,
  serverError,
  onSubmit,
  onClose,
}: AssetFormModalProps) {
  const isEdit = asset !== null;
  const [values, setValues] = useState<AssetFormValues>(() => toFormValues(asset));
  const [clientErrors, setClientErrors] = useState<AssetFormErrors>({});
  const [dismissedError, setDismissedError] = useState<ApiError | null>(null);

  const visibleServerError = serverError && serverError !== dismissedError ? serverError : null;
  const serverFieldErrors = visibleServerError ? mapServerError(visibleServerError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    visibleServerError && Object.keys(serverFieldErrors).length === 0 ? visibleServerError : null;

  const update = (field: AssetFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setDismissedError(serverError);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateAssetForm(values, isEdit);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  const formId = 'asset-form';

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      size="lg"
      title={isEdit ? `Edit ${asset.assetCode}` : 'Register a new asset'}
      description={
        isEdit
          ? 'The asset code cannot be changed. Status changes happen through assignments and returns.'
          : 'New assets start as Available and get a CREATED entry in their history.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Register asset'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Identity */}
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-xs font-medium tracking-wide text-ink-muted">
            Identity
          </legend>
          <Input
            label="Asset code"
            required={!isEdit}
            disabled={isEdit}
            autoFocus={!isEdit}
            value={values.assetCode}
            onChange={(event) => update('assetCode', event.target.value.toUpperCase())}
            error={errors.assetCode}
            hint={isEdit ? 'Printed on the device tag' : 'e.g. LAP-0013'}
            className="[&_input]:font-mono"
          />
          <Input
            label="Name"
            required
            autoFocus={isEdit}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            error={errors.name}
            placeholder="e.g. Dell Latitude 5450"
          />
          <Select
            label="Category"
            required
            placeholder="Choose a category"
            options={categoryOptions}
            value={values.categoryId}
            onChange={(event) => update('categoryId', event.target.value)}
            error={errors.categoryId}
          />
          <Select
            label="Condition"
            options={CONDITION_OPTIONS}
            value={values.condition}
            onChange={(event) => update('condition', event.target.value as AssetCondition)}
            error={errors.condition}
          />
        </fieldset>

        {/* Hardware details */}
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-3 text-xs font-medium tracking-wide text-ink-muted">
            Hardware
          </legend>
          <Input
            label="Brand"
            value={values.brand}
            onChange={(event) => update('brand', event.target.value)}
            error={errors.brand}
            placeholder="Dell"
          />
          <Input
            label="Model"
            value={values.model}
            onChange={(event) => update('model', event.target.value)}
            error={errors.model}
            placeholder="Latitude 5450"
          />
          <Input
            label="Serial number"
            value={values.serialNumber}
            onChange={(event) => update('serialNumber', event.target.value)}
            error={errors.serialNumber}
            placeholder="Optional"
            className="[&_input]:font-mono"
          />
        </fieldset>

        {/* Purchase */}
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-3 text-xs font-medium tracking-wide text-ink-muted">
            Purchase and warranty
          </legend>
          <Input
            label="Purchase date"
            type="date"
            value={values.purchaseDate}
            onChange={(event) => update('purchaseDate', event.target.value)}
            error={errors.purchaseDate}
          />
          <Input
            label="Price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={values.purchasePrice}
            onChange={(event) => update('purchasePrice', event.target.value)}
            error={errors.purchasePrice}
            placeholder="0.00"
          />
          <Input
            label="Warranty until"
            type="date"
            min={values.purchaseDate || undefined}
            value={values.warrantyExpiryDate}
            onChange={(event) => update('warrantyExpiryDate', event.target.value)}
            error={errors.warrantyExpiryDate}
          />
        </fieldset>

        <Textarea
          label="Notes"
          value={values.notes}
          onChange={(event) => update('notes', event.target.value)}
          error={errors.notes}
          hint={`${values.notes.length}/1000`}
          placeholder="Optional: procurement batch, location, known issues..."
        />

        {generalError && (
          <div role="alert" className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
            <p className="font-medium">{generalError.title}</p>
            <p className="mt-0.5">{generalError.detail}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
