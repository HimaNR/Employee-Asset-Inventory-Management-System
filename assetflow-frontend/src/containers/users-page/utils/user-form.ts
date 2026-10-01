import type { SearchOption } from '@/components/SearchSelect';
import type { ApiError } from '@/libs/api/api-error';
import type { User, UserStatus } from '@/types/user.types';

export interface UserFormValues {
  email: string;
  password: string;
  roleId: string;
  status: UserStatus;
  employee: SearchOption | null;
}

export type UserFormField = keyof UserFormValues;
export type UserFormErrors = Partial<Record<UserFormField, string>>;

const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toFormValues(user: User | null): UserFormValues {
  return {
    email: user?.email ?? '',
    password: '',
    roleId: user?.role.id ?? '',
    status: user?.status ?? 'ACTIVE',
    employee: user?.employee
      ? { value: user.employee.id, label: `${user.employee.fullName} · ${user.employee.employeeCode}` }
      : null,
  };
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required.';
  if (!PASSWORD.test(password)) return 'At least 8 characters with a letter and a number.';
  return undefined;
}

export function validateUserForm(values: UserFormValues, isEdit: boolean): UserFormErrors {
  const errors: UserFormErrors = {};
  if (!isEdit) {
    if (!EMAIL.test(values.email.trim())) errors.email = 'Enter a valid email address.';
    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;
  }
  if (!values.roleId) errors.roleId = 'Choose a role.';
  return errors;
}

export function mapServerError(error: ApiError): UserFormErrors {
  const slug = error.type.split('/').pop();
  switch (slug) {
    case 'user-email-taken':
      return { email: error.detail };
    case 'employee-already-linked':
    case 'employee-not-found':
    case 'employee-link-required':
      return { employee: error.detail };
    case 'role-not-found':
      return { roleId: error.detail };
    default:
      return {};
  }
}
