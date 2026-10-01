import type { AssignmentRecord } from './assignment.select';
import type { AssignmentResponse } from './interfaces/assignment-response.interface';

/** Database record -> public API shape (shared by Assignments and Returns) */
export function toAssignmentResponse(record: AssignmentRecord): AssignmentResponse {
  const { employee, ...assignment } = record;
  return {
    ...assignment,
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: `${employee.firstName} ${employee.lastName}`,
      status: employee.status,
    },
  };
}
