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
import { AssetsService } from './assets.service';
import { AssetQueryDto } from './dto/asset-query.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /** List assets with search, filters, sorting and pagination */
  @Get()
  findAll(@Query() query: AssetQueryDto) {
    return this.assetsService.findAll(query);
  }

  /** One asset with its category and current assignment */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  /** Register a new asset (status starts as AVAILABLE) */
  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  /** Update editable fields (not assetCode, status or isActive) */
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(id, dto);
  }

  /** Soft-delete: hide from new assignments, keep all history */
  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.deactivate(id);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.reactivate(id);
  }
}
