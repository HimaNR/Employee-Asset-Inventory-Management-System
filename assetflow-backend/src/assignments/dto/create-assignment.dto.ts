import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TrimOrUndefined } from '../../common/decorators/transform.decorators';

export class CreateAssignmentDto {
  /** The asset to hand over (must be AVAILABLE and active) */
  @IsUUID()
  assetId!: string;

  /** The employee receiving it (must be ACTIVE) */
  @IsUUID()
  employeeId!: string;

  /** When the hand-over happened (ISO date-time). Defaults to now; cannot be in the future. */
  @ApiPropertyOptional({ example: '2026-10-01T04:30:00.000Z' })
  @IsOptional()
  @IsISO8601({ strict: true })
  assignedAt?: string;

  @ApiPropertyOptional({ example: 'Primary work laptop' })
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
