import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import {
  Trim,
  TrimOrUndefined,
  TrimUpper,
} from '../../common/decorators/transform.decorators';

export class CreateEmployeeDto {
  /** Unique HR code, e.g. "EMP-007" (stored in upper case) */
  @TrimUpper()
  @IsString()
  @Length(3, 20)
  @Matches(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, {
    message: 'employeeCode may only contain letters, numbers and single dashes (e.g. EMP-007)',
  })
  employeeCode!: string;

  @Trim()
  @IsString()
  @Length(1, 60)
  firstName!: string;

  @Trim()
  @IsString()
  @Length(1, 60)
  lastName!: string;

  /** Work email (unique, stored in lower case) */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string | null;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string | null;
}
