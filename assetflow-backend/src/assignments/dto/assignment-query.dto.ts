import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssignmentStatus } from '../../generated/prisma/enums';

export const ASSIGNMENT_SORT_FIELDS = ['assignedAt', 'returnedAt', 'createdAt'] as const;
export type AssignmentSortField = (typeof ASSIGNMENT_SORT_FIELDS)[number];

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class AssignmentQueryDto extends PaginationQueryDto {
  /** Search asset code/name and employee name/code */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: AssignmentStatus })
  @IsOptional()
  @IsIn(Object.values(AssignmentStatus))
  status?: AssignmentStatus;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  /** Assigned on or after this day (YYYY-MM-DD) */
  @IsOptional()
  @Matches(DATE_ONLY, { message: 'from must be a date in YYYY-MM-DD format' })
  from?: string;

  /** Assigned on or before this day (YYYY-MM-DD) */
  @IsOptional()
  @Matches(DATE_ONLY, { message: 'to must be a date in YYYY-MM-DD format' })
  to?: string;

  @ApiPropertyOptional({ enum: ASSIGNMENT_SORT_FIELDS, default: 'assignedAt' })
  @IsOptional()
  @IsIn(ASSIGNMENT_SORT_FIELDS)
  sortBy: AssignmentSortField = 'assignedAt';
}
