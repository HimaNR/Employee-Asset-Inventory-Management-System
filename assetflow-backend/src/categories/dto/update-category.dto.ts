import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  /** Set false to deactivate (hidden from new asset forms), true to reactivate */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
