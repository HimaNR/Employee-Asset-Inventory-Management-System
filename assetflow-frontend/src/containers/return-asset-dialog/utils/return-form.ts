import type { SearchOption } from '@/components/SearchSelect';
import type { ApiError } from '@/libs/api/api-error';
import type { AssetCondition } from '@/types/asset.types';
import type { CreateReturnInput } from '@/types/return.types';

export interface ReturnFormValues {
  assignment: SearchOption | null;
  condition: AssetCondition | null;
  returnedAt: string; // "YYYY-MM-DDTHH:mm" local time
  notes: string;
}

export type ReturnFormField = 'assignment' | 'condition' | 'returnedAt' | 'notes';
export type ReturnFormErrors = Partial<Record<ReturnFormField, string>>;

const pad = (n: number) => String(n).padStart(2, '0');

export function nowLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function validateReturnForm(values: ReturnFormValues): ReturnFormErrors {
  const errors: ReturnFormErrors = {};
  if (!values.assignment) errors.assignment = 'Choose the asset being returned.';
  if (!values.condition) errors.condition = 'Choose the condition it came back in.';
  if (!values.returnedAt) errors.returnedAt = 'Choose the return date and time.';
  else if (new Date(values.returnedAt).getTime() > Date.now() + 5 * 60 * 1000) {
    errors.returnedAt = 'The return cannot be in the future.';
  }
  if (values.notes.trim().length > 500) errors.notes = 'Max 500 characters.';
  return errors;
}

export function mapServerError(error: ApiError): ReturnFormErrors {
  const slug = error.type.split('/').pop();
  switch (slug) {
    case 'assignment-not-active':
    case 'assignment-not-found':
      return { assignment: error.detail };
    case 'invalid-return-date':
      return { returnedAt: error.detail };
    default:
      return {};
  }
}

export function toCreateInput(values: ReturnFormValues): CreateReturnInput {
  return {
    assignmentId: values.assignment!.value,
    condition: values.condition!,
    returnedAt: new Date(values.returnedAt).toISOString(),
    notes: values.notes.trim() || undefined,
  };
}
