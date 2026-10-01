import type { SearchOption } from '@/components/SearchSelect';
import type { ApiError } from '@/libs/api/api-error';
import type { CreateAssignmentInput } from '@/types/assignment.types';

export interface AssignFormValues {
  asset: SearchOption | null;
  employee: SearchOption | null;
  assignedAt: string; // "YYYY-MM-DDTHH:mm" in the user's local time
  notes: string;
}

export type AssignFormField = 'asset' | 'employee' | 'assignedAt' | 'notes';
export type AssignFormErrors = Partial<Record<AssignFormField, string>>;

const pad = (n: number) => String(n).padStart(2, '0');

/** Current local time in the format <input type="datetime-local"> expects */
export function nowLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function validateAssignForm(values: AssignFormValues): AssignFormErrors {
  const errors: AssignFormErrors = {};
  if (!values.asset) errors.asset = 'Choose an available asset.';
  if (!values.employee) errors.employee = 'Choose an active employee.';
  if (!values.assignedAt) errors.assignedAt = 'Choose the hand-over date and time.';
  else if (new Date(values.assignedAt).getTime() > Date.now() + 5 * 60 * 1000) {
    errors.assignedAt = 'The hand-over cannot be in the future.';
  }
  if (values.notes.trim().length > 500) errors.notes = 'Max 500 characters.';
  return errors;
}

/** Server error -> the field it belongs to */
export function mapServerError(error: ApiError): AssignFormErrors {
  const slug = error.type.split('/').pop();
  switch (slug) {
    case 'asset-not-available':
    case 'asset-inactive':
    case 'asset-not-found':
      return { asset: error.detail };
    case 'employee-inactive':
    case 'employee-not-found':
      return { employee: error.detail };
    case 'invalid-assignment-date':
      return { assignedAt: error.detail };
    default:
      return {};
  }
}

export function toCreateInput(values: AssignFormValues): CreateAssignmentInput {
  return {
    assetId: values.asset!.value,
    employeeId: values.employee!.value,
    // Local "2026-10-01T09:30" -> UTC "2026-10-01T04:00:00.000Z"
    assignedAt: new Date(values.assignedAt).toISOString(),
    notes: values.notes.trim() || undefined,
  };
}
