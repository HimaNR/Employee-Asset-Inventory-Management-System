import type { ApiError } from '@/libs/api/api-error';
import type { AssetCondition, BulkCreateAssetsInput } from '@/types/asset.types';

export const MAX_BULK_QUANTITY = 100;

export interface BulkFormValues {
  categoryId: string;
  codePrefix: string;
  quantity: string;
  name: string;
  brand: string;
  model: string;
  condition: AssetCondition;
  purchaseDate: string;
  purchasePrice: string;
  warrantyExpiryDate: string;
  serialNumbers: string; // one per line
  notes: string;
}

export type BulkFormField = keyof BulkFormValues;
export type BulkFormErrors = Partial<Record<BulkFormField, string>>;

export const EMPTY_BULK_FORM: BulkFormValues = {
  categoryId: '',
  codePrefix: '',
  quantity: '10',
  name: '',
  brand: '',
  model: '',
  condition: 'NEW',
  purchaseDate: '',
  purchasePrice: '',
  warrantyExpiryDate: '',
  serialNumbers: '',
  notes: '',
};

/** "Keyboard" -> "KEY", "Docking Station" -> "DOC" (the user can change it) */
export function suggestPrefix(categoryName: string): string {
  return categoryName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
}

/** Non-empty trimmed lines */
export function parseSerials(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const PREFIX = /^[A-Z0-9]{2,10}$/;
const PRICE = /^\d{1,10}(\.\d{1,2})?$/;

export function validateBulkForm(values: BulkFormValues): BulkFormErrors {
  const errors: BulkFormErrors = {};
  const quantity = Number(values.quantity);

  if (!values.categoryId) errors.categoryId = 'Choose a category.';
  if (!PREFIX.test(values.codePrefix.trim().toUpperCase())) {
    errors.codePrefix = '2 to 10 letters or numbers, e.g. KEY.';
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_BULK_QUANTITY) {
    errors.quantity = `Enter a whole number from 1 to ${MAX_BULK_QUANTITY}.`;
  }
  const name = values.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length < 2 || name.length > 120) errors.name = 'Use 2 to 120 characters.';
  if (values.purchasePrice.trim() && !PRICE.test(values.purchasePrice.trim())) {
    errors.purchasePrice = 'Positive amount with up to 2 decimals.';
  }
  if (values.purchaseDate && values.warrantyExpiryDate && values.warrantyExpiryDate < values.purchaseDate) {
    errors.warrantyExpiryDate = 'Warranty cannot end before the purchase date.';
  }
  const serials = parseSerials(values.serialNumbers);
  if (serials.length > 0 && serials.length !== quantity) {
    errors.serialNumbers = `You entered ${serials.length} serial numbers for ${values.quantity || 0} assets. Enter one per line for every asset, or leave empty.`;
  }
  return errors;
}

export function mapServerError(error: ApiError): BulkFormErrors {
  const slug = error.type.split('/').pop();
  switch (slug) {
    case 'serial-count-mismatch':
    case 'duplicate-serial-in-batch':
    case 'serial-number-taken':
      return { serialNumbers: error.detail };
    case 'category-inactive':
    case 'category-not-found':
      return { categoryId: error.detail };
    case 'invalid-warranty-date':
      return { warrantyExpiryDate: error.detail };
    default:
      return {};
  }
}

export function toBulkInput(values: BulkFormValues): BulkCreateAssetsInput {
  const price = values.purchasePrice.trim();
  const serials = parseSerials(values.serialNumbers);
  return {
    categoryId: values.categoryId,
    codePrefix: values.codePrefix.trim().toUpperCase(),
    quantity: Number(values.quantity),
    name: values.name.trim(),
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    condition: values.condition,
    purchaseDate: values.purchaseDate || null,
    purchasePrice: price ? Number(price) : null,
    warrantyExpiryDate: values.warrantyExpiryDate || null,
    notes: values.notes.trim() || null,
    serialNumbers: serials.length > 0 ? serials : undefined,
  };
}

/** "KEY-0004 … KEY-0013" for the preview */
export function previewRange(prefix: string, nextNumber: number, quantity: number): string {
  const pad = (n: number) => `${prefix}-${String(n).padStart(4, '0')}`;
  if (quantity <= 1) return pad(nextNumber);
  return `${pad(nextNumber)} … ${pad(nextNumber + quantity - 1)}`;
}
