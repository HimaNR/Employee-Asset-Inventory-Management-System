import { Module } from '@nestjs/common';
import { AssetHistoryModule } from '../asset-history/asset-history.module';
import { CategoriesModule } from '../categories/categories.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [CategoriesModule, AssetHistoryModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
