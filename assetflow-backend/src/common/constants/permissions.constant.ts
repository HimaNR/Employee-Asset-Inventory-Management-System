/**
 * Every permission in the system. Roles are lists of these strings
 * (stored in roles.permissions), and endpoints declare what they need with @Permissions().
 */
export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  ASSETS_READ: 'assets:read',
  ASSETS_WRITE: 'assets:write', // create, edit, deactivate, reactivate
  ASSETS_STATUS: 'assets:status', // repair, lost, retire, reinstate
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_WRITE: 'categories:write',
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  ASSIGNMENTS_READ: 'assignments:read',
  ASSIGNMENTS_WRITE: 'assignments:write', // assign
  RETURNS_WRITE: 'returns:write', // record returns
  USERS_MANAGE: 'users:manage',
  ROLES_MANAGE: 'roles:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

/**
 * Default role definitions (from the brief's "Primary actors").
 * The seed writes these into the roles table.
 */
export const ROLE_PERMISSIONS: Record<'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE', Permission[]> = {
  // Maintains assets, employees, categories and system users; oversees everything
  ADMIN: ALL_PERMISSIONS,
  // Assigns, receives, repairs and retires assets; reviews history and availability
  ASSET_MANAGER: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_STATUS,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.ASSIGNMENTS_READ,
    PERMISSIONS.ASSIGNMENTS_WRITE,
    PERMISSIONS.RETURNS_WRITE,
  ],
  // Receives assets and may view the assets currently assigned to them (GET /auth/me/assets)
  EMPLOYEE: [],
};
