import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CategoriesService } from './categories.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Permissions(PERMISSIONS.CATEGORIES_READ)
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.CATEGORIES_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @Permissions(PERMISSIONS.CATEGORIES_WRITE)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CATEGORIES_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }
}
