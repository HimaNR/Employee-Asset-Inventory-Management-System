import { Module } from '@nestjs/common';
import { AssetHistoryModule } from '../asset-history/asset-history.module';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

@Module({
  imports: [AssetHistoryModule],
  controllers: [ReturnsController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
