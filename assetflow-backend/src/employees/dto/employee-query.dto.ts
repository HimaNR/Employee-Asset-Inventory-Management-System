import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { PaginationQueryDto, SORT_ORDERS, type SortOrder } from '../../common/dto/pagination-query.dto';
import { EmployeeStatus } from '../../generated/prisma/enums';

export const EMPLOYEE_SORT_FIELDS = [
  'employeeCode',
  'firstName',
  'lastName',
  'department',
  'createdAt',
] as const;
export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number];

export class EmployeeQueryDto extends PaginationQueryDto {
  /** Search code, first/last name, email, department and designation */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsIn(Object.values(EmployeeStatus))
  status?: EmployeeStatus;

  /** Exact department name, e.g. "Engineering" */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ enum: EMPLOYEE_SORT_FIELDS, default: 'firstName' })
  @IsOptional()
  @IsIn(EMPLOYEE_SORT_FIELDS)
  sortBy: EmployeeSortField = 'firstName';

  /** People lists read best A to Z, so the default is ascending */
  @ApiPropertyOptional({ enum: SORT_ORDERS, default: 'asc' })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  override sortOrder: SortOrder = 'asc';
}
