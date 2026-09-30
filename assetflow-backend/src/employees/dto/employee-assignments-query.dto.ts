import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssignmentStatus } from '../../generated/prisma/enums';

export class EmployeeAssignmentsQueryDto extends PaginationQueryDto {
  /** ACTIVE = assets held right now, RETURNED = past assignments */
  @ApiPropertyOptional({ enum: AssignmentStatus })
  @IsOptional()
  @IsIn(Object.values(AssignmentStatus))
  status?: AssignmentStatus;
}
