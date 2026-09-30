import type { Prisma } from '../generated/prisma/client';

/** One assignment row as seen from the employee's side */
export const employeeAssignmentSelect = {
  id: true,
  status: true,
  assignedAt: true,
  returnedAt: true,
  returnCondition: true,
  notes: true,
  returnNotes: true,
  asset: {
    select: {
      id: true,
      assetCode: true,
      name: true,
      status: true,
      category: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.AssetAssignmentSelect;

export type EmployeeAssignmentRecord = Prisma.AssetAssignmentGetPayload<{
  select: typeof employeeAssignmentSelect;
}>;
