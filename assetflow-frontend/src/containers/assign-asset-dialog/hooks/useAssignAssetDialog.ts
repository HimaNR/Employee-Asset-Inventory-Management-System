import { useCallback, useState } from 'react';
import type { SearchOption } from '@/components/SearchSelect';
import { ApiError } from '@/libs/api/api-error';
import { assetsService } from '@/services/assets/assets.service';
import { assignmentsService } from '@/services/assignments/assignments.service';
import { employeesService } from '@/services/employees/employees.service';
import type { Assignment } from '@/types/assignment.types';
import {
  mapServerError,
  nowLocal,
  toCreateInput,
  validateAssignForm,
  type AssignFormErrors,
  type AssignFormField,
  type AssignFormValues,
} from '../utils/assign-form';

interface Options {
  presetAsset: SearchOption | null;
  presetEmployee: SearchOption | null;
  onAssigned: (assignment: Assignment) => void;
}

export function useAssignAssetDialog({ presetAsset, presetEmployee, onAssigned }: Options) {
  const [values, setValues] = useState<AssignFormValues>(() => ({
    asset: presetAsset,
    employee: presetEmployee,
    assignedAt: nowLocal(),
    notes: '',
  }));
  const [clientErrors, setClientErrors] = useState<AssignFormErrors>({});
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverFieldErrors = serverError ? mapServerError(serverError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    serverError && Object.keys(serverFieldErrors).length === 0 ? serverError : null;

  const update = <K extends AssignFormField>(field: K, value: AssignFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setServerError(null);
  };

  // Only AVAILABLE + active assets can be assigned, so only those are offered
  const loadAssets = useCallback(async (search: string, signal: AbortSignal) => {
    const response = await assetsService.list(
      { search: search || undefined, status: 'AVAILABLE', isActive: true, limit: 20, sortBy: 'assetCode', sortOrder: 'asc' },
      signal,
    );
    return response.data.map((asset) => ({
      value: asset.id,
      label: `${asset.assetCode} · ${asset.name}`,
      description: [asset.category.name, asset.serialNumber].filter(Boolean).join(' · '),
    }));
  }, []);

  // Only ACTIVE employees can receive assets
  const loadEmployees = useCallback(async (search: string, signal: AbortSignal) => {
    const response = await employeesService.list(
      { search: search || undefined, status: 'ACTIVE', limit: 20 },
      signal,
    );
    return response.data.map((employee) => ({
      value: employee.id,
      label: `${employee.fullName} · ${employee.employeeCode}`,
      description: [employee.designation, employee.department].filter(Boolean).join(' · '),
    }));
  }, []);

  const submit = async () => {
    const nextErrors = validateAssignForm(values);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const assignment = await assignmentsService.create(toCreateInput(values));
      onAssigned(assignment);
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
    loadAssets,
    loadEmployees,
    submit,
  };
}
