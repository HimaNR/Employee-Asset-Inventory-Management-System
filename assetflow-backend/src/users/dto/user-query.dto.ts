import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TrimOrUndefined } from '../../common/decorators/transform.decorators';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserStatus } from '../../generated/prisma/enums';

export const USER_SORT_FIELDS = ['email', 'createdAt', 'lastLoginAt'] as const;
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export class UserQueryDto extends PaginationQueryDto {
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  @ApiPropertyOptional({ enum: USER_SORT_FIELDS, default: 'email' })
  @IsOptional()
  @IsIn(USER_SORT_FIELDS)
  sortBy: UserSortField = 'email';
}
