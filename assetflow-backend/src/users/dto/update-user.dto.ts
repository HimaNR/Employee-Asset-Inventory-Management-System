import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { UserStatus } from '../../generated/prisma/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  /** null unlinks the employee */
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string | null;
}
