/** Mirror of the backend permissions (common/constants/permissions.constant.ts) */
export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  ASSETS_READ: 'assets:read',
  ASSETS_WRITE: 'assets:write',
  ASSETS_STATUS: 'assets:status',
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_WRITE: 'categories:write',
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  ASSIGNMENTS_READ: 'assignments:read',
  ASSIGNMENTS_WRITE: 'assignments:write',
  RETURNS_WRITE: 'returns:write',
  USERS_MANAGE: 'users:manage',
  ROLES_MANAGE: 'roles:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  employee: { id: string; employeeCode: string; fullName: string } | null;
}

/** Response of POST /auth/login and POST /auth/refresh */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}
