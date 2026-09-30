import type { AssetCondition, AssetStatus } from './asset.types';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

/** Matches the backend EmployeeResponse */
export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string | null;
  designation: string | null;
  status: EmployeeStatus;
  activeAssetCount: number;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeSortField = 'employeeCode' | 'firstName' | 'lastName' | 'department' | 'createdAt';

export type EmployeeQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: EmployeeStatus;
  department?: string;
  sortBy?: EmployeeSortField;
  sortOrder?: 'asc' | 'desc';
};

export interface CreateEmployeeInput {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string | null;
  designation?: string | null;
}

/** employeeCode can never be changed after creation */
export type UpdateEmployeeInput = Partial<Omit<CreateEmployeeInput, 'employeeCode'>>;

export type AssignmentStatus = 'ACTIVE' | 'RETURNED';

/** One assignment seen from the employee's side */
export interface EmployeeAssignment {
  id: string;
  status: AssignmentStatus;
  assignedAt: string;
  returnedAt: string | null;
  returnCondition: AssetCondition | null;
  notes: string | null;
  returnNotes: string | null;
  asset: {
    id: string;
    assetCode: string;
    name: string;
    status: AssetStatus;
    category: { id: string; name: string };
  };
}
