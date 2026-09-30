import type { ApiError } from '@/libs/api/api-error';

export interface CategoryFormValues {
  name: string;
  description: string;
}

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

/** Same rules as the backend DTO, checked BEFORE sending (faster feedback) */
export function validateCategoryForm(values: CategoryFormValues): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  const name = values.name.trim();

  if (!name) errors.name = 'Name is required.';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (name.length > 50) errors.name = 'Name must be 50 characters or fewer.';

  if (values.description.trim().length > 255) {
    errors.description = 'Description must be 255 characters or fewer.';
  }
  return errors;
}

/** Turns a server error into a message next to the right field, when possible */
export function mapServerError(error: ApiError): CategoryFormErrors {
  if (error.type.endsWith('/category-name-taken')) {
    return { name: error.detail };
  }
  return {};
}

/** Form values -> API body ("" description becomes null = no description) */
export function toCategoryInput(values: CategoryFormValues) {
  const description = values.description.trim();
  return { name: values.name.trim(), description: description || null };
}
