import type { Prisma } from '../generated/prisma/client';

export const assignmentSelect = {
  id: true,
  status: true,
  assignedAt: true,
  returnedAt: true,
  returnCondition: true,
  notes: true,
  returnNotes: true,
  createdAt: true,
  asset: {
    select: {
      id: true,
      assetCode: true,
      name: true,
      status: true,
      category: { select: { id: true, name: true } },
    },
  },
  employee: {
    select: { id: true, employeeCode: true, firstName: true, lastName: true, status: true },
  },
  assignedBy: { select: { id: true, email: true } },
  returnedBy: { select: { id: true, email: true } },
} satisfies Prisma.AssetAssignmentSelect;

export type AssignmentRecord = Prisma.AssetAssignmentGetPayload<{
  select: typeof assignmentSelect;
}>;
