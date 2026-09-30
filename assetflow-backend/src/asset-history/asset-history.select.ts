import type { Prisma } from '../generated/prisma/client';

export const assetHistorySelect = {
  id: true,
  action: true,
  previousStatus: true,
  newStatus: true,
  description: true,
  metadata: true,
  assignmentId: true,
  createdAt: true,
  performedBy: { select: { id: true, email: true } },
} satisfies Prisma.AssetHistorySelect;

export type AssetHistoryRecord = Prisma.AssetHistoryGetPayload<{
  select: typeof assetHistorySelect;
}>;
