import { useCallback, useState } from 'react';
import type { SearchOption } from '@/components/SearchSelect';
import { ApiError } from '@/libs/api/api-error';
import { formatDate } from '@/libs/format';
import { assignmentsService } from '@/services/assignments/assignments.service';
import { returnsService } from '@/services/returns/returns.service';
import type { AssetCondition } from '@/types/asset.types';
import type { Assignment } from '@/types/assignment.types';
import {
  mapServerError,
  nowLocal,
  toCreateInput,
  validateReturnForm,
  type ReturnFormErrors,
  type ReturnFormValues,
} from '../utils/return-form';

interface Options {
  presetAssignment: SearchOption | null;
  onReturned: (assignment: Assignment) => void;
}

export function useReturnAssetDialog({ presetAssignment, onReturned }: Options) {
  const [values, setValues] = useState<ReturnFormValues>(() => ({
    assignment: presetAssignment,
    condition: null,
    returnedAt: nowLocal(),
    notes: '',
  }));
  const [clientErrors, setClientErrors] = useState<ReturnFormErrors>({});
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverFieldErrors = serverError ? mapServerError(serverError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    serverError && Object.keys(serverFieldErrors).length === 0 ? serverError : null;

  const update = <K extends keyof ReturnFormValues>(field: K, value: ReturnFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setServerError(null);
  };

  // Only ACTIVE assignments can be returned
  const loadAssignments = useCallback(async (search: string, signal: AbortSignal) => {
    const response = await assignmentsService.list(
      { status: 'ACTIVE', search: search || undefined, limit: 20, sortBy: 'assignedAt', sortOrder: 'desc' },
      signal,
    );
    return response.data.map((a) => ({
      value: a.id,
      label: `${a.asset.assetCode} · ${a.asset.name}`,
      description: `With ${a.employee.fullName} since ${formatDate(a.assignedAt)}`,
    }));
  }, []);

  const submit = async () => {
    const nextErrors = validateReturnForm(values);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      onReturned(await returnsService.create(toCreateInput(values)));
    } catch (err) {
      setServerError(ApiError.from(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    generalError,
    isSubmitting,
    update,
    setCondition: (condition: AssetCondition) => update('condition', condition),
    loadAssignments,
    submit,
  };
}
