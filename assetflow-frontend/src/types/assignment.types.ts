import type { AssetCondition, AssetStatus } from './asset.types';
import type { AssignmentStatus, EmployeeStatus } from './employee.types';

/** Matches the backend AssignmentResponse */
export interface Assignment {
  id: string;
  status: AssignmentStatus;
  assignedAt: string;
  returnedAt: string | null;
  returnCondition: AssetCondition | null;
  notes: string | null;
  returnNotes: string | null;
  createdAt: string;
  asset: {
    id: string;
    assetCode: string;
    name: string;
    status: AssetStatus;
    category: { id: string; name: string };
  };
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    status: EmployeeStatus;
  };
  assignedBy: { id: string; email: string } | null;
  returnedBy: { id: string; email: string } | null;
}

export type AssignmentSortField = 'assignedAt' | 'returnedAt' | 'createdAt';

export type AssignmentQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssignmentStatus;
  employeeId?: string;
  assetId?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  sortBy?: AssignmentSortField;
  sortOrder?: 'asc' | 'desc';
};

export interface CreateAssignmentInput {
  assetId: string;
  employeeId: string;
  assignedAt?: string; // ISO date-time
  notes?: string;
}
