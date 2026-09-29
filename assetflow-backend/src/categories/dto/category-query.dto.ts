import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ToBoolean, TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export const CATEGORY_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;
export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[number];

export class CategoryQueryDto extends PaginationQueryDto {
  /** Search in name and description (case-insensitive) */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Filter by active state */
  @ToBoolean()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Field to sort by */
  @ApiPropertyOptional({ enum: CATEGORY_SORT_FIELDS, default: 'name' })
  @IsOptional()
  @IsIn(CATEGORY_SORT_FIELDS)
  sortBy: CategorySortField = 'name';
}
