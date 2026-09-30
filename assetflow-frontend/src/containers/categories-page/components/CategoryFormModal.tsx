'use client';

import { useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Textarea from '@/components/Textarea';
import type { ApiError } from '@/libs/api/api-error';
import type { Category } from '@/types/category.types';
import {
  mapServerError,
  validateCategoryForm,
  type CategoryFormErrors,
  type CategoryFormValues,
} from '../utils/category-form';

interface CategoryFormModalProps {
  open: boolean;
  /** null = create a new category, otherwise edit this one */
  category: Category | null;
  isSubmitting: boolean;
  serverError: ApiError | null;
  onSubmit: (values: CategoryFormValues) => void;
  onClose: () => void;
}

/**
 * The parent gives this component a new `key` every time it opens,
 * so React creates it fresh and the fields start from `category`.
 */
export function CategoryFormModal({
  open,
  category,
  isSubmitting,
  serverError,
  onSubmit,
  onClose,
}: CategoryFormModalProps) {
  const [values, setValues] = useState<CategoryFormValues>({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });
  const [clientErrors, setClientErrors] = useState<CategoryFormErrors>({});
  // After the user edits a field, hide the old server error (it may no longer apply)
  const [dismissedError, setDismissedError] = useState<ApiError | null>(null);

  const visibleServerError = serverError && serverError !== dismissedError ? serverError : null;
  const serverFieldErrors = visibleServerError ? mapServerError(visibleServerError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    visibleServerError && Object.keys(serverFieldErrors).length === 0 ? visibleServerError : null;

  const updateField = (field: keyof CategoryFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setDismissedError(serverError);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCategoryForm(values);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  const formId = 'category-form';

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title={category ? `Edit ${category.name}` : 'New category'}
      description="Categories group assets for filtering and reporting."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {category ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Name"
          required
          autoFocus
          maxLength={50}
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          error={errors.name}
          placeholder="e.g. Docking Station"
        />
        <Textarea
          label="Description"
          maxLength={255}
          value={values.description}
          onChange={(event) => updateField('description', event.target.value)}
          error={errors.description}
          hint={`${values.description.length}/255`}
          placeholder="Optional"
        />

        {generalError && (
          <div role="alert" className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
            <p className="font-medium">{generalError.title}</p>
            <p className="mt-0.5">{generalError.detail}</p>
            {generalError.errors.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {generalError.errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
