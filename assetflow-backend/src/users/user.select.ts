import type { Prisma } from '../generated/prisma/client';

/** Never select passwordHash or refreshTokenHash for API responses */
export const userSelect = {
  id: true,
  email: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
  employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;
