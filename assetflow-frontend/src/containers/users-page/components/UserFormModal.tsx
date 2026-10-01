'use client';

import { useCallback, useState, type FormEvent } from 'react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import SearchSelect from '@/components/SearchSelect';
import Select, { type SelectOption } from '@/components/Select';
import type { ApiError } from '@/libs/api/api-error';
import { employeesService } from '@/services/employees/employees.service';
import type { User, UserStatus } from '@/types/user.types';
import {
  mapServerError,
  toFormValues,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from '../utils/user-form';

interface UserFormModalProps {
  open: boolean;
  user: User | null;
  roleOptions: SelectOption[];
  isSubmitting: boolean;
  serverError: ApiError | null;
  onSubmit: (values: UserFormValues) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active (can sign in)' },
  { value: 'INACTIVE', label: 'Inactive (cannot sign in)' },
];

export function UserFormModal({
  open,
  user,
  roleOptions,
  isSubmitting,
  serverError,
  onSubmit,
  onClose,
}: UserFormModalProps) {
  const isEdit = user !== null;
  const [values, setValues] = useState<UserFormValues>(() => toFormValues(user));
  const [clientErrors, setClientErrors] = useState<UserFormErrors>({});
  const [dismissedError, setDismissedError] = useState<ApiError | null>(null);

  const visibleServerError = serverError && serverError !== dismissedError ? serverError : null;
  const serverFieldErrors = visibleServerError ? mapServerError(visibleServerError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    visibleServerError && Object.keys(serverFieldErrors).length === 0 ? visibleServerError : null;

  const update = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setDismissedError(serverError);
  };

  // Searches ALL employees (a login can belong to anyone on the payroll)
  const loadEmployees = useCallback(async (search: string, signal: AbortSignal) => {
    const response = await employeesService.list({ search: search || undefined, limit: 20 }, signal);
    return response.data.map((e) => ({
      value: e.id,
      label: `${e.fullName} · ${e.employeeCode}`,
      description: e.email,
    }));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateUserForm(values, isEdit);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  const formId = 'user-form';

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title={isEdit ? `Edit ${user.email}` : 'Add a user'}
      description={
        isEdit
          ? 'Changing the role or deactivating takes effect at the next sign-in or token refresh (max 15 minutes).'
          : 'Users sign in with this email. Link an employee so they can see "My assets".'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          required={!isEdit}
          disabled={isEdit}
          autoComplete="off"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
        />
        {!isEdit && (
          <Input
            label="Temporary password"
            type="password"
            required
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => update('password', event.target.value)}
            error={errors.password}
            hint="At least 8 characters with a letter and a number"
          />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Role"
            required
            placeholder="Choose a role"
            options={roleOptions}
            value={values.roleId}
            onChange={(event) => update('roleId', event.target.value)}
            error={errors.roleId}
          />
          {isEdit && (
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={(event) => update('status', event.target.value as UserStatus)}
            />
          )}
        </div>
        <SearchSelect
          label="Linked employee"
          value={values.employee}
          onChange={(option) => update('employee', option)}
          loadOptions={loadEmployees}
          placeholder="Optional: search name or code"
          hint="Required for the Employee role to see their assets"
          error={errors.employee}
        />
        {generalError && (
          <Banner tone="error">
            <span className="font-medium">{generalError.title}.</span> {generalError.detail}
          </Banner>
        )}
      </form>
    </Modal>
  );
}
