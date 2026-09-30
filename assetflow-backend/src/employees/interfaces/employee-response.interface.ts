import type { EmployeeStatus } from '../../generated/prisma/enums';

export interface EmployeeResponse {
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
  createdAt: Date;
  updatedAt: Date;
}
