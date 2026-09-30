import type { ApiError } from '@/libs/api/api-error';
import type {
  Asset,
  AssetCondition,
  CreateAssetInput,
  UpdateAssetInput,
} from '@/types/asset.types';

/** Everything is a string while typing; converted to the API shape on submit */
export interface AssetFormValues {
  assetCode: string;
  name: string;
  categoryId: string;
  serialNumber: string;
  brand: string;
  model: string;
  condition: AssetCondition;
  purchaseDate: string;
  purchasePrice: string;
  warrantyExpiryDate: string;
  notes: string;
}

export type AssetFormField = keyof AssetFormValues;
export type AssetFormErrors = Partial<Record<AssetFormField, string>>;

const FIELDS: AssetFormField[] = [
  'assetCode',
  'name',
  'categoryId',
  'serialNumber',
  'brand',
  'model',
  'condition',
  'purchaseDate',
  'purchasePrice',
  'warrantyExpiryDate',
  'notes',
];

export function toFormValues(asset: Asset | null): AssetFormValues {
  return {
    assetCode: asset?.assetCode ?? '',
    name: asset?.name ?? '',
    categoryId: asset?.category.id ?? '',
    serialNumber: asset?.serialNumber ?? '',
    brand: asset?.brand ?? '',
    model: asset?.model ?? '',
    condition: asset?.condition ?? 'GOOD',
    purchaseDate: asset?.purchaseDate ?? '',
    purchasePrice: asset?.purchasePrice ?? '',
    warrantyExpiryDate: asset?.warrantyExpiryDate ?? '',
    notes: asset?.notes ?? '',
  };
}

const ASSET_CODE = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
const PRICE = /^\d{1,10}(\.\d{1,2})?$/;

/** Same rules as the backend DTO, checked BEFORE sending */
export function validateAssetForm(values: AssetFormValues, isEdit: boolean): AssetFormErrors {
  const errors: AssetFormErrors = {};
  const code = values.assetCode.trim().toUpperCase();

  if (!isEdit) {
    if (!code) errors.assetCode = 'Asset code is required.';
    else if (code.length < 3 || code.length > 30) errors.assetCode = 'Use 3 to 30 characters.';
    else if (!ASSET_CODE.test(code)) {
      errors.assetCode = 'Letters, numbers and single dashes only (e.g. LAP-0012).';
    }
  }

  const name = values.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length < 2 || name.length > 120) errors.name = 'Use 2 to 120 characters.';

  if (!values.categoryId) errors.categoryId = 'Choose a category.';
  if (values.serialNumber.trim().length > 100) errors.serialNumber = 'Max 100 characters.';
  if (values.brand.trim().length > 60) errors.brand = 'Max 60 characters.';
  if (values.model.trim().length > 60) errors.model = 'Max 60 characters.';
  if (values.notes.trim().length > 1000) errors.notes = 'Max 1000 characters.';

  const price = values.purchasePrice.trim();
  if (price && !PRICE.test(price)) {
    errors.purchasePrice = 'Enter a positive amount with up to 2 decimals.';
  }

  if (
    values.purchaseDate &&
    values.warrantyExpiryDate &&
    values.warrantyExpiryDate < values.purchaseDate
  ) {
    errors.warrantyExpiryDate = 'Warranty cannot end before the purchase date.';
  }

  return errors;
}

/** Puts server errors next to the matching field whenever possible */
export function mapServerError(error: ApiError): AssetFormErrors {
  const slug = error.type.split('/').pop();
  switch (slug) {
    case 'asset-code-taken':
      return { assetCode: error.detail };
    case 'serial-number-taken':
      return { serialNumber: error.detail };
    case 'category-inactive':
    case 'category-not-found':
      return { categoryId: error.detail };
    case 'invalid-warranty-date':
      return { warrantyExpiryDate: error.detail };
    case 'validation-error': {
      // Messages start with the field name: "purchasePrice must not be less than 0"
      const errors: AssetFormErrors = {};
      for (const message of error.errors) {
        const field = FIELDS.find((f) => message.startsWith(`${f} `));
        if (field && !errors[field]) errors[field] = message;
      }
      return errors;
    }
    default:
      return {};
  }
}

/** "" means "no value": optional fields are sent as null so they can also be cleared */
const orNull = (value: string) => value.trim() || null;

function sharedFields(values: AssetFormValues) {
  const price = values.purchasePrice.trim();
  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    serialNumber: orNull(values.serialNumber),
    brand: orNull(values.brand),
    model: orNull(values.model),
    condition: values.condition,
    purchaseDate: values.purchaseDate || null,
    purchasePrice: price ? Number(price) : null,
    warrantyExpiryDate: values.warrantyExpiryDate || null,
    notes: orNull(values.notes),
  };
}

export function toCreateInput(values: AssetFormValues): CreateAssetInput {
  return { assetCode: values.assetCode.trim().toUpperCase(), ...sharedFields(values) };
}

export function toUpdateInput(values: AssetFormValues): UpdateAssetInput {
  return sharedFields(values);
}
