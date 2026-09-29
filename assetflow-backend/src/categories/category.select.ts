import type { Prisma } from '../generated/prisma/client';

/** The exact columns every category query returns (never select more than needed) */
export const categorySelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { assets: true } },
} satisfies Prisma.AssetCategorySelect;

export type CategoryRecord = Prisma.AssetCategoryGetPayload<{
  select: typeof categorySelect;
}>;
