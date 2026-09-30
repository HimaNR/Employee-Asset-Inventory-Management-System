import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { paginate, toSkipTake } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { categorySelect, type CategoryRecord } from './category.select';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './interfaces/category-response.interface';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CategoryQueryDto): Promise<PaginatedResponse<CategoryResponse>> {
    const where: Prisma.AssetCategoryWhereInput = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Count + page in ONE round trip, consistent with each other
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.assetCategory.count({ where }),
      this.prisma.assetCategory.findMany({
        where,
        select: categorySelect,
        orderBy: { [query.sortBy]: query.sortOrder },
        ...toSkipTake(query.page, query.limit),
      }),
    ]);

    return paginate(rows.map(toCategoryResponse), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<CategoryResponse> {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
      select: categorySelect,
    });
    if (!category) {
      throw categoryNotFound(id);
    }
    return toCategoryResponse(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    await this.assertNameAvailable(dto.name);

    const category = await this.prisma.assetCategory.create({
      data: dto,
      select: categorySelect,
    });
    return toCategoryResponse(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    await this.findOne(id); // 404 if it does not exist
    if (dto.name) {
      await this.assertNameAvailable(dto.name, id);
    }

    const category = await this.prisma.assetCategory.update({
      where: { id },
      data: dto,
      select: categorySelect,
    });
    return toCategoryResponse(category);
  }

  /** Used by other modules (Assets): the category must exist AND be active */
  async assertUsable(id: string): Promise<void> {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
      select: { name: true, isActive: true },
    });
    if (!category) {
      throw categoryNotFound(id);
    }
    if (!category.isActive) {
      throw new UnprocessableEntityException({
        type: 'category-inactive',
        title: 'Category is inactive',
        detail: `Category "${category.name}" is deactivated and cannot be used for assets.`,
      });
    }
  }

  /** Names are unique regardless of case: "laptop" clashes with "Laptop" */
  private async assertNameAvailable(name: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.assetCategory.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        type: 'category-name-taken',
        title: 'Category name already exists',
        detail: `A category named "${name}" already exists.`,
      });
    }
  }
}

// ---------- helpers ----------

function toCategoryResponse(record: CategoryRecord): CategoryResponse {
  const { _count, ...category } = record;
  return { ...category, assetCount: _count.assets };
}

function categoryNotFound(id: string): NotFoundException {
  return new NotFoundException({
    type: 'category-not-found',
    title: 'Category not found',
    detail: `No category exists with id ${id}.`,
  });
}
