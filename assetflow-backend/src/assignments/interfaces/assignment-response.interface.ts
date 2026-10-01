import type {
  AssetCondition,
  AssetStatus,
  AssignmentStatus,
  EmployeeStatus,
} from '../../generated/prisma/enums';

export interface AssignmentResponse {
  id: string;
  status: AssignmentStatus;
  assignedAt: Date;
  returnedAt: Date | null;
  returnCondition: AssetCondition | null;
  notes: string | null;
  returnNotes: string | null;
  createdAt: Date;
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
