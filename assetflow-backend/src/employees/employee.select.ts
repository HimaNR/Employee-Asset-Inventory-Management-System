import type { Prisma } from '../generated/prisma/client';

export const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  email: true,
  department: true,
  designation: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  // Count only the assets this person holds RIGHT NOW
  _count: { select: { assignments: { where: { status: 'ACTIVE' } } } },
} satisfies Prisma.EmployeeSelect;

export type EmployeeRecord = Prisma.EmployeeGetPayload<{ select: typeof employeeSelect }>;
