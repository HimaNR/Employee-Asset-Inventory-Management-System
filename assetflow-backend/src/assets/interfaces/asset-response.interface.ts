import type { AssetCondition, AssetStatus } from '../../generated/prisma/enums';

export interface AssetResponse {
  id: string;
  assetCode: string;
  name: string;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate: string | null; // "YYYY-MM-DD"
  purchasePrice: string | null; // "1250.00" (string keeps money exact)
  warrantyExpiryDate: string | null; // "YYYY-MM-DD"
  notes: string | null;
  isActive: boolean;
  category: { id: string; name: string };
  currentAssignment: {
    id: string;
    assignedAt: Date;
    employee: { id: string; employeeCode: string; fullName: string };
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
