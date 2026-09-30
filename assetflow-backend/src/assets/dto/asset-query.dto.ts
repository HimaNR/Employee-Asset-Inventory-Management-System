import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ToBoolean, TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssetCondition, AssetStatus } from '../../generated/prisma/enums';

export const ASSET_SORT_FIELDS = [
  'assetCode',
  'name',
  'status',
  'condition',
  'purchaseDate',
  'createdAt',
  'updatedAt',
] as const;
export type AssetSortField = (typeof ASSET_SORT_FIELDS)[number];

export class AssetQueryDto extends PaginationQueryDto {
  /** Search asset code, name, serial number, brand and model */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsIn(Object.values(AssetStatus))
  status?: AssetStatus;

  @ApiPropertyOptional({ enum: AssetCondition })
  @IsOptional()
  @IsIn(Object.values(AssetCondition))
  condition?: AssetCondition;

  /** Only assets in this category */
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  /** Only assets currently assigned to this employee */
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  /** true = active only, false = deactivated only, empty = all */
  @ToBoolean()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ASSET_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(ASSET_SORT_FIELDS)
  sortBy: AssetSortField = 'createdAt';
}
