import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TrimUpper } from '../../common/decorators/transform.decorators';
import { CreateAssetDto } from './create-asset.dto';

export const MAX_BULK_QUANTITY = 100;

/**
 * Register many identical assets at once (e.g. 10 keyboards).
 * Shared fields come from CreateAssetDto; codes are generated as PREFIX-0001, PREFIX-0002, ...
 */
export class BulkCreateAssetsDto extends OmitType(CreateAssetDto, [
  'assetCode',
  'serialNumber',
] as const) {
  /** Code prefix, e.g. "KEY" gives KEY-0001, KEY-0002 ... (continues after the highest existing number) */
  @ApiProperty({ example: 'KEY' })
  @TrimUpper()
  @Matches(/^[A-Z0-9]{2,10}$/, {
    message: 'codePrefix must be 2 to 10 letters or numbers (e.g. KEY)',
  })
  codePrefix!: string;

  @ApiProperty({ minimum: 1, maximum: MAX_BULK_QUANTITY, example: 10 })
  @IsInt()
  @Min(1)
  @Max(MAX_BULK_QUANTITY)
  quantity!: number;

  /** Optional: one serial per asset, in order (must match quantity when given) */
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_BULK_QUANTITY)
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((v) => (typeof v === 'string' ? v.trim() : v)).filter((v) => v !== '')
      : value,
  )
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  serialNumbers?: string[];
}

export class NextCodeQueryDto {
  @ApiProperty({ example: 'KEY' })
  @TrimUpper()
  @Matches(/^[A-Z0-9]{2,10}$/, {
    message: 'prefix must be 2 to 10 letters or numbers (e.g. KEY)',
  })
  prefix!: string;
}
