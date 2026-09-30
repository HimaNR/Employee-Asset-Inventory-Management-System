import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AssetHistoryService } from './asset-history.service';

@ApiTags('Asset History')
@Controller('assets/:assetId/history')
export class AssetHistoryController {
  constructor(private readonly assetHistoryService: AssetHistoryService) {}

  /** Lifecycle timeline of one asset (newest first by default) */
  @Get()
  findByAsset(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.assetHistoryService.findByAsset(assetId, query);
  }
}
