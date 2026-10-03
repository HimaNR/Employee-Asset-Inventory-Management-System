import type { ApiError } from '@/libs/api/api-error';
import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from '@/types/employee.types';

export interface EmployeeFormValues {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
}

export type EmployeeFormField = keyof EmployeeFormValues;
export type EmployeeFormErrors = Partial<Record<EmployeeFormField, string>>;

const FIELDS: EmployeeFormField[] = [
  'employeeCode',
  'firstName',
  'lastName',
  'email',
  'department',
  'designation',
];

export function toFormValues(employee: Employee | null): EmployeeFormValues {
  return {
    employeeCode: employee?.employeeCode ?? '',
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    department: employee?.department ?? '',
    designation: employee?.designation ?? '',
  };
}

const CODE = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
// Simple, friendly check; the server does the strict validation
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmployeeForm(
  values: EmployeeFormValues,
  isEdit: boolean,
): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};
  const code = values.employeeCode.trim().toUpperCase();

  if (!isEdit) {
    if (!code) errors.employeeCode = 'Employee code is required.';
    else if (code.length < 3 || code.length > 20) errors.employeeCode = 'Use 3 to 20 characters.';
    else if (!CODE.test(code)) {
      errors.employeeCode = 'Letters, numbers and single dashes only (e.g. EMP-007).';
    }
  }

  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  else if (values.firstName.trim().length > 60) errors.firstName = 'Max 60 characters.';

  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  else if (values.lastName.trim().length > 60) errors.lastName = 'Max 60 characters.';

  const email = values.email.trim();
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL.test(email)) errors.email = 'Enter a valid email address.';

  if (values.department.trim().length > 100) errors.department = 'Max 100 characters.';
  if (values.designation.trim().length > 100) errors.designation = 'Max 100 characters.';

  return errors;
}

export function mapServerError(error: ApiError): EmployeeFormErrors {
  const slug = error.type.split('/').pop();
  switch (slug) {
    case 'employee-code-taken':
      return { employeeCode: error.detail };
    case 'employee-email-taken':
      return { email: error.detail };
    case 'validation-error': {
      const errors: EmployeeFormErrors = {};
      for (const message of error.errors) {
        const field = FIELDS.find((f) => message.startsWith(`${f} `));
        if (field && !errors[field]) errors[field] = 'Please check this value.';
      }
      return errors;
    }
    default:
      return {};
  }
}

const orNull = (value: string) => value.trim() || null;

function sharedFields(values: EmployeeFormValues) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    department: orNull(values.department),
    designation: orNull(values.designation),
  };
}

export function toCreateInput(values: EmployeeFormValues): CreateEmployeeInput {
  return { employeeCode: values.employeeCode.trim().toUpperCase(), ...sharedFields(values) };
}

export function toUpdateInput(values: EmployeeFormValues): UpdateEmployeeInput {
  return sharedFields(values);
}
