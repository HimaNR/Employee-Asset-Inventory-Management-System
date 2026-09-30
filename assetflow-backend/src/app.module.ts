import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetHistoryModule } from './asset-history/asset-history.module';
import { AssetsModule } from './assets/assets.module';
import { CategoriesModule } from './categories/categories.module';
import configuration from './config/configuration';
import { validate } from './config/environment.validation';
import { EmployeesModule } from './employees/employees.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      cache: true,
    }),
    PrismaModule,
    HealthModule,
    CategoriesModule,
    AssetHistoryModule,
    AssetsModule,
    EmployeesModule,
  ],
})
export class AppModule {}
