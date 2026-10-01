import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetHistoryModule } from './asset-history/asset-history.module';
import { AssetsModule } from './assets/assets.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CategoriesModule } from './categories/categories.module';
import configuration from './config/configuration';
import { validate } from './config/environment.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeesModule } from './employees/employees.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReturnsModule } from './returns/returns.module';

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
    AssignmentsModule,
    ReturnsModule,
    DashboardModule,
  ],
})
export class AppModule {}
