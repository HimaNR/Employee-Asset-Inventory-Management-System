export type UserStatus = 'ACTIVE' | 'INACTIVE';

/** Matches the backend UserResponse (never contains password data) */
export interface User {
  id: string;
  email: string;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: { id: string; name: string };
  employee: { id: string; employeeCode: string; fullName: string } | null;
}

export type UserQuery = {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: UserStatus;
  sortBy?: 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
};

export interface CreateUserInput {
  email: string;
  password: string;
  roleId: string;
  employeeId?: string | null;
}

export interface UpdateUserInput {
  roleId?: string;
  status?: UserStatus;
  employeeId?: string | null;
}
