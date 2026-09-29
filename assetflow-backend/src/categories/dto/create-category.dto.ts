import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Trim, TrimOrUndefined } from '../../common/decorators/transform.decorators';

export class CreateCategoryDto {
  /** Unique category name, e.g. "Laptop" */
  @Trim()
  @IsString()
  @Length(2, 50)
  name!: string;

  /** Optional short description */
  @TrimOrUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
