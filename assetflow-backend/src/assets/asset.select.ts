import type { Prisma } from '../generated/prisma/client';

/** Columns returned for every asset, plus its category and CURRENT assignment */
export const assetSelect = {
  id: true,
  assetCode: true,
  name: true,
  serialNumber: true,
  brand: true,
  model: true,
  status: true,
  condition: true,
  purchaseDate: true,
  purchasePrice: true,
  warrantyExpiryDate: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  assignments: {
    where: { status: 'ACTIVE' },
    take: 1,
    select: {
      id: true,
      assignedAt: true,
      employee: {
        select: { id: true, employeeCode: true, firstName: true, lastName: true },
      },
    },
  },
} satisfies Prisma.AssetSelect;

export type AssetRecord = Prisma.AssetGetPayload<{ select: typeof assetSelect }>;
