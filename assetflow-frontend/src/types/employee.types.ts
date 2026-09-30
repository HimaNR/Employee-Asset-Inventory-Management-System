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

export type EmployeeQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: EmployeeStatus;
  department?: string;
  sortBy?: 'employeeCode' | 'firstName' | 'lastName' | 'department' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};
