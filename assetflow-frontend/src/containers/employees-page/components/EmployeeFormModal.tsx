'use client';

import { useId, useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import type { ApiError } from '@/libs/api/api-error';
import { friendlyMessage } from '@/libs/api/friendly-error';
import type { Employee } from '@/types/employee.types';
import {
  mapServerError,
  toFormValues,
  validateEmployeeForm,
  type EmployeeFormErrors,
  type EmployeeFormField,
  type EmployeeFormValues,
} from '../utils/employee-form';

interface EmployeeFormModalProps {
  open: boolean;
  /** null = add a new employee, otherwise edit this one */
  employee: Employee | null;
  departments: string[];
  designations: string[];
  isSubmitting: boolean;
  serverError: ApiError | null;
  onSubmit: (values: EmployeeFormValues) => void;
  onClose: () => void;
}

/** The parent passes a new `key` on every open, so the fields start fresh */
export function EmployeeFormModal({
  open,
  employee,
  departments,
  designations,
  isSubmitting,
  serverError,
  onSubmit,
  onClose,
}: EmployeeFormModalProps) {
  const isEdit = employee !== null;
  const departmentListId = useId();
  const designationListId = useId();
  const [values, setValues] = useState<EmployeeFormValues>(() => toFormValues(employee));
  const [clientErrors, setClientErrors] = useState<EmployeeFormErrors>({});
  const [dismissedError, setDismissedError] = useState<ApiError | null>(null);

  const visibleServerError = serverError && serverError !== dismissedError ? serverError : null;
  const serverFieldErrors = visibleServerError ? mapServerError(visibleServerError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    visibleServerError && Object.keys(serverFieldErrors).length === 0 ? visibleServerError : null;

  const update = (field: EmployeeFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setDismissedError(serverError);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEmployeeForm(values, isEdit);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  const formId = 'employee-form';

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title={isEdit ? `Edit ${employee.fullName}` : 'Add an employee'}
      description={
        isEdit
          ? 'The employee code cannot be changed. Use Deactivate when someone leaves.'
          : 'New employees start as Active and can receive assets straight away.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Employee code"
          required={!isEdit}
          disabled={isEdit}
          autoFocus={!isEdit}
          value={values.employeeCode}
          onChange={(event) => update('employeeCode', event.target.value.toUpperCase())}
          error={errors.employeeCode}
          hint={isEdit ? 'Linked to HR records' : 'e.g. EMP-007'}
          className="sm:col-span-2 [&_input]:font-mono"
        />
        <Input
          label="First name"
          required
          autoFocus={isEdit}
          value={values.firstName}
          onChange={(event) => update('firstName', event.target.value)}
          error={errors.firstName}
        />
        <Input
          label="Last name"
          required
          value={values.lastName}
          onChange={(event) => update('lastName', event.target.value)}
          error={errors.lastName}
        />
        <Input
          label="Work email"
          type="email"
          required
          autoComplete="off"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
          placeholder="name@assetflow.local"
          className="sm:col-span-2"
        />
        <Input
          label="Department"
          list={departmentListId}
          value={values.department}
          onChange={(event) => update('department', event.target.value)}
          error={errors.department}
          hint="Pick an existing one or type a new one"
        />
        {/* Browser-native suggestions from existing departments */}
        <datalist id={departmentListId}>
          {departments.map((department) => (
            <option key={department} value={department} />
          ))}
        </datalist>
        <Input
          label="Designation"
          value={values.designation}
          list={designationListId}
          autoComplete="off"
          onChange={(event) => update('designation', event.target.value)}
          error={errors.designation}
          placeholder="e.g. QA Engineer"
        />

        <datalist id={designationListId}>
          {designations.map((designation) => (
            <option key={designation} value={designation} />
          ))}
        </datalist>

        {generalError && (
          <div
            role="alert"
            className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-700 sm:col-span-2 dark:text-red-300"
          >
            <p>{friendlyMessage(generalError)}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
