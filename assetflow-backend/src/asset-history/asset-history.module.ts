import { Module } from '@nestjs/common';
import { AssetHistoryController } from './asset-history.controller';
import { AssetHistoryService } from './asset-history.service';

@Module({
  controllers: [AssetHistoryController],
  providers: [AssetHistoryService],
  exports: [AssetHistoryService],
})
export class AssetHistoryModule {}
