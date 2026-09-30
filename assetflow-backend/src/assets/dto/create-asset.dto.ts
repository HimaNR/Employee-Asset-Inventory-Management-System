import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Trim,
  TrimOrUndefined,
  TrimUpper,
} from '../../common/decorators/transform.decorators';
import { AssetCondition } from '../../generated/prisma/enums';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = '$property must be a date in YYYY-MM-DD format';

export class CreateAssetDto {
  /** Unique asset tag, e.g. "LAP-0012" (stored in upper case) */
  @TrimUpper()
  @IsString()
  @Length(3, 30)
  @Matches(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, {
    message: 'assetCode may only contain letters, numbers and single dashes (e.g. LAP-0012)',
  })
  assetCode!: string;

  /** Display name, e.g. "Dell Latitude 5450" */
  @Trim()
  @IsString()
  @Length(2, 120)
  name!: string;

  /** Manufacturer serial number (unique when present) */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string | null;

  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string | null;

  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  model?: string | null;

  /** Category id (must be an active category) */
  @IsUUID()
  categoryId!: string;

  /** Physical condition (default GOOD) */
  @ApiPropertyOptional({ enum: AssetCondition, default: AssetCondition.GOOD })
  @IsOptional()
  @IsIn(Object.values(AssetCondition))
  condition?: AssetCondition;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @Matches(DATE_ONLY, { message: DATE_MESSAGE })
  @IsDateString({ strict: true })
  purchaseDate?: string | null;

  /** Price with max 2 decimals, e.g. 1250.00 */
  @ApiPropertyOptional({ example: 1250 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(9_999_999_999.99)
  purchasePrice?: number | null;

  @ApiPropertyOptional({ example: '2029-09-01' })
  @IsOptional()
  @Matches(DATE_ONLY, { message: DATE_MESSAGE })
  @IsDateString({ strict: true })
  warrantyExpiryDate?: string | null;

  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
