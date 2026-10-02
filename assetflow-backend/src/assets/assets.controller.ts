import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AssetsService } from './assets.service';
import { AssetQueryDto } from './dto/asset-query.dto';
import { BulkCreateAssetsDto, NextCodeQueryDto } from './dto/bulk-create-assets.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /** List assets with search, filters, sorting and pagination */
  @Get()
  @Permissions(PERMISSIONS.ASSETS_READ)
  findAll(@Query() query: AssetQueryDto) {
    return this.assetsService.findAll(query);
  }

  /** One asset with its category and current assignment */
  /** Next free code for a prefix (preview for bulk registration). Declared before ':id'. */
  @Get('next-code')
  @Permissions(PERMISSIONS.ASSETS_WRITE)
  nextCode(@Query() query: NextCodeQueryDto) {
    return this.assetsService.nextCode(query.prefix);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ASSETS_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  /** Register a new asset (status starts as AVAILABLE) */
  /** Register up to 100 identical assets at once (e.g. 10 keyboards) */
  @Post('bulk')
  @Permissions(PERMISSIONS.ASSETS_WRITE)
  bulkCreate(@Body() dto: BulkCreateAssetsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.bulkCreate(dto, user.id);
  }

  @Post()
  @Permissions(PERMISSIONS.ASSETS_WRITE)
  create(@Body() dto: CreateAssetDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.create(dto, user.id);
  }

  /** Update editable fields (not assetCode, status or isActive) */
  @Patch(':id')
  @Permissions(PERMISSIONS.ASSETS_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.update(id, dto, user.id);
  }

  /** Soft-delete: hide from new assignments, keep all history */
  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions(PERMISSIONS.ASSETS_WRITE)
  deactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.deactivate(id, user.id);
  }

  /** Mark damaged / under repair / lost / retired (allowed transitions only) */
  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @Permissions(PERMISSIONS.ASSETS_STATUS)
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.changeStatus(id, dto, user.id);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions(PERMISSIONS.ASSETS_WRITE)
  reactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.reactivate(id, user.id);
  }
}
