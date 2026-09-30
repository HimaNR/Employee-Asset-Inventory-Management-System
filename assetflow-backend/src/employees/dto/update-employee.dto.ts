import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

/**
 * Every field is optional except employeeCode, which cannot change
 * (it links the person to HR records and past assignments).
 * Status changes only through /deactivate and /reactivate.
 */
export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['employeeCode'] as const),
) {}
