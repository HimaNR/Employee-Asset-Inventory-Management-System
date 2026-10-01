export const ASSET_STATUSES = [
  'AVAILABLE',
  'ASSIGNED',
  'DAMAGED',
  'UNDER_REPAIR',
  'LOST',
  'RETIRED',
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'DAMAGED'] as const;
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

export interface AssetCurrentAssignment {
  id: string;
  assignedAt: string;
  employee: { id: string; employeeCode: string; fullName: string };
}

/** Matches the backend AssetResponse */
export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate: string | null; // "YYYY-MM-DD"
  purchasePrice: string | null; // "1250.00"
  warrantyExpiryDate: string | null; // "YYYY-MM-DD"
  notes: string | null;
  isActive: boolean;
  category: { id: string; name: string };
  currentAssignment: AssetCurrentAssignment | null;
  createdAt: string;
  updatedAt: string;
}

export type AssetSortField =
  | 'assetCode'
  | 'name'
  | 'status'
  | 'condition'
  | 'purchaseDate'
  | 'createdAt'
  | 'updatedAt';

export type AssetQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  categoryId?: string;
  employeeId?: string;
  isActive?: boolean;
  sortBy?: AssetSortField;
  sortOrder?: 'asc' | 'desc';
};

export interface CreateAssetInput {
  assetCode: string;
  name: string;
  categoryId: string;
  serialNumber?: string | null;
  brand?: string | null;
  model?: string | null;
  condition?: AssetCondition;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyExpiryDate?: string | null;
  notes?: string | null;
}

/** assetCode can never be changed after creation */
export type UpdateAssetInput = Partial<Omit<CreateAssetInput, 'assetCode'>>;

export type AssetHistoryAction =
  | 'CREATED'
  | 'UPDATED'
  | 'ASSIGNED'
  | 'RETURNED'
  | 'STATUS_CHANGED'
  | 'DEACTIVATED'
  | 'REACTIVATED';

export interface AssetHistoryEntry {
  id: string;
  action: AssetHistoryAction;
  previousStatus: AssetStatus | null;
  newStatus: AssetStatus | null;
  description: string;
  metadata: Record<string, unknown> | null;
  assignmentId: string | null;
  performedBy: { id: string; email: string } | null;
  createdAt: string;
}

export interface ChangeStatusInput {
  status: AssetStatus;
  notes?: string;
}
