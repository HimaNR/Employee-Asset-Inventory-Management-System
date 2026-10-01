import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { AssetStatus } from '../../generated/prisma/enums';

export class ChangeStatusDto {
  /** Target status; must be an allowed next step from the current status */
  @ApiProperty({ enum: AssetStatus, example: 'UNDER_REPAIR' })
  @IsIn(Object.values(AssetStatus))
  status!: AssetStatus;

  /** Why, e.g. "Sent to Dell service centre" */
  @ApiPropertyOptional()
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
