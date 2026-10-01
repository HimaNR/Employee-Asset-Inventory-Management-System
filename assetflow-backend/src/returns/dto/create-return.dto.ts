import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { AssetCondition } from '../../generated/prisma/enums';

/** Body from the assessment brief: assignmentId, returnedAt, condition, notes */
export class CreateReturnDto {
  /** The ACTIVE assignment being closed */
  @IsUUID()
  assignmentId!: string;

  /** When the asset came back (ISO date-time). Defaults to now. */
  @ApiPropertyOptional({ example: '2026-10-20T09:15:00.000Z' })
  @IsOptional()
  @IsISO8601({ strict: true })
  returnedAt?: string;

  /** Condition on return. DAMAGED makes the asset DAMAGED, anything else AVAILABLE. */
  @ApiProperty({ enum: AssetCondition, example: 'GOOD' })
  @IsIn(Object.values(AssetCondition))
  condition!: AssetCondition;

  @ApiPropertyOptional({ example: 'Returned during employee device upgrade' })
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
