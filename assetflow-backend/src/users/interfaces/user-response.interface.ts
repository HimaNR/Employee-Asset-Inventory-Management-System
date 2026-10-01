import type { UserStatus } from '../../generated/prisma/enums';

export interface UserResponse {
  id: string;
  email: string;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: { id: string; name: string };
  employee: { id: string; employeeCode: string; fullName: string } | null;
}
